import { Injectable, NotFoundException } from '@nestjs/common';
import { Member, PointTransactionType, Prisma } from '@prisma/client';
import { getTierBySpent } from '@zahit/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMember(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        pointLedgers: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async listMembers(q?: string) {
    const where: Prisma.MemberWhereInput = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ];
    }
    return this.prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async adjustPoints(memberId: string, input: { points_delta: number; reason?: string }) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const delta = Number(input.points_delta);
    if (!Number.isFinite(delta) || !Number.isInteger(delta) || delta === 0) {
      throw new Error('points_delta must be a non-zero integer');
    }

    const reason = (input.reason ?? '').trim() || 'Admin 調整';

    return await this.prisma.$transaction(async (tx) => {
      await tx.pointLedger.create({
        data: {
          memberId,
          type: PointTransactionType.ADJUST,
          pointsDelta: delta,
          reason,
          refType: 'ADMIN_ADJUST',
          refId: null,
        },
      });

      const updated = await tx.member.update({
        where: { id: memberId },
        data: { pointsBalance: { increment: delta } },
        include: { pointLedgers: { orderBy: { createdAt: 'desc' }, take: 20 } },
      });

      return {
        id: updated.id,
        tier: updated.tier,
        points_balance: updated.pointsBalance,
        total_spent: updated.totalSpent,
        point_ledger: updated.pointLedgers.map((p) => ({
          type: p.type,
          points_delta: p.pointsDelta,
          reason: p.reason,
          created_at: p.createdAt,
        })),
      };
    });
  }

  async updateMember(id: string, data: { name?: string; phone?: string; tier?: string }) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.member.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.tier ? { tier: data.tier } : {}),
      },
    });
  }

  /**
   * 依據訂單發放點數
   */
  async awardPointsForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { member: true },
    });

    if (!order || !order.memberId) return;

    // 避免重複發放（檢查 refId）
    const existing = await this.prisma.pointLedger.findFirst({
      where: {
        memberId: order.memberId,
        refType: 'ORDER',
        refId: order.id,
        type: PointTransactionType.EARN,
      },
    });
    if (existing) return;

    // 規則：1元 = 1點（未來可從設定讀取）
    const pointsDelta = order.totalAmount;

    return await this.prisma.$transaction(async (tx) => {
      // 1. 建立流水
      await tx.pointLedger.create({
        data: {
          memberId: order.memberId!,
          type: PointTransactionType.EARN,
          pointsDelta,
          reason: `訂單完成贈點：${order.orderNumber}`,
          refType: 'ORDER',
          refId: order.id,
        },
      });

      // 2. 更新會員餘額與總消費
      const updatedMember = await tx.member.update({
        where: { id: order.memberId! },
        data: {
          pointsBalance: { increment: pointsDelta },
          totalSpent: { increment: order.totalAmount },
        },
      });

      // 3. 評估升級
      await this.evaluateTierInternal(tx, updatedMember);
    });
  }

  /**
   * 內部評估升級邏輯
   */
  private async evaluateTierInternal(tx: Prisma.TransactionClient, member: Member) {
    const nextTier = getTierBySpent(member.totalSpent);

    if (nextTier !== member.tier) {
      await tx.member.update({
        where: { id: member.id },
        data: { tier: nextTier },
      });
      // 這裡可以發送通知 (Milestone 3)
    }
  }
}
