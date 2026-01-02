import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { AdminMembersClient } from './page-client';

export default function AdminMembersPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">會員管理</h1>
            <p className="mt-2 text-sm text-muted-foreground">搜尋會員、查看點數流水、必要時手動調整。</p>
          </div>
          <Link className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted" href="/admin">
            回後台首頁
          </Link>
        </div>

        <AdminMembersClient />
      </main>
    </div>
  );
}

