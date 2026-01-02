import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { AdminSalesClient } from './page-client';

export default function AdminSalesPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-40" />
      <SiteHeader />
      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent">COMMAND</Badge>
              <Badge variant="muted">SALES TELEMETRY</Badge>
            </div>
            <h1 className="display skew-title text-4xl font-semibold tracking-tight">
              <span className="skew-reset">業務分潤與歸因報表</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground telemetry uppercase tracking-wider">
              依據 Sales Code 追蹤之成交數據匯總
            </p>
          </div>
          <Link href="/admin">
            <button className="h-10 px-6 text-xs font-bold chamfer-sm border border-border bg-card hover:bg-muted transition-all">
              ← BACK TO COMMAND
            </button>
          </Link>
        </div>

        <AdminSalesClient />
      </main>
    </div>
  );
}

