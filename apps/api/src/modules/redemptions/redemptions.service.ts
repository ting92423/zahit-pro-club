import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PointTransactionType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RedemptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicItems() {
    return this.prisma.redemptionItem.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { pointsCost: 'asc' },
    });
  }

  async redeem(memberId: string, itemId: string) {
    const item = await this.prisma.redemptionItem.findUnique({
      where: { id: itemId },
    });
    if (!item || !item.isActive || item.stock <= 0) {
      throw new BadRequestException('Item unavailable');
    }

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member || member.pointsBalance < item.pointsCost) {
      throw new BadRequestException('Insufficient credits');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Deduct credits
      await tx.member.update({
        where: { id: memberId },
        data: { pointsBalance: { decrement: item.pointsCost } },
      });

      // 2. Log points
      await tx.pointLedger.create({
        data: {
          memberId,
          type: PointTransactionType.REDEEM,
          pointsDelta: -item.pointsCost,
          reason: `兌換品項：${item.title}`,
          refType: 'REDEMPTION',
        },
      });

      // 3. Deduct stock
      await tx.redemptionItem.update({
        where: { id: itemId },
        data: { stock: { decrement: 1 } },
      });

      // 4. Create redemption voucher
      const qrToken = randomBytes(16).toString('hex');
      const redemption = await tx.redemption.create({
        data: {
          memberId,
          itemId,
          qrToken,
          status: 'ISSUED',
        },
        include: { item: true },
      });

      return redemption;
    });
  }

  async verify(qrToken: string) {
    const r = await this.prisma.redemption.findUnique({
      where: { qrToken },
      include: { item: true, member: true },
    });
    if (!r) throw new NotFoundException('Voucher not found');
    if (r.status !== 'ISSUED')
      throw new BadRequestException('Voucher already used or void');

    const updated = await this.prisma.redemption.update({
      where: { id: r.id },
      data: { status: 'REDEEMED', redeemedAt: new Date() },
    });

    return { redemption: updated, item: r.item, member: r.member };
  }

  async listAdminItems() {
    return this.prisma.redemptionItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createItem(data: any) {
    return this.prisma.redemptionItem.create({ data });
  }

  async updateItem(id: string, data: any) {
    return this.prisma.redemptionItem.update({ where: { id }, data });
  }
}
