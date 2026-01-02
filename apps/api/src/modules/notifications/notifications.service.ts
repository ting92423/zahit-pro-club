import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForMember(
    memberId: string,
    opts?: {
      take?: number;
      cursor?: string;
      unreadOnly?: boolean;
      type?: string;
      sort?: 'latest' | 'unread';
    },
  ) {
    const take = Math.min(100, Math.max(1, Number(opts?.take ?? 20)));
    const sort = opts?.sort ?? 'latest';

    const where: any = {
      OR: [
        { memberId },
        { memberId: null }, // legacy broadcast (should be rare after per-member broadcast rollout)
      ],
      ...(opts?.unreadOnly ? { isRead: false } : {}),
      ...(opts?.type ? { type: String(opts.type) } : {}),
    };

    return this.prisma.notification.findMany({
      where,
      orderBy:
        sort === 'unread'
          ? [{ isRead: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }]
          : [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });
  }

  async markAsRead(id: string, memberId: string) {
    return this.prisma.notification.updateMany({
      where: { id, memberId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(memberId: string) {
    return this.prisma.notification.updateMany({
      where: { memberId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(data: {
    memberId?: string;
    title: string;
    content: string;
    type?: string;
  }) {
    const type = data.type || 'SYSTEM';

    // If targeting a single member, keep it simple.
    if (data.memberId) {
      return this.prisma.notification.create({
        data: {
          memberId: data.memberId,
          title: data.title,
          content: data.content,
          type,
        },
      });
    }

    // Broadcast: create one notification per member so isRead is per-member (not global).
    const members = await this.prisma.member.findMany({ select: { id: true } });
    if (members.length === 0) {
      // fallback: keep a system record
      return this.prisma.notification.create({
        data: {
          memberId: null,
          title: data.title,
          content: data.content,
          type,
        },
      });
    }

    await this.prisma.notification.createMany({
      data: members.map((m) => ({
        memberId: m.id,
        title: data.title,
        content: data.content,
        type,
      })),
    });

    // Return a lightweight response (no single created id for createMany)
    return { broadcast: true, count: members.length };
  }

  async listAdmin() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { member: { select: { name: true, email: true } } },
    });
  }
}
