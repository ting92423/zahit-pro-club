import { Suspense } from 'react';

import { SiteHeader } from '@/components/site-header';
import { Card } from '@/components/ui/card';
import { AdminLoginClient } from './page-client';

export default function AdminLoginPage() {
  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-70" />
      <SiteHeader />
      <Suspense
        fallback={
          <main className="container-app py-10 sm:py-14">
            <div className="mx-auto max-w-md">
              <Card className="p-5 text-sm text-muted-foreground">載入中…</Card>
            </div>
          </main>
        }
      >
        <AdminLoginClient />
      </Suspense>
    </div>
  );
}

