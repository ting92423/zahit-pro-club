'use client';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { lookupGuestOrder } from '@/lib/api';
import { useState } from 'react';
import { useI18n } from '@/i18n/provider';

function statusVariant(status: string) {
  const s = status.toUpperCase();
  if (s.includes('PAID') || s.includes('COMPLETED') || s.includes('SHIPPED')) return 'success' as const;
  if (s.includes('UNPAID')) return 'warning' as const;
  if (s.includes('REFUND')) return 'danger' as const;
  return 'default' as const;
}

export default function OrderLookupPage() {
  const { dict } = useI18n();
  const t = dict.checkout;
  const common = dict.common;

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof lookupGuestOrder>> | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data = await lookupGuestOrder({ order_number: orderNumber, email });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : common.error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="display skew-title text-4xl font-semibold tracking-tight">
              <span className="skew-reset">{t.public_lookup}</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400 telemetry">
              GUEST ACCESS // TRACK YOUR SHIPMENT
            </p>
          </div>
          <Badge variant="muted">TRACKING</Badge>
        </div>

        <Card className="mt-8 surface-hover chamfer-lg scanlines animate-in fade-in zoom-in-95 duration-500 delay-100" style={{ animationFillMode: 'both' }}>
          <CardHeader>
            <CardTitle className="display text-lg">FIND YOUR ORDER</CardTitle>
            <CardDescription className="text-zinc-300 font-medium">Enter precise data coordinates.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6" onSubmit={onSubmit}>
              <label className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t.order_ref}</span>
                <Input
                  placeholder="ZAHIT-2025..."
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="chamfer-sm focus:border-accent font-mono placeholder:text-zinc-500"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t.verify_email}</span>
                <Input
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="chamfer-sm focus:border-accent placeholder:text-zinc-500"
                />
              </label>

              <Button disabled={isLoading} type="submit" className="skew-cta w-full sm:w-auto">
                {isLoading ? common.processing : 'INITIATE SEARCH'}
              </Button>

              <div className="text-xs text-zinc-400 font-medium">
                Can't locate data? Verify email matches original transmission.
              </div>

              {error ? (
                <div className="border border-red-900/50 bg-red-900/10 p-3 text-sm chamfer-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold text-red-400">ACCESS DENIED</div>
                    <Badge variant="danger">ERROR</Badge>
                  </div>
                  <div className="mt-2 text-sm text-red-300/80">{error}</div>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result ? (
          <Card className="mt-6 surface-hover chamfer-lg border-accent/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="display text-lg">RESULT</CardTitle>
                  <CardDescription className="text-zinc-400">
                    <span className="font-mono text-foreground">{result.order_number}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(result.status)}>{common.status}</Badge>
                  <div className="font-mono text-xs text-zinc-400">{result.status}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6 pb-4 border-b border-border/50">
                <div className="text-zinc-400">
                  TOTAL: <span className="font-medium text-foreground font-mono tabular-nums text-lg">${result.total_amount}</span>
                </div>
                <div className="text-zinc-400">
                  TIMESTAMP: <span className="font-mono text-xs text-foreground">{new Date(result.created_at).toLocaleString()}</span>
                </div>
              </div>

            {result.payment?.method === 'ATM' ? (
              <div className="mt-4 border border-border bg-muted/50 p-4 chamfer-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-sm font-bold tracking-widest uppercase">{t.wire}</div>
                  <Badge variant={result.customer_reported_paid_at ? 'success' : 'warning'}>
                    {result.customer_reported_paid_at ? t.report_received : 'PENDING'}
                  </Badge>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border border-border bg-background p-3 chamfer-sm">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{t.bank_code}</div>
                    <div className="mt-1 font-mono text-sm">{result.payment.atm?.bank_code ?? '---'}</div>
                  </div>
                  <div className="border border-border bg-background p-3 chamfer-sm">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{t.expiration}</div>
                    <div className="mt-1 text-sm font-mono text-red-400">
                      {result.payment.atm?.expire_at
                        ? new Date(result.payment.atm.expire_at).toLocaleString()
                        : '---'}
                    </div>
                  </div>
                  <div className="border border-border bg-background p-3 chamfer-sm sm:col-span-2">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{t.virtual_acc} (MASKED)</div>
                    <div className="mt-1 font-mono text-sm tracking-widest">{result.payment.atm?.account_masked ?? '---'}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <a href={`/checkout/atm?order_number=${encodeURIComponent(result.order_number)}`}>
                    <Button variant="secondary" className="w-full sm:w-auto">SECURE PAYMENT PORTAL</Button>
                  </a>
                </div>
              </div>
            ) : null}

            <ul className="mt-6 space-y-3">
              {result.items.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm p-3 border border-border bg-background/50 chamfer-sm">
                  <span className="font-medium tracking-wide">
                    {it.name} <span className="text-zinc-500 font-mono">x{it.qty}</span>
                  </span>
                  <span className="font-mono tabular-nums">${it.total_price}</span>
                </li>
              ))}
            </ul>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
