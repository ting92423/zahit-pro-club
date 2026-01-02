import Link from 'next/link';
import { cookies } from 'next/headers';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiBase } from '@/lib/api-base';
import { OrderQuickAction } from './quick-action';

const API_BASE = getApiBase();

type AdminOrder = {
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping: { name: string; email: string };
  items_count: number;
  shipping_carrier: string | null;
  shipping_tracking_no: string | null;
  shipped_at: string | null;
};

const DEFAULT_STATUSES = ['UNPAID', 'PAID', 'FULFILLING', 'SHIPPED', 'REFUNDING'] as const;

function statusVariant(status: string) {
  const s = status.toUpperCase();
  if (s.includes('PAID') || s.includes('COMPLETED') || s.includes('SHIPPED')) return 'success' as const;
  if (s.includes('UNPAID') || s.includes('FULFILLING')) return 'warning' as const;
  if (s.includes('REFUND') || s.includes('CANCEL')) return 'danger' as const;
  return 'default' as const;
}

async function getAdminOrders(searchParams: { status?: string; q?: string }) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('Unauthorized');

  const url = new URL(`${API_BASE}/admin/orders`);
  if (searchParams.status) {
    url.searchParams.set('status', searchParams.status);
  } else if (!searchParams.q) {
    // 預設：只顯示未完成訂單（由後端一次抓多狀態）
    url.searchParams.set('status', DEFAULT_STATUSES.join(','));
  }
  if (searchParams.q) url.searchParams.set('q', searchParams.q);

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load orders');
  return json.data as AdminOrder[];
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const orders = await getAdminOrders(sp);
  const activeStatus = sp.status ?? '';
  const filteredOrders = orders;

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />
      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-4xl font-semibold tracking-tight">ORDERS</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pit-stop 模式：快速定位 → 補出貨 → 推進狀態 → 完成。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted">ADMIN</Badge>
            <Link href="/admin">
              <Button variant="secondary" size="sm">回後台首頁</Button>
            </Link>
          </div>
        </div>
        <div className="relative mt-4 h-1 overflow-hidden rounded-full border border-border bg-background/20">
          <div className="absolute inset-0 track-stripe" />
        </div>

        <form
          className="mt-6"
          method="get"
        >
          <Card>
            <CardHeader>
              <CardTitle className="display text-lg">FILTER</CardTitle>
              <CardDescription>先用常用狀態，再用搜尋鎖定目標。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">狀態</span>
                <select
                  className="h-10 rounded-[calc(var(--radius-sm))] border border-border bg-card px-3 text-sm shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
                  defaultValue={activeStatus}
                  name="status"
                >
                  <option value="">全部</option>
                  <option value="UNPAID">UNPAID（待付款）</option>
                  <option value="PAID">PAID（已付款）</option>
                  <option value="FULFILLING">FULFILLING（備貨中）</option>
                  <option value="SHIPPED">SHIPPED（已出貨）</option>
                  <option value="COMPLETED">COMPLETED（完成）</option>
                  <option value="CANCELLED">CANCELLED（取消）</option>
                  <option value="REFUNDING">REFUNDING（退款中）</option>
                  <option value="REFUNDED">REFUNDED（已退款）</option>
                </select>
              </label>

              <label className="grid flex-1 gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">搜尋（訂單編號 / Email / 姓名）</span>
                <Input
                  defaultValue={sp.q ?? ''}
                  name="q"
                  placeholder="例如：ZAHIT-2025... / a@b.com / 王小明"
                />
              </label>

              <Button type="submit">篩選</Button>

              <div className="ml-auto text-xs text-muted-foreground">
                顯示 <span className="font-mono">{filteredOrders.length}</span> 筆（最多 100 筆）
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            className={`rounded-full border px-3 py-1 text-xs transition ${
              activeStatus === ''
                ? 'border-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent)_18%,transparent)] text-foreground'
                : 'border-border hover:bg-muted'
            }`}
            href={`/admin/orders${sp.q ? `?q=${encodeURIComponent(sp.q)}` : ''}`}
          >
            常用（預設）
          </Link>
          {DEFAULT_STATUSES.map((s) => {
            const href = `/admin/orders?status=${encodeURIComponent(s)}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`;
            const isActive = activeStatus === s;
            return (
              <Link
                key={s}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  isActive
                    ? 'border-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent)_18%,transparent)] text-foreground'
                    : 'border-border hover:bg-muted'
                }`}
                href={href}
              >
                {s}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto rounded-[var(--radius)] border border-border bg-card shadow-[var(--shadow-sm)] backdrop-blur track-bar">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3">訂單編號</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">金額</th>
                <th className="px-4 py-3">買家</th>
                <th className="px-4 py-3">件數</th>
                <th className="px-4 py-3">出貨</th>
                <th className="px-4 py-3 text-right">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((o) => (
                <tr key={o.order_number} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      className="inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-background/10 px-2 py-1 underline underline-offset-2 transition hover:border-[color:color-mix(in_oklab,var(--border)_55%,var(--accent)_45%)] hover:bg-muted/40"
                      href={`/admin/orders/${o.order_number}`}
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3">${o.total_amount}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.shipping.name}</div>
                    <div className="text-xs text-muted-foreground">{o.shipping.email}</div>
                  </td>
                  <td className="px-4 py-3">{o.items_count}</td>
                  <td className="px-4 py-3">
                    {o.shipping_tracking_no ? (
                      <div className="text-xs">
                        {o.shipping_carrier ?? 'carrier'} / {o.shipping_tracking_no}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">未填</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <OrderQuickAction orderNumber={o.order_number} currentStatus={o.status} />
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={7}>
                    目前沒有符合條件的訂單
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

