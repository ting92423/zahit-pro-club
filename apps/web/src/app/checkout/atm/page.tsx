import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card } from '@/components/ui/card';
import { CheckoutAtmClient } from './page-client';

export default function CheckoutAtmPage() {
  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />
      <Suspense
        fallback={
          <main className="container-app py-10 sm:py-14">
            <Card className="p-5 text-sm text-muted-foreground">載入中…</Card>
          </main>
        }
      >
        <CheckoutAtmClient />
      </Suspense>
    </div>
  );
}

