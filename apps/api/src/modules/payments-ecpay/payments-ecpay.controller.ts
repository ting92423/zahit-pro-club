import { Body, Controller, Headers, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { PrismaService } from '../prisma/prisma.service';
import { computeCheckMacValue, verifyCheckMacValue } from './ecpay.checkmac';
import { PaymentsEcpayService } from './payments-ecpay.service';
import { MembersService } from '../members/members.service';

type CreatePaymentBody = {
  order_number: string;
  method: 'CREDIT' | 'ATM';
};

@Controller()
export class PaymentsEcpayController {
  constructor(
    private readonly payments: PaymentsEcpayService,
    private readonly prisma: PrismaService,
    private readonly members: MembersService,
  ) {}

  @Post('payments/ecpay/create')
  async create(@Body() body: CreatePaymentBody) {
    const webBaseUrl = process.env.WEB_BASE_URL ?? 'http://localhost:3000';
    const apiBaseUrl =
      process.env.API_BASE_URL ?? 'http://localhost:3001/api/v1';

    const { ecpayEndpoint, form } = await this.payments.createPayment({
      order_number: body.order_number,
      method: body.method,
      web_base_url: webBaseUrl,
      api_base_url: apiBaseUrl,
    });

    const hashKey = process.env.ECPAY_HASH_KEY!;
    const hashIv = process.env.ECPAY_HASH_IV!;
    const checkMacValue = computeCheckMacValue(form, hashKey, hashIv);

    const inputs = Object.entries({ ...form, CheckMacValue: checkMacValue })
      .map(
        ([k, v]) => `<input type="hidden" name="${k}" value="${String(v)}" />`,
      )
      .join('\n');

    const formHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Redirecting...</title></head>
<body>
  <form id="ecpay" method="post" action="${ecpayEndpoint}">
    ${inputs}
  </form>
  <script>document.getElementById('ecpay').submit();</script>
</body></html>`;

    return { data: { form_html: formHtml } };
  }

  @Post('payments/ecpay/callback')
  async callback(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string | undefined>,
    @Res() res: Response,
  ) {
    const hashKey = process.env.ECPAY_HASH_KEY!;
    const hashIv = process.env.ECPAY_HASH_IV!;

    if (!hashKey || !hashIv) {
      return res.status(500).type('text/plain').send('0|NO');
    }

    // 驗簽
    const ok = verifyCheckMacValue(body, hashKey, hashIv);
    if (!ok) {
      return res.status(400).type('text/plain').send('0|NO');
    }

    const merchantTradeNo = String(body.MerchantTradeNo ?? '');
    const providerTradeNo = String(body.TradeNo ?? '');
    const rtnCode = String(body.RtnCode ?? '');
    const payDate = String(body.PaymentDate ?? '');

    if (!merchantTradeNo)
      return res.status(400).type('text/plain').send('0|NO');

    // 冪等更新：若已成功，callback 重送直接回 OK
    const payment = await this.prisma.payment.findFirst({
      where: { merchantTradeNo },
    });
    if (!payment) return res.status(404).type('text/plain').send('0|NO');

    if (payment.status === 'SUCCEEDED') {
      return res.type('text/plain').send('1|OK');
    }

    // 綠界常見：RtnCode=1 代表付款成功；ATM 可能會先有其他狀態（這裡先保守寫入 raw）
    const paid = rtnCode === '1';

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          providerTradeNo: providerTradeNo || payment.providerTradeNo,
          status: paid ? 'SUCCEEDED' : 'PENDING',
          paidAt: paid && payDate ? new Date(payDate) : payment.paidAt,
          rawCallback: body as any,
        },
      });

      if (paid) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' },
        });
        // 觸發贈點（內部邏輯，無須對外串接）
        await this.members.awardPointsForOrder(payment.orderId);
      }
    });

    // 必須回傳 1|OK
    return res.type('text/plain').send('1|OK');
  }

  @Post('payments/ecpay/atm-info')
  async atmInfo(@Body() body: Record<string, unknown>, @Res() res: Response) {
    const hashKey = process.env.ECPAY_HASH_KEY!;
    const hashIv = process.env.ECPAY_HASH_IV!;

    if (!hashKey || !hashIv)
      return res.status(500).type('text/plain').send('0|NO');
    if (!verifyCheckMacValue(body, hashKey, hashIv))
      return res.status(400).type('text/plain').send('0|NO');

    const merchantTradeNo = String(body.MerchantTradeNo ?? '');
    if (!merchantTradeNo)
      return res.status(400).type('text/plain').send('0|NO');

    const bankCode = String(body.BankCode ?? '');
    const vAccount = String(body.vAccount ?? body.VAccount ?? '');
    const expireDateRaw = String(body.ExpireDate ?? body.ExpireDateTime ?? '');

    const payment = await this.prisma.payment.findFirst({
      where: { merchantTradeNo },
    });
    if (!payment) return res.status(404).type('text/plain').send('0|NO');

    // 綠界 ATM：此回呼通常代表「繳費資訊已產生」
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PENDING',
        atmBankCode: bankCode || payment.atmBankCode,
        atmAccount: vAccount || payment.atmAccount,
        atmExpireAt: expireDateRaw
          ? new Date(expireDateRaw)
          : payment.atmExpireAt,
        rawCallback: body as any,
      },
    });

    return res.type('text/plain').send('1|OK');
  }
}
