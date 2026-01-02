import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { AdminEventDetailClient } from './page-client';

export default async function AdminEventDetailPage({
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
            <h1 className="text-xl font-semibold tracking-tight">活動名單與核銷</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              快速任務：找到報名者 → 核銷（CHECKED_IN）。
            </p>
          </div>
          <Link className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted" href="/admin/events">
            回活動列表
          </Link>
        </div>

        <AdminEventDetailClient eventId={id} />
      </main>
    </div>
  );
}

