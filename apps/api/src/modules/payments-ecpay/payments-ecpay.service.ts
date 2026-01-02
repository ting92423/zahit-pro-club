import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';
import { randomInt } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

type CreateEcpayPaymentInput = {
  order_number: string;
  method: 'CREDIT' | 'ATM';
  web_base_url: string; // 用於 ClientBackURL
  api_base_url: string; // 用於 ReturnURL
};

function todayYYYYMMDDhhmmss() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

function formatEcpayTradeDate(d: Date) {
  // yyyy/MM/dd HH:mm:ss
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
}

function generateMerchantTradeNo() {
  // 綠界限制長度與字元（通常 <= 20 且英數）
  // 以時間 + 隨機 3 碼，盡量避免衝突
  const suffix = String(randomInt(0, 1000)).padStart(3, '0');
  return `ZAHIT${todayYYYYMMDDhhmmss()}${suffix}`.slice(0, 20);
}

@Injectable()
export class PaymentsEcpayService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(input: CreateEcpayPaymentInput) {
    const merchantId = process.env.ECPAY_MERCHANT_ID;
    const hashKey = process.env.ECPAY_HASH_KEY;
    const hashIv = process.env.ECPAY_HASH_IV;
    const ecpayEndpoint =
      process.env.ECPAY_ENDPOINT ??
      'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

    if (!merchantId || !hashKey || !hashIv) {
      throw new BadRequestException('ECPay env vars not configured');
    }

    const order = await this.prisma.order.findFirst({
      where: { orderNumber: input.order_number },
      include: { items: { include: { sku: { include: { product: true } } } } },
    });
    if (!order) throw new BadRequestException('Order not found');
    if (order.totalAmount <= 0)
      throw new BadRequestException('Invalid order amount');

    const method =
      input.method === 'ATM' ? PaymentMethod.ATM : PaymentMethod.CREDIT;

    const merchantTradeNo = generateMerchantTradeNo();
    const payment = await this.prisma.payment.create({
      data: {
        provider: PaymentProvider.ECPAY,
        method,
        status: PaymentStatus.INITIATED,
        orderId: order.id,
        amount: order.totalAmount,
        merchantTradeNo,
      },
    });

    const itemName =
      order.items.length === 0
        ? 'Zahit Order'
        : order.items
            .map((it) => `${it.sku.product.name} x${it.qty}`)
            .join('#');

    const returnUrl = `${input.api_base_url.replace(/\/+$/, '')}/payments/ecpay/callback`;
    const webBase = input.web_base_url.replace(/\/+$/, '');
    const clientBackUrl =
      method === PaymentMethod.ATM
        ? `${webBase}/checkout/atm?order_number=${encodeURIComponent(order.orderNumber)}`
        : `${webBase}/checkout/success?order_number=${encodeURIComponent(order.orderNumber)}`;

    // 這裡先做最小可用的欄位集合，後續再依綠界規格補齊分期/語系/客製頁等。
    const baseForm: Record<string, string> = {
      MerchantID: merchantId,
      MerchantTradeNo: payment.merchantTradeNo,
      MerchantTradeDate: formatEcpayTradeDate(new Date()),
      PaymentType: 'aio',
      TotalAmount: String(order.totalAmount),
      TradeDesc: 'Zahit Pro Club Order',
      ItemName: itemName,
      ReturnURL: returnUrl,
      ClientBackURL: clientBackUrl,
      ChoosePayment: method === PaymentMethod.ATM ? 'ATM' : 'Credit',
      EncryptType: '1',
    };

    if (method === PaymentMethod.ATM) {
      baseForm.ExpireDate = '3'; // 3 days
      baseForm.PaymentInfoURL = `${input.api_base_url.replace(/\/+$/, '')}/payments/ecpay/atm-info`;
    }

    // CheckMacValue 由 controller 產生（避免 service 相依 hashing 實作細節）
    return { ecpayEndpoint, form: baseForm, payment_id: payment.id };
  }
}
