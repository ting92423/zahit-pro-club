'use client';

import { useMemo } from 'react';
import { useCartStore } from '@/features/cart/cart-store';
import type { PublicProduct } from '@/lib/public-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProductList({ 
  products, 
  userTier 
}: { 
  products: PublicProduct[];
  userTier?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const cartSkuSet = useMemo(() => new Set(items.map((i) => i.sku_code)), [items]);

  const sorted = useMemo(() => products, [products]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sorted.map((p) => (
        <Card key={p.id} className="surface-hover chamfer-lg scanlines flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="display text-xl tracking-wide">{p.name}</CardTitle>
            {p.description ? (
              <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                {p.description}
              </p>
            ) : (
              <div className="min-h-[2.5rem]" />
            )}
          </CardHeader>

          <CardContent className="flex-1 space-y-3">
            <div className="flex items-center gap-2 my-2">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-[8px] text-zinc-600 telemetry tracking-[0.3em]">GEAR SPECS</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            {p.skus.map((s) => {
              const disabled = s.stock <= 0;
              const inCart = cartSkuSet.has(s.sku_code);
              
              // Member price logic
              const hasMemberPrice = s.member_price !== null && s.member_price !== undefined && s.member_price < s.price;
              const isEligible = userTier && userTier !== 'GUEST';
              const displayPrice = (isEligible && hasMemberPrice) ? s.member_price : s.price;

              return (
                <div key={s.sku_code} className="flex items-center justify-between gap-4 p-3 border border-border/40 bg-background/20 chamfer-sm group hover:border-accent/30 transition-colors">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                      SKU: {s.sku_code}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg font-bold tabular-nums ${(isEligible && hasMemberPrice) ? 'text-accent' : 'text-foreground'}`}>
                        ${displayPrice}
                      </span>
                      {(isEligible && hasMemberPrice) && (
                        <span className="text-[10px] text-muted-foreground line-through opacity-50">
                          ${s.price}
                        </span>
                      )}
                      {!userTier && hasMemberPrice && (
                        <Badge variant="muted" className="text-[8px] py-0 px-1 opacity-60">MEMBER DEAL</Badge>
                      )}
                    </div>
                    <div className={`text-[9px] mt-1 ${disabled ? 'text-red-500' : 'text-muted-foreground'} telemetry uppercase`}>
                      {disabled ? 'OUT OF STOCK' : `AVAILABLE: ${s.stock}`}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={inCart ? 'secondary' : 'primary'}
                    disabled={disabled}
                    onClick={() =>
                      addItem(
                        { sku_code: s.sku_code, name: p.name, unit_price: displayPrice ?? s.price },
                        1,
                      )
                    }
                    className="shrink-0 h-8 px-4 text-[10px] tracking-tighter skew-cta"
                  >
                    {inCart ? 'ADD MORE' : 'GET GEAR'}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

