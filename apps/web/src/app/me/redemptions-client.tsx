'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrSvg } from '@/components/dashboard/qr-svg';

type RedemptionRow = {
  id: string;
  status: string;
  qr_token: string;
  redeemed_at?: string | null;
  created_at: string;
  item: { title: string; description: string | null };
};

export function MemberRedemptionsClient({ initial }: { initial: RedemptionRow[] }) {
  const [items, setItems] = useState<RedemptionRow[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initial.length ? initial[initial.length - 1].id : null);
  const [hasMore, setHasMore] = useState(initial.length >= 20);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (!hasMore || !cursor) return;
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({ take: '20', cursor });
      const res = await fetch(`/api/me/redemptions?${qs.toString()}`, { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? 'Load failed');
      const data = (json?.data ?? []) as RedemptionRow[];
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
        No active vouchers.
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id}>
            <Link
              href={`/me/vouchers/${encodeURIComponent(r.id)}`}
              className="block p-3 border border-border/50 bg-background/30 hover:bg-accent/5 transition-colors group chamfer-sm"
            >
              <div className="flex justify-between items-start">
                <div className="display text-sm group-hover:text-accent transition-colors truncate">{r.item.title}</div>
                <Badge variant={r.status === 'ISSUED' ? 'accent' : 'muted'} className="text-[9px] h-4">
                  {r.status}
                </Badge>
              </div>
              <div className="mt-2 flex justify-center py-2 bg-black/40 rounded border border-border/30">
                <QrSvg text={`zahit://voucher/${r.qr_token}`} className="w-24 h-24" />
              </div>
              <div className="mt-2 text-[9px] text-center text-muted-foreground font-mono truncate">TOKEN: {r.qr_token}</div>
              <div className="mt-2 text-[10px] text-muted-foreground telemetry text-center group-hover:text-accent transition-colors">
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

