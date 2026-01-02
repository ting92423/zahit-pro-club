'use client';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createGuestOrder } from '@/lib/api';
import { useCartStore } from '@/features/cart/cart-store';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { getApiBase } from '@/lib/api-base';

async function getMyPoints() {
  const cookieStr = typeof document !== 'undefined' ? document.cookie : '';
  const token = cookieStr
    .split('; ')
    .find((row) => row.startsWith('auth_token='))
    ?.split('=')[1];

  if (!token) return null;

  const res = await fetch(`${getApiBase()}/me`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) return null;
  return json.data?.points_balance as number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.checkout;
  const common = dict.common;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT' | 'ATM'>('CREDIT');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  useEffect(() => {
    getMyPoints().then(setPointsBalance);
  }, []);

  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unit_price * item.qty, 0),
    [cartItems]
  );

  const finalTotal = useMemo(
    () => Math.max(0, subtotal - pointsToRedeem),
    [subtotal, pointsToRedeem]
  );

  const items = useMemo(
    () => cartItems.map((i) => ({ sku_code: i.sku_code, qty: i.qty })),
    [cartItems],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError('CART IS EMPTY // PROCUREMENT ABORTED');
      return;
    }
    setIsSubmitting(true);
    // 延遲一點點增加「儀式感」
    await new Promise((r) => setTimeout(r, 800));
    try {
      const salesCode = document.cookie
        .split('; ')
        .find((row) => row.startsWith('sales_code='))
        ?.split('=')[1];

      const result = await createGuestOrder({
        items,
        shipping: { name, phone, email, address },
        sales_code: salesCode,
        points_to_redeem: pointsToRedeem,
      });
      clearCart();
      router.push(
        `/checkout/pay?order_number=${encodeURIComponent(result.order_number)}&method=${paymentMethod}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : common.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display skew-title text-4xl font-semibold tracking-tight">
              <span className="skew-reset">{t.title}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground telemetry">
              {t.subtitle}
            </p>
          </div>
          <Badge variant="muted">{t.step_data}</Badge>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="surface-hover chamfer-lg scanlines">
              <CardHeader>
                <CardTitle className="display text-lg">{t.logistics}</CardTitle>
                <CardDescription className="text-zinc-400 font-medium">{t.logistics_desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t.recipient}</span>
                    <Input
                      placeholder="FULL NAME"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="chamfer-sm focus:border-accent placeholder:text-zinc-500"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t.mobile}</span>
                    <Input
                      placeholder="09xx-xxx-xxx"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="chamfer-sm focus:border-accent placeholder:text-zinc-500"
                    />
                  </label>

                  <label className="grid gap-1.5 sm:col-span-2">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t.email_tracking}</span>
                    <Input
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="chamfer-sm focus:border-accent placeholder:text-zinc-500"
                    />
                  </label>

                  <label className="grid gap-1.5 sm:col-span-2">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t.address}</span>
                    <Input
                      placeholder="FULL ADDRESS"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="chamfer-sm focus:border-accent placeholder:text-zinc-500"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <aside className="space-y-4">
              {pointsBalance !== null && pointsBalance > 0 && (
                <Card className="border-accent/30 bg-accent/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-widest text-accent">{t.points_redeem}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-xs telemetry">
                      <span>{t.available_credits}</span>
                      <span className="font-bold">{pointsBalance.toLocaleString()}</span>
                    </div>
                    <div className="grid gap-1.5">
                      <Input
                        type="number"
                        min={0}
                        max={Math.min(pointsBalance, subtotal)}
                        value={pointsToRedeem}
                        onChange={(e) => setPointsToRedeem(Math.min(pointsBalance, subtotal, Number(e.target.value) || 0))}
                        className="h-8 text-xs font-mono border-accent/20 bg-background/50"
                        placeholder={t.points_to_use}
                      />
                      <p className="text-[9px] text-muted-foreground">{t.redemption_rule}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="surface-hover chamfer-lg">
                <CardHeader>
                  <CardTitle className="display text-lg">{t.gateway}</CardTitle>
                  <CardDescription className="text-zinc-400 font-medium">{t.gateway_desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-t border-border/50 pt-3 mb-3 space-y-1">
                    <div className="flex justify-between text-xs telemetry text-muted-foreground">
                      <span>SUBTOTAL</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {pointsToRedeem > 0 && (
                      <div className="flex justify-between text-xs telemetry text-accent">
                        <span>REDEMPTION</span>
                        <span>-${pointsToRedeem.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black display pt-1">
                      <span>TOTAL</span>
                      <span className="text-accent">${finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <button
                      className={`flex items-center justify-between border px-4 py-3 text-sm transition-all chamfer-sm ${
                        paymentMethod === 'CREDIT'
                          ? 'border-accent bg-accent/10 text-accent glow-red'
                          : 'border-zinc-700 bg-card hover:bg-muted hover:border-zinc-500'
                      }`}
                      onClick={() => setPaymentMethod('CREDIT')}
                      type="button"
                    >
                      <span className="font-bold tracking-widest">{t.credit}</span>
                      <span className="font-mono text-[10px] text-zinc-400">{t.credit_desc}</span>
                    </button>
                    <button
                      className={`flex items-center justify-between border px-4 py-3 text-sm transition-all chamfer-sm ${
                        paymentMethod === 'ATM'
                          ? 'border-accent bg-accent/10 text-accent glow-red'
                          : 'border-zinc-700 bg-card hover:bg-muted hover:border-zinc-500'
                      }`}
                      onClick={() => setPaymentMethod('ATM')}
                      type="button"
                    >
                      <span className="font-bold tracking-widest">{t.wire}</span>
                      <span className="font-mono text-[10px] text-zinc-400">{t.wire_desc}</span>
                    </button>
                  </div>

                  <Button disabled={isSubmitting} type="submit" className="w-full skew-cta mt-4 py-7 text-lg font-black tracking-[0.2em] shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]" size="lg">
                    {isSubmitting ? "TRANSMITTING..." : "AUTHORIZE PROCUREMENT"}
                  </Button>

                  <p className="text-[10px] text-zinc-500 text-center pt-2 font-medium">
                    {t.secure_ssl}
                  </p>

                  {error ? (
                    <div className="border border-red-900/50 bg-red-900/10 p-3 text-sm text-red-400 chamfer-sm">
                      {common.error}: {error}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground text-center telemetry">
                {t.cart_items}: <span className="font-mono text-foreground">{items.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}
