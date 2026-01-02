import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { CheckoutSuccessClient } from './success-client';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_number?: string }>;
}) {
  const { order_number } = await searchParams;

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-4xl font-semibold tracking-tight">ORDER CREATED</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              已完成建單。請保存訂單編號，後續可用「訂單編號 + Email」查詢（不用登入）。
            </p>
          </div>
          <Badge variant="muted">STEP 04 / DONE</Badge>
        </div>

        <CheckoutSuccessClient orderNumber={order_number ?? null} />
      </main>
    </div>
  );
}

