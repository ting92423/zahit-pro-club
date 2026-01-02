'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type LedgerRow = { id: string; type: string; points_delta: number; reason: string | null; created_at: string };

export function MemberLedgerClient({ initial, emptyText }: { initial: LedgerRow[]; emptyText: string }) {
  const [items, setItems] = useState<LedgerRow[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initial.length ? initial[initial.length - 1].id : null);
  const [hasMore, setHasMore] = useState(initial.length >= 20);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (!hasMore || !cursor) return;
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({ take: '20', cursor });
      const res = await fetch(`/api/me/ledger?${qs.toString()}`, { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? 'Load failed');
      const data = (json?.data ?? []) as LedgerRow[];
      setItems((prev) => [...prev, ...data]);
      setCursor(json?.meta?.nextCursor ?? (data.length ? data[data.length - 1].id : null));
      setHasMore(data.length >= 20);
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-8 border border-dashed border-border/50 text-center text-xs text-muted-foreground telemetry uppercase">
        {emptyText}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border/50">
              <th className="pb-2 font-medium">TIMESTAMP</th>
              <th className="pb-2 font-medium">PROTOCOL</th>
              <th className="pb-2 font-medium">REASON</th>
              <th className="pb-2 font-medium text-right">DELTA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 font-mono text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleString()}</td>
                <td className="py-3">
                  <Badge variant="muted" className="text-[9px] px-1">
                    {p.type}
                  </Badge>
                </td>
                <td className="py-3 text-muted-foreground">{p.reason ?? '—'}</td>
                <td className={`py-3 text-right font-mono font-bold ${p.points_delta > 0 ? 'text-accent' : 'text-zinc-500'}`}>
                  {p.points_delta > 0 ? `+${p.points_delta}` : p.points_delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

