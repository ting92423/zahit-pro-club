import { BadRequestException, Body, Controller, Get, Patch, Query, Req } from '@nestjs/common';
import { TIER_BENEFITS } from '@zahit/shared';
import { Roles } from '../rbac/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

type RequestWithUser = { user?: { memberId?: string } };

@Controller('me')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  private parseTake(take?: string) {
    const n = Number(take ?? 20);
    return Math.min(100, Math.max(1, Number.isFinite(n) ? n : 20));
  }

  @Roles('MEMBER')
  @Get()
  async getMe(@Req() req: RequestWithUser) {
    const memberId = req.user?.memberId;
    if (!memberId) return { data: null };

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        pointLedgers: { orderBy: { createdAt: 'desc' }, take: 20 },
        eventRegistrations: { orderBy: { createdAt: 'desc' }, take: 20, include: { event: true } },
        orders: { orderBy: { createdAt: 'desc' }, take: 20 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
        redemptions: { orderBy: { createdAt: 'desc' }, take: 20, include: { item: true } },
      },
    });

    return {
      data: member
        ? {
            id: member.id,
            name: member.name,
            phone: member.phone,
            email: member.email,
            address: member.address ?? null,
            car: {
              brand: member.carBrand ?? null,
              model: member.carModel ?? null,
              year: member.carYear ?? null,
              plate: member.carPlate ?? null,
            },
            preferences: member.preferences ?? null,
            tier: member.tier,
            benefits: TIER_BENEFITS[member.tier as keyof typeof TIER_BENEFITS] ?? [],
            points_balance: member.pointsBalance,
            total_spent: member.totalSpent,
            notifications: member.notifications.map((n) => ({
              id: n.id,
              title: n.title,
              content: n.content,
              type: n.type,
              is_read: n.isRead,
              created_at: n.createdAt,
            })),
            redemptions: member.redemptions.map((r) => ({
              id: r.id,
              status: r.status,
              qr_token: r.qrToken,
              redeemed_at: r.redeemedAt,
              created_at: r.createdAt,
              item: { title: r.item.title, description: r.item.description },
            })),
            point_ledger: member.pointLedgers.map((p) => ({
              id: p.id,
              type: p.type,
              points_delta: p.pointsDelta,
              reason: p.reason,
              created_at: p.createdAt,
            })),
            orders: member.orders.map((o) => ({
              id: o.id,
              order_number: o.orderNumber,
              status: o.status,
              total_amount: o.totalAmount,
              created_at: o.createdAt,
            })),
            registrations: member.eventRegistrations.map((r) => ({
              id: r.id,
              status: r.status,
              qr_token: r.qrToken,
              created_at: r.createdAt,
              event: {
                id: r.event.id,
                title: r.event.title,
                event_date: r.event.eventDate,
                location: r.event.location,
              },
            })),
          }
        : null,
    };
  }

  @Roles('MEMBER')
  @Get('orders')
  async listMyOrders(
    @Req() req: RequestWithUser,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const memberId = req.user?.memberId;
    if (!memberId) return { data: [], meta: { nextCursor: null } };

    const rows = await this.prisma.order.findMany({
      where: { memberId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: this.parseTake(take),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const data = rows.map((o) => ({
      id: o.id,
      order_number: o.orderNumber,
      status: o.status,
      total_amount: o.totalAmount,
      created_at: o.createdAt,
    }));
    return { data, meta: { nextCursor: data.length ? data[data.length - 1].id : null } };
  }

  @Roles('MEMBER')
  @Get('registrations')
  async listMyRegistrations(
    @Req() req: RequestWithUser,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const memberId = req.user?.memberId;
    if (!memberId) return { data: [], meta: { nextCursor: null } };

    const rows = await this.prisma.eventRegistration.findMany({
      where: { memberId },
      include: { event: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: this.parseTake(take),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const data = rows.map((r) => ({
      id: r.id,
      status: r.status,
      qr_token: r.qrToken,
      created_at: r.createdAt,
      event: {
        id: r.event.id,
        title: r.event.title,
        event_date: r.event.eventDate,
        location: r.event.location,
      },
    }));

    return { data, meta: { nextCursor: data.length ? data[data.length - 1].id : null } };
  }

  @Roles('MEMBER')
  @Get('redemptions')
  async listMyRedemptions(
    @Req() req: RequestWithUser,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const memberId = req.user?.memberId;
    if (!memberId) return { data: [], meta: { nextCursor: null } };

    const rows = await this.prisma.redemption.findMany({
      where: { memberId },
      include: { item: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: this.parseTake(take),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const data = rows.map((r) => ({
      id: r.id,
      status: r.status,
      qr_token: r.qrToken,
      redeemed_at: r.redeemedAt,
      created_at: r.createdAt,
      item: { title: r.item.title, description: r.item.description },
    }));

    return { data, meta: { nextCursor: data.length ? data[data.length - 1].id : null } };
  }

  @Roles('MEMBER')
  @Get('ledger')
  async listMyLedger(
    @Req() req: RequestWithUser,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const memberId = req.user?.memberId;
    if (!memberId) return { data: [], meta: { nextCursor: null } };

    const rows = await this.prisma.pointLedger.findMany({
      where: { memberId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: this.parseTake(take),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const data = rows.map((p) => ({
      id: p.id,
      type: p.type,
      points_delta: p.pointsDelta,
      reason: p.reason,
      created_at: p.createdAt,
    }));

    return { data, meta: { nextCursor: data.length ? data[data.length - 1].id : null } };
  }

  @Roles('MEMBER')
  @Patch()
  async updateMe(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      name?: string;
      phone?: string;
      address?: string;
      car?: { brand?: string; model?: string; year?: number; plate?: string };
      preferences?: any;
    },
  ) {
    const memberId = req.user?.memberId;
    if (!memberId) return { data: null };

    const name = body?.name?.trim();
    const phone = body?.phone?.trim();
    const address = body?.address?.trim();

    const carBrand = body?.car?.brand?.trim();
    const carModel = body?.car?.model?.trim();
    const carPlate = body?.car?.plate?.trim();
    const carYear = body?.car?.year;

    if (name !== undefined && (name.length < 2 || name.length > 50)) {
      throw new BadRequestException('Invalid name');
    }
    if (phone !== undefined && (phone.length < 8 || phone.length > 20)) {
      throw new BadRequestException('Invalid phone');
    }
    if (address !== undefined && address.length > 200) {
      throw new BadRequestException('Invalid address');
    }
    if (carBrand !== undefined && carBrand.length > 50) throw new BadRequestException('Invalid car brand');
    if (carModel !== undefined && carModel.length > 80) throw new BadRequestException('Invalid car model');
    if (carPlate !== undefined && carPlate.length > 20) throw new BadRequestException('Invalid car plate');
    if (carYear !== undefined && carYear !== null) {
      const y = Number(carYear);
      const now = new Date().getFullYear() + 1;
      if (!Number.isInteger(y) || y < 1950 || y > now) throw new BadRequestException('Invalid car year');
    }

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(carBrand !== undefined ? { carBrand } : {}),
        ...(carModel !== undefined ? { carModel } : {}),
        ...(carYear !== undefined ? { carYear: carYear === null ? null : Number(carYear) } : {}),
        ...(carPlate !== undefined ? { carPlate } : {}),
        ...(body.preferences !== undefined ? { preferences: body.preferences } : {}),
      },
    });

    return {
      data: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        address: updated.address ?? null,
        car: {
          brand: updated.carBrand ?? null,
          model: updated.carModel ?? null,
          year: updated.carYear ?? null,
          plate: updated.carPlate ?? null,
        },
        preferences: updated.preferences ?? null,
      },
    };
  }
}

