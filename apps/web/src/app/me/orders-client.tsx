'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type OrderRow = { id: string; order_number: string; status: string; total_amount: number; created_at: string };

export function MemberOrdersClient({ initial }: { initial: OrderRow[] }) {
  const [items, setItems] = useState<OrderRow[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initial.length ? initial[initial.length - 1].id : null);
  const [hasMore, setHasMore] = useState(initial.length >= 20);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (!hasMore || !cursor) return;
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({ take: '20', cursor });
      const res = await fetch(`/api/me/orders?${qs.toString()}`, { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? 'Load failed');
      const data = (json?.data ?? []) as OrderRow[];
      setItems((prev) => [...prev, ...data]);
      setCursor(json?.meta?.nextCursor ?? (data.length ? data[data.length - 1].id : null));
      setHasMore(data.length >= 20);
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="h-40 flex flex-col items-center justify-center border border-dashed border-border/50 chamfer-sm text-xs text-muted-foreground telemetry uppercase">
        NO PROCUREMENT DATA.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-border/30" />
        <span className="text-[8px] text-zinc-600 telemetry tracking-[0.2em]">PROCUREMENT_FEED_V2.1</span>
        <div className="h-px flex-1 bg-border/30" />
      </div>
      <ul className="space-y-3">
        {items.map((o) => (
          <li key={o.id}>
            <Link
              href={`/me/orders/${encodeURIComponent(o.order_number)}`}
              className="block p-3 border border-border/50 bg-background/30 hover:bg-accent/5 transition-colors group chamfer-sm"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold group-hover:text-accent transition-colors">
                  #{o.order_number}
                </span>
                <Badge variant="muted" className="text-[9px] h-4">
                  {o.status}
                </Badge>
              </div>
              <div className="mt-2 flex justify-between items-end">
                <span className="text-[10px] text-muted-foreground telemetry">{new Date(o.created_at).toLocaleDateString()}</span>
                <span className="font-bold">${o.total_amount.toLocaleString()}</span>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground telemetry group-hover:text-accent transition-colors">
                查看詳情 →
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-center">
        {hasMore ? (
          <Button size="sm" variant="secondary" className="h-8 text-[10px] font-bold px-4" disabled={isLoading} onClick={loadMore}>
            {isLoading ? '載入中…' : '載入更多'}
          </Button>
        ) : (
          <div className="text-[10px] text-muted-foreground telemetry uppercase">END OF LOG</div>
        )}
      </div>
    </div>
  );
}

