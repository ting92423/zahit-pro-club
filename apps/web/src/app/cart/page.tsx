'use client';

import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/features/cart/cart-store';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.qty, 0);

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-70" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <h1 className="display text-4xl font-bold tracking-tighter sm:text-6xl uppercase italic">CART</h1>
        <p className="mt-2 text-xs text-zinc-500 telemetry uppercase tracking-[0.2em]">
          Current selection staging for secure procurement.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="surface-hover chamfer-lg scanlines">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="display text-lg tracking-widest">INVENTORY SELECTION</CardTitle>
            </CardHeader>
            {items.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground telemetry uppercase">
                Selection empty. <Link className="text-accent underline underline-offset-4" href="/products">ACCESS ARMORY</Link>
              </div>
            ) : (
              <ul className="divide-y divide-border/30">
                {items.map((item) => (
                  <li key={item.sku_code} className="flex items-center justify-between gap-4 p-5 hover:bg-accent/5 transition-colors">
                    <div className="min-w-0">
                      <div className="truncate text-base font-bold italic display">{item.name}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground font-mono telemetry uppercase">
                        {item.sku_code} // UNIT: ${item.unit_price}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          className="h-8 w-8 rounded-none border border-border bg-card shadow-sm transition hover:bg-muted focus:ring-1 focus:ring-accent"
                          onClick={() => setQty(item.sku_code, item.qty - 1)}
                          type="button"
                        >
                          −
                        </button>
                        <div className="w-8 text-center text-xs font-mono font-bold">{item.qty}</div>
                        <button
                          className="h-8 w-8 rounded-none border border-border bg-card shadow-sm transition hover:bg-muted focus:ring-1 focus:ring-accent"
                          onClick={() => setQty(item.sku_code, item.qty + 1)}
                          type="button"
                        >
                          +
                        </button>
                        <button
                          className="ml-4 text-[9px] text-zinc-500 hover:text-red-400 telemetry uppercase transition-colors"
                          onClick={() => removeItem(item.sku_code)}
                          type="button"
                        >
                          [ EJECT ]
                        </button>
                      </div>
                    </div>
                    <div className="text-lg font-black font-mono">${item.unit_price * item.qty}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <aside className="space-y-4">
            <div className="border border-border bg-card p-6 chamfer-lg">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Summary // Total</div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground telemetry uppercase">Subtotal</div>
                <div className="text-2xl font-black font-mono">${subtotal}</div>
              </div>
              <div className="mt-4 h-px bg-border/50" />
              <div className="mt-4 text-[9px] text-zinc-500 telemetry leading-relaxed uppercase">
                LOGISTICS AND TRANSACTION PROTOCOLS WILL BE CONFIGURED IN THE NEXT PHASE.
              </div>

              <Link className="mt-6 block" href="/checkout">
                <Button className="w-full skew-cta py-6 text-base font-bold tracking-widest">PROCEED TO CHECKOUT</Button>
              </Link>
            </div>

            <div className="p-4 border border-border bg-accent/5 chamfer-sm">
              <div className="text-[9px] text-accent font-bold telemetry uppercase tracking-widest mb-1">Status: Authenticated?</div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Existing operators can authenticate during checkout to apply clearance-level discounts.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

