import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import { CheckoutPayClient } from './pay-client';

export default async function CheckoutPayPage({
  searchParams,
}: {
  searchParams: Promise<{ order_number?: string; method?: string }>;
}) {
  const { order_number, method } = await searchParams;
  const normalizedMethod = method === 'ATM' ? 'ATM' : 'CREDIT';

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-4xl font-semibold tracking-tight">PAYMENT</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              將導向綠界付款頁（{normalizedMethod === 'ATM' ? 'ATM 轉帳' : '信用卡'}）。請勿關閉此頁。
            </p>
          </div>
          <Badge variant="muted">STEP 02 / PAY</Badge>
        </div>

        <Suspense
          fallback={
            <Card className="mt-6 p-5 text-sm text-muted-foreground">建立付款中…</Card>
          }
        >
          <CheckoutPayClient orderNumber={order_number ?? ''} method={normalizedMethod} />
        </Suspense>
      </main>
    </div>
  );
}

