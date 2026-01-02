'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const LOCAL_API_BASE = '';

type OrderDetail = {
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    carrier: string | null;
    tracking_no: string | null;
  };
  items: Array<{ name: string; sku_code: string; qty: number; unit_price: number; total_price: number }>;
  payments: Array<{
    provider: string;
    method: string | null;
    status: string;
    merchant_trade_no: string;
    provider_trade_no: string | null;
    amount: number;
    created_at: string;
    paid_at: string | null;
  }>;
  allowed_next_statuses: string[];
  sales_code: string | null;
};

function statusVariant(status: string) {
  const s = status.toUpperCase();
  if (s.includes('PAID') || s.includes('COMPLETED') || s.includes('SHIPPED')) return 'success' as const;
  if (s.includes('UNPAID') || s.includes('FULFILLING')) return 'warning' as const;
  if (s.includes('REFUND') || s.includes('CANCEL')) return 'danger' as const;
  return 'default' as const;
}

async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Request failed');
  return json.data as T;
}

export function AdminOrderDetailClient({ initial }: { initial: OrderDetail }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [carrier, setCarrier] = useState(order.shipping.carrier ?? '');
  const [trackingNo, setTrackingNo] = useState(order.shipping.tracking_no ?? '');

  const itemSummary = useMemo(() => {
    const qty = order.items.reduce((s, i) => s + i.qty, 0);
    return `${qty} 件 / $${order.total_amount}`;
  }, [order.items, order.total_amount]);

  const shippingText = useMemo(() => {
    return `收件人：${order.shipping.name}\n電話：${order.shipping.phone}\nEmail：${order.shipping.email}\n地址：${order.shipping.address}`;
  }, [order.shipping]);

  const outboundCarrier = carrier || order.shipping.carrier || '';
  const outboundTracking = trackingNo || order.shipping.tracking_no || '';
  const shippingNoticeText = useMemo(() => {
    const carrierLine = outboundCarrier ? `承運商：${outboundCarrier}` : `承運商：（待填）`;
    const trackingLine = outboundTracking ? `追蹤碼：${outboundTracking}` : `追蹤碼：（待填）`;
    return `您好，您的訂單已出貨。\n訂單編號：${order.order_number}\n${carrierLine}\n${trackingLine}\n可至官網「訂單查詢」輸入訂單編號 + 下單 Email 查詢。\n如有問題請與我們聯繫，謝謝。`;
  }, [order.order_number, outboundCarrier, outboundTracking]);

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setError('複製失敗，請手動複製');
    }
  }

  async function saveShipping() {
    setError(null);
    setIsSaving(true);
    try {
      const data = await patchJson<{ shipping_carrier: string | null; shipping_tracking_no: string | null }>(
        `${LOCAL_API_BASE}/api/admin/orders/${order.order_number}/shipping`,
        { carrier: carrier || null, tracking_no: trackingNo || null },
      );
      setOrder((o) => ({
        ...o,
        shipping: {
          ...o.shipping,
          carrier: data.shipping_carrier,
          tracking_no: data.shipping_tracking_no,
        },
      }));
      // 重新抓 server 資料（避免狀態/允許操作不同步）
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      setIsSaving(false);
    }
  }

  async function advanceStatus(next: string) {
    setError(null);
    setIsSaving(true);
    try {
      const data = await patchJson<{ status: string }>(
        `${LOCAL_API_BASE}/api/admin/orders/${order.order_number}/status`,
        {
          status: next,
        },
      );
      setOrder((o) => ({ ...o, status: data.status }));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '狀態更新失敗');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <Card className="surface-hover">
          <CardHeader>
            <CardTitle className="display text-lg">PIT STATUS</CardTitle>
            <CardDescription className="font-mono text-xs">{order.order_number}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4 h-1 overflow-hidden rounded-full border border-border bg-background/20">
              <div className="absolute inset-0 track-stripe" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                <span className="text-muted-foreground">｜</span>
                <span className="text-sm text-muted-foreground">SUMMARY</span>
                <span className="font-mono text-xs text-muted-foreground">{itemSummary}</span>
                {order.sales_code ? (
                  <Badge variant="muted">SALES: {order.sales_code}</Badge>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                建立時間：{new Date(order.created_at).toLocaleString()}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => copy('訂單編號', order.order_number)} type="button">
                複製訂單編號
              </Button>
              <Button size="sm" variant="secondary" onClick={() => copy('買家 Email', order.shipping.email)} type="button">
                複製買家 Email
              </Button>
              <Button size="sm" variant="secondary" onClick={() => copy('收件資訊', shippingText)} type="button">
                複製收件資訊
              </Button>
              {order.shipping.tracking_no ? (
                <Button size="sm" variant="secondary" onClick={() => copy('追蹤碼', outboundTracking)} type="button">
                  複製追蹤碼
                </Button>
              ) : null}
              <Button size="sm" variant="secondary" onClick={() => copy('出貨通知文案', shippingNoticeText)} type="button">
                複製出貨通知文案
              </Button>
              {copied ? <Badge variant="success">COPIED</Badge> : null}
              <Link className="ml-auto" href={`/orders/lookup`}>
                <Button size="sm" variant="ghost" className="text-muted-foreground" type="button">
                  前台查訂單 →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-hover">
          <CardHeader>
            <CardTitle className="display text-lg">ITEMS</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {order.items.map((it) => (
                <li key={it.sku_code} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {it.sku_code} × {it.qty}（${it.unit_price}）
                    </div>
                  </div>
                  <div className="font-medium">${it.total_price}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="surface-hover">
          <CardHeader>
            <CardTitle className="display text-lg">PAYMENTS</CardTitle>
          </CardHeader>
          <CardContent>
          {order.payments.length === 0 ? (
            <div className="mt-2 text-sm text-muted-foreground">尚未建立付款</div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {order.payments.map((p) => (
                <li key={p.merchant_trade_no} className="rounded-[var(--radius-sm)] border border-border bg-muted p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {p.provider} / {p.method ?? 'N/A'}
                    </div>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    MerchantTradeNo：<span className="font-mono">{p.merchant_trade_no}</span>
                  </div>
                  {p.provider_trade_no ? (
                    <div className="text-xs text-muted-foreground">
                      TradeNo：<span className="font-mono">{p.provider_trade_no}</span>
                    </div>
                  ) : null}
                  <div className="mt-1 text-xs text-muted-foreground">
                    金額：${p.amount}｜付款時間：{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}
                  </div>
                </li>
              ))}
            </ul>
          )}
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="surface-hover">
          <CardHeader>
            <CardTitle className="display text-lg">CONTACT</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">{order.shipping.name}</div>
            <div className="text-muted-foreground">{order.shipping.phone}</div>
            <div className="text-muted-foreground">{order.shipping.email}</div>
            <div className="mt-2 text-muted-foreground">{order.shipping.address}</div>
          </CardContent>
        </Card>

        <Card className="surface-hover">
          <CardHeader>
            <CardTitle className="display text-lg">SHIPMENT</CardTitle>
            <CardDescription>先補齊承運商/追蹤碼，再推進狀態。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">承運商</span>
              <Input
                placeholder="黑貓 / 郵局 /..."
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">追蹤碼</span>
              <Input
                placeholder="Tracking No."
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
              />
            </label>

            <Button disabled={isSaving} onClick={saveShipping} type="button">
              {isSaving ? '儲存中…' : '儲存出貨資訊'}
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-hover">
          <CardHeader>
            <CardTitle className="display text-lg">NEXT</CardTitle>
            <CardDescription>只顯示允許的狀態推進，避免誤操作。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {order.allowed_next_statuses.length === 0 ? (
              <div className="text-sm text-muted-foreground">目前無可推進狀態</div>
            ) : (
              order.allowed_next_statuses.map((s) => (
                <Button key={s} variant="secondary" disabled={isSaving} onClick={() => advanceStatus(s)} type="button">
                  推進為：<span className="font-mono">{s}</span>
                </Button>
              ))
            )}

            {error ? (
              <div className="mt-2 rounded-[var(--radius-sm)] border border-border bg-muted p-3 text-sm">{error}</div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

