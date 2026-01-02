import { headers } from 'next/headers';
import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OrderDetail = {
  order_number: string;
  status: string;
  subtotal_amount: number;
  discount_amount: number;
  points_redeemed: number;
  total_amount: number;
  created_at: string;
  payment:
    | {
        provider: string;
        method: string | null;
        status: string;
        paid_at: string | null;
        atm?: { bank_code: string | null; account_masked: string | null; expire_at: string | null } | null;
      }
    | null;
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    carrier: string | null;
    tracking_no: string | null;
    shipped_at: string | null;
    completed_at: string | null;
  };
  items: Array<{ sku_code: string; name: string; qty: number; unit_price: number; total_price: number }>;
};

async function getOrder(orderNumber: string): Promise<OrderDetail> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/orders/${encodeURIComponent(orderNumber)}`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load order');
  return json.data as OrderDetail;
}

export default async function MemberOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-40" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-3xl font-semibold tracking-tight">
              訂單詳情 <span className="font-mono text-base text-muted-foreground">#{order.order_number}</span>
            </h1>
            <div className="mt-2 text-sm text-muted-foreground telemetry">
              建立時間：{new Date(order.created_at).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">{order.status}</Badge>
            <Link href="/me">
              <Button variant="secondary">返回會員中心</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="surface-hover chamfer-lg">
            <CardHeader>
              <CardTitle className="display text-lg">品項</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((it) => (
                <div key={it.sku_code} className="flex items-start justify-between gap-4 border border-border/50 bg-background/30 p-4 chamfer-sm">
                  <div className="min-w-0">
                    <div className="font-semibold">{it.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground font-mono">SKU: {it.sku_code}</div>
                    <div className="mt-2 text-xs text-muted-foreground telemetry">數量：{it.qty}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">單價</div>
                    <div className="font-mono">${it.unit_price.toLocaleString()}</div>
                    <div className="mt-2 text-sm text-muted-foreground">小計</div>
                    <div className="font-mono font-bold">${it.total_price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card className="surface-hover chamfer-lg">
              <CardHeader>
                <CardTitle className="display text-lg">金額</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="小計" value={`$${order.subtotal_amount.toLocaleString()}`} />
                {order.discount_amount > 0 ? (
                  <Row label="折抵" value={`-$${order.discount_amount.toLocaleString()}`} accent />
                ) : null}
                {order.points_redeemed > 0 ? (
                  <Row label="使用點數" value={`${order.points_redeemed.toLocaleString()} pts`} accent />
                ) : null}
                <div className="h-px bg-border/60 my-2" />
                <Row label="總計" value={`$${order.total_amount.toLocaleString()}`} strong />
              </CardContent>
            </Card>

            <Card className="surface-hover chamfer-lg">
              <CardHeader>
                <CardTitle className="display text-lg">付款狀態</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="方式" value={order.payment?.method ?? '—'} />
                <Row label="狀態" value={order.payment?.status ?? '—'} />
                {order.payment?.paid_at ? <Row label="完成" value={new Date(order.payment.paid_at).toLocaleString()} /> : null}
                {order.payment?.atm ? (
                  <div className="mt-3 border border-border/50 bg-background/30 p-3 chamfer-sm">
                    <div className="text-xs text-muted-foreground">ATM 資訊</div>
                    <div className="mt-2 space-y-1 text-xs">
                      <Row label="銀行代碼" value={order.payment.atm.bank_code ?? '—'} />
                      <Row label="虛擬帳號" value={order.payment.atm.account_masked ?? '—'} />
                      {order.payment.atm.expire_at ? (
                        <Row label="到期" value={new Date(order.payment.atm.expire_at).toLocaleString()} />
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="surface-hover chamfer-lg">
              <CardHeader>
                <CardTitle className="display text-lg">收件資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="收件人" value={order.shipping.name} />
                <Row label="電話" value={order.shipping.phone} />
                <Row label="Email" value={order.shipping.email} />
                <Row label="地址" value={order.shipping.address} />
                <div className="h-px bg-border/60 my-2" />
                <Row label="物流" value={order.shipping.carrier ?? '—'} />
                <Row label="追蹤碼" value={order.shipping.tracking_no ?? '—'} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-muted-foreground">{label}</div>
      <div className={`${strong ? 'font-bold' : ''} ${accent ? 'text-accent font-mono' : ''} text-right`}>
        {value}
      </div>
    </div>
  );
}

