import Link from 'next/link';
import { cookies } from 'next/headers';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getApiBase } from '@/lib/api-base';

import { AdminOrderDetailClient } from './order-detail-client';

const API_BASE = getApiBase();

async function getOrder(orderNumber: string) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderNumber)}`, {
    cache: 'no-store',
    headers: { authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load order');
  return json.data;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />
      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-4xl font-semibold tracking-tight">ORDER DETAIL</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              核心任務：補出貨資訊 → 推進狀態 → 完成。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted">ADMIN</Badge>
            <Link href="/admin/orders">
              <Button variant="secondary" size="sm">回訂單列表</Button>
            </Link>
          </div>
        </div>

        <AdminOrderDetailClient initial={order} />
      </main>
    </div>
  );
}

