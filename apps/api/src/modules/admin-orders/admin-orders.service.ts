import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { MembersService } from '../members/members.service';

const ALLOWED_NEXT: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['UNPAID', 'CANCELLED'],
  UNPAID: ['PAID', 'CANCELLED'],
  PAID: ['FULFILLING', 'REFUNDING'],
  FULFILLING: ['SHIPPED', 'REFUNDING'],
  SHIPPED: ['COMPLETED', 'REFUNDING'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDING: ['REFUNDED'],
  REFUNDED: [],
};

function safeEmail(email: string) {
  return email.replace(/(^.).*(@.*$)/, '$1***$2');
}

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly members: MembersService,
  ) {}

  async list({ status, q }: { status?: string; q?: string }) {
    const where: any = {};
    if (status) {
      const parts = status
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const statuses = parts.filter((s) =>
        Object.values(OrderStatus).includes(s as any),
      ) as OrderStatus[];
      if (statuses.length === 1) where.status = statuses[0];
      if (statuses.length > 1) where.status = { in: statuses };
    }
    if (q) {
      const query = q.trim();
      where.OR = [
        { orderNumber: { contains: query } },
        { shippingEmail: { contains: query.toLowerCase() } },
        { shippingName: { contains: query } },
      ];
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 100,
    });

    return orders.map((o) => ({
      order_number: o.orderNumber,
      status: o.status,
      total_amount: o.totalAmount,
      created_at: o.createdAt,
      shipping: {
        name: o.shippingName,
        email: safeEmail(o.shippingEmail),
      },
      items_count: o.items.reduce((sum, it) => sum + it.qty, 0),
      shipping_carrier: o.shippingCarrier,
      shipping_tracking_no: o.shippingTrackingNo,
      shipped_at: o.shippedAt,
    }));
  }

  async get(orderNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber },
      include: {
        items: { include: { sku: { include: { product: true } } } },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      order_number: order.orderNumber,
      status: order.status,
      total_amount: order.totalAmount,
      created_at: order.createdAt,
      shipping: {
        name: order.shippingName,
        phone: order.shippingPhone,
        email: order.shippingEmail,
        address: order.shippingAddress,
        carrier: order.shippingCarrier,
        tracking_no: order.shippingTrackingNo,
      },
      items: order.items.map((it) => ({
        sku_code: it.sku.skuCode,
        name: it.sku.product.name,
        qty: it.qty,
        unit_price: it.unitPrice,
        total_price: it.totalPrice,
      })),
      payments: order.payments.map((p) => ({
        provider: p.provider,
        method: p.method,
        status: p.status,
        merchant_trade_no: p.merchantTradeNo,
        provider_trade_no: p.providerTradeNo,
        amount: p.amount,
        created_at: p.createdAt,
        paid_at: p.paidAt,
      })),
      allowed_next_statuses: ALLOWED_NEXT[order.status],
      sales_code: order.salesCode,
    };
  }

  async updateStatus(orderNumber: string, next: OrderStatus, force = false) {
    const order = await this.prisma.order.findFirst({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');

    if (!force) {
      const allowed = ALLOWED_NEXT[order.status] ?? [];
      if (!allowed.includes(next)) {
        throw new BadRequestException(
          `Invalid transition: ${order.status} -> ${next}`,
        );
      }
    }

    const now = new Date();
    const data: any = { status: next };
    if (next === 'SHIPPED') data.shippedAt = now;
    if (next === 'COMPLETED') data.completedAt = now;

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data,
    });

    // 若變更為 PAID，自動發放點數
    if (next === OrderStatus.PAID) {
      await this.members.awardPointsForOrder(order.id);
    }

    return { order_number: updated.orderNumber, status: updated.status };
  }

  async updateShipping(
    orderNumber: string,
    input: { carrier?: string; tracking_no?: string },
  ) {
    const order = await this.prisma.order.findFirst({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        shippingCarrier: input.carrier ?? order.shippingCarrier,
        shippingTrackingNo: input.tracking_no ?? order.shippingTrackingNo,
      },
    });

    return {
      order_number: updated.orderNumber,
      shipping_carrier: updated.shippingCarrier,
      shipping_tracking_no: updated.shippingTrackingNo,
    };
  }
}
