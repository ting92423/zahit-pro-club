import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, OrderStatus, PointTransactionType } from '@prisma/client';
import { randomInt } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

type CreateGuestOrderInput = {
  items: Array<{ sku_code: string; qty: number }>;
  shipping: { name: string; phone: string; email: string; address: string };
  sales_code?: string;
  points_to_redeem?: number;
  memberId?: string;
};

type LookupGuestOrderInput = { order_number: string; email: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function generateOrderNumber() {
  // 不用連續序號，避免被猜測；用日期 + 隨機 6 碼
  const suffix = String(randomInt(0, 1_000_000)).padStart(6, '0');
  return `ZAHIT-${todayYYYYMMDD()}-${suffix}`;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuestOrder(input: CreateGuestOrderInput) {
    if (!input?.shipping) throw new BadRequestException('Missing shipping');
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new BadRequestException('Items required');
    }

    const shippingEmail = normalizeEmail(input.shipping.email);
    if (!shippingEmail) throw new BadRequestException('Email required');

    const items = input.items.map((it) => ({
      skuCode: it.sku_code,
      qty: Number(it.qty),
    }));

    if (
      items.some(
        (it) => !it.skuCode || !Number.isInteger(it.qty) || it.qty <= 0,
      )
    ) {
      throw new BadRequestException('Invalid items');
    }

    // 先讀取 SKU
    const skuCodes = [...new Set(items.map((i) => i.skuCode))];
    const skus = await this.prisma.sku.findMany({
      where: { skuCode: { in: skuCodes } },
    });

    if (skus.length !== skuCodes.length) {
      throw new BadRequestException('One or more SKUs not found');
    }

    const skuByCode = new Map(skus.map((s) => [s.skuCode, s]));
    const orderItems = items.map((it) => {
      const sku = skuByCode.get(it.skuCode)!;
      const unitPrice = sku.price;
      return {
        skuId: sku.id,
        qty: it.qty,
        unitPrice,
        totalPrice: unitPrice * it.qty,
      };
    });

    const subtotalAmount = orderItems.reduce(
      (sum, it) => sum + it.totalPrice,
      0,
    );
    let pointsRedeemed = 0;

    // 點數折抵邏輯
    if (
      input.memberId &&
      input.points_to_redeem &&
      input.points_to_redeem > 0
    ) {
      const member = await this.prisma.member.findUnique({
        where: { id: input.memberId },
      });
      if (!member) throw new NotFoundException('Member not found');

      const available = member.pointsBalance;
      const toRedeem = Math.floor(input.points_to_redeem);

      if (toRedeem > available) {
        throw new BadRequestException('信用點數餘額不足');
      }

      // 折抵上限：不能超過訂單金額
      pointsRedeemed = Math.min(toRedeem, subtotalAmount);
    }

    const discountAmount = pointsRedeemed; // 目前 1 點 = 1 元
    const totalAmount = subtotalAmount - discountAmount;

    if (totalAmount < 0) throw new BadRequestException('Invalid total');

    // 交易：扣庫存 + 建單 + 建明細 + 扣點數
    return await this.prisma.$transaction(async (tx) => {
      // 1. 扣點數 (若有折抵)
      if (input.memberId && pointsRedeemed > 0) {
        await tx.member.update({
          where: { id: input.memberId },
          data: { pointsBalance: { decrement: pointsRedeemed } },
        });
      }

      // 2. 扣庫存
      for (const it of orderItems) {
        const updated = await tx.sku.updateMany({
          where: { id: it.skuId, stock: { gte: it.qty } },
          data: { stock: { decrement: it.qty } },
        });
        if (updated.count !== 1)
          throw new BadRequestException('Insufficient stock');
      }

      let lastError: unknown = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const orderNumber = generateOrderNumber();
        try {
          const order = await tx.order.create({
            data: {
              orderNumber,
              status: OrderStatus.UNPAID,
              memberId: input.memberId || null,
              subtotalAmount,
              discountAmount,
              pointsRedeemed,
              totalAmount,
              shippingName: input.shipping.name,
              shippingPhone: input.shipping.phone,
              shippingEmail,
              shippingAddress: input.shipping.address,
              salesCode: input.sales_code || null,
              items: {
                create: orderItems.map((it) => ({
                  skuId: it.skuId,
                  qty: it.qty,
                  unitPrice: it.unitPrice,
                  totalPrice: it.totalPrice,
                })),
              },
            },
            include: {
              items: { include: { sku: true } },
            },
          });

          // 3. 建立點數流水 (如果有折抵)
          if (input.memberId && pointsRedeemed > 0) {
            await tx.pointLedger.create({
              data: {
                memberId: input.memberId,
                type: PointTransactionType.REDEEM,
                pointsDelta: -pointsRedeemed,
                reason: `訂單折抵：${order.orderNumber}`,
                refType: 'ORDER',
                refId: order.id,
              },
            });
          }

          return {
            id: order.id,
            order_number: order.orderNumber,
            status: order.status,
            total_amount: order.totalAmount,
            created_at: order.createdAt,
          };
        } catch (e) {
          lastError = e;
          // 唯一鍵衝突就重試
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
          ) {
            continue;
          }
          throw e;
        }
      }

      throw new BadRequestException('Failed to generate order number', {
        cause: lastError as Error,
      });
    });
  }

  async lookupGuestOrder(input: LookupGuestOrderInput) {
    const orderNumber = input?.order_number?.trim();
    const email = normalizeEmail(input?.email ?? '');
    if (!orderNumber || !email)
      throw new BadRequestException('order_number and email required');

    const order = await this.prisma.order.findFirst({
      where: { orderNumber, shippingEmail: email },
      include: {
        items: { include: { sku: { include: { product: true } } } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const latestPayment = order.payments[0] ?? null;
    const maskAtmAccount = (acct: string | null) => {
      if (!acct) return null;
      // 只在純數字且長度足夠時做遮罩；其他情況直接回傳部分遮罩避免誤判
      if (/^\d{7,}$/.test(acct)) {
        return acct.replace(/^(\d{3})\d+(\d{3})$/, '$1****$2');
      }
      return `${acct.slice(0, 2)}****${acct.slice(-2)}`;
    };
    const atmInfo =
      latestPayment?.method === 'ATM'
        ? {
            bank_code: latestPayment.atmBankCode ?? null,
            account: latestPayment.atmAccount ?? null,
            account_masked: maskAtmAccount(latestPayment.atmAccount ?? null),
            expire_at: latestPayment.atmExpireAt ?? null,
          }
        : null;

    return {
      order_number: order.orderNumber,
      status: order.status,
      total_amount: order.totalAmount,
      created_at: order.createdAt,
      customer_reported_paid_at: order.customerReportedPaidAt,
      payment: latestPayment
        ? {
            provider: latestPayment.provider,
            method: latestPayment.method,
            status: latestPayment.status,
            atm: atmInfo,
          }
        : null,
      shipping: {
        name: order.shippingName,
        email: order.shippingEmail.replace(/(^.).*(@.*$)/, '$1***$2'),
      },
      items: order.items.map((it) => ({
        sku_id: it.skuId,
        name: it.sku.product.name,
        qty: it.qty,
        unit_price: it.unitPrice,
        total_price: it.totalPrice,
      })),
    };
  }

  async getMemberOrder(memberId: string | undefined, orderNumberRaw: string) {
    const orderNumber = orderNumberRaw?.trim();
    if (!memberId) throw new BadRequestException('Member required');
    if (!orderNumber) throw new BadRequestException('Order number required');

    const order = await this.prisma.order.findFirst({
      where: { orderNumber, memberId },
      include: {
        items: { include: { sku: { include: { product: true } } } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const latestPayment = order.payments[0] ?? null;
    const atmInfo =
      latestPayment?.method === 'ATM'
        ? {
            bank_code: latestPayment.atmBankCode ?? null,
            account_masked: latestPayment.atmAccount
              ? latestPayment.atmAccount.replace(
                  /^(\d{3})\d+(\d{3})$/,
                  '$1****$2',
                )
              : null,
            expire_at: latestPayment.atmExpireAt ?? null,
          }
        : null;

    return {
      order_number: order.orderNumber,
      status: order.status,
      subtotal_amount: order.subtotalAmount,
      discount_amount: order.discountAmount,
      points_redeemed: order.pointsRedeemed,
      total_amount: order.totalAmount,
      created_at: order.createdAt,
      payment: latestPayment
        ? {
            provider: latestPayment.provider,
            method: latestPayment.method,
            status: latestPayment.status,
            paid_at: latestPayment.paidAt,
            atm: atmInfo,
          }
        : null,
      shipping: {
        name: order.shippingName,
        phone: order.shippingPhone,
        email: order.shippingEmail,
        address: order.shippingAddress,
        carrier: order.shippingCarrier ?? null,
        tracking_no: order.shippingTrackingNo ?? null,
        shipped_at: order.shippedAt ?? null,
        completed_at: order.completedAt ?? null,
      },
      items: order.items.map((it) => ({
        sku_code: it.sku.skuCode,
        name: it.sku.product.name,
        qty: it.qty,
        unit_price: it.unitPrice,
        total_price: it.totalPrice,
      })),
    };
  }

  async reportAtmTransfer(input: LookupGuestOrderInput) {
    const orderNumber = input?.order_number?.trim();
    const email = normalizeEmail(input?.email ?? '');
    if (!orderNumber || !email)
      throw new BadRequestException('order_number and email required');

    const order = await this.prisma.order.findFirst({
      where: { orderNumber, shippingEmail: email },
      include: { payments: { orderBy: { createdAt: 'desc' } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const latest = order.payments[0] ?? null;
    if (!latest || latest.method !== 'ATM') {
      throw new BadRequestException('This order is not an ATM payment');
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { customerReportedPaidAt: new Date() },
    });

    return {
      order_number: updated.orderNumber,
      customer_reported_paid_at: updated.customerReportedPaidAt,
    };
  }
}
