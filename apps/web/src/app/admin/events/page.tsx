import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';

import { AdminEventsClient } from './page-client';

export default function AdminEventsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">活動管理</h1>
            <p className="mt-2 text-sm text-muted-foreground">建立活動、查看名單、進行報到核銷。</p>
          </div>
          <Link className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted" href="/admin">
            回後台首頁
          </Link>
        </div>

        <AdminEventsClient />
      </main>
    </div>
  );
}

