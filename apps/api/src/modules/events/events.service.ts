import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TIER_THRESHOLDS } from '@zahit/shared';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: {
    title: string;
    description?: string;
    location?: string;
    eventDate: string;
    maxSlots: number;
    price: number;
    minTier?: string;
  }) {
    return this.prisma.event.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        minTier: data.minTier || 'GUEST',
      },
    });
  }

  async listPublicEvents() {
    return this.prisma.event.findMany({
      where: { isActive: true, eventDate: { gte: new Date() } },
      orderBy: { eventDate: 'asc' },
    });
  }

  async getPublicEvent(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, isActive: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async listAdminEvents() {
    return this.prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        eventDate: true,
        maxSlots: true,
        currentSlots: true,
        price: true,
        minTier: true,
        isActive: true,
      },
    });
  }

  async getRegistrations(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const regs = await this.prisma.eventRegistration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });

    return { event, registrations: regs };
  }

  async register(
    eventId: string,
    input: { name: string; phone: string; email: string; memberId?: string },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.currentSlots >= event.maxSlots && event.maxSlots > 0) {
      throw new BadRequestException('Event is full');
    }

    // 等級檢查
    if (event.minTier && event.minTier !== 'GUEST') {
      if (!input.memberId) {
        throw new BadRequestException(
          `此任務僅限 ${event.minTier} 等級以上會員報名`,
        );
      }
      const member = await this.prisma.member.findUnique({
        where: { id: input.memberId },
      });
      if (!member) throw new NotFoundException('Member not found');

      const userTierScore =
        TIER_THRESHOLDS[member.tier as keyof typeof TIER_THRESHOLDS] ?? 0;
      const requiredTierScore =
        TIER_THRESHOLDS[event.minTier as keyof typeof TIER_THRESHOLDS] ?? 0;

      if (userTierScore < requiredTierScore) {
        throw new BadRequestException(
          `您的等級不足（需要 ${event.minTier} 以上）`,
        );
      }
    }

    const qrToken = randomBytes(16).toString('hex');

    return await this.prisma.$transaction(async (tx) => {
      // 1. 建立報名紀錄
      const reg = await tx.eventRegistration.create({
        data: {
          eventId,
          memberId: input.memberId,
          name: input.name,
          phone: input.phone,
          email: input.email,
          qrToken,
          status: event.price > 0 ? 'REGISTERED' : 'PAID', // 免費活動直接設為已付費狀態
        },
      });

      // 2. 更新名額
      await tx.event.update({
        where: { id: eventId },
        data: { currentSlots: { increment: 1 } },
      });

      return reg;
    });
  }

  async checkIn(qrToken: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { qrToken },
      include: { event: true },
    });

    if (!reg) throw new NotFoundException('Invalid QR code');
    if (reg.status === 'CHECKED_IN')
      throw new BadRequestException('Already checked in');
    // 這裡可加邏輯：若未付款不能報到 (待電商/金流模組整合)

    return this.prisma.eventRegistration.update({
      where: { id: reg.id },
      data: { status: 'CHECKED_IN' },
    });
  }
}
