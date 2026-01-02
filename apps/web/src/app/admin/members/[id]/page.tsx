import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { AdminMemberDetailClient } from './page-client';

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">會員詳情</h1>
            <p className="mt-2 text-sm text-muted-foreground">查看點數流水並手動調整（會留下流水）。</p>
          </div>
          <Link className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted" href="/admin/members">
            回會員列表
          </Link>
        </div>

        <AdminMemberDetailClient memberId={id} />
      </main>
    </div>
  );
}

