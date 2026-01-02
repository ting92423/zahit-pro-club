'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type RegistrationRow = {
  id: string;
  status: string;
  qr_token: string;
  created_at: string;
  event: { id: string; title: string; event_date: string; location: string | null };
};

export function MemberRegistrationsClient({ initial }: { initial: RegistrationRow[] }) {
  const [items, setItems] = useState<RegistrationRow[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initial.length ? initial[initial.length - 1].id : null);
  const [hasMore, setHasMore] = useState(initial.length >= 20);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (!hasMore || !cursor) return;
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({ take: '20', cursor });
      const res = await fetch(`/api/me/registrations?${qs.toString()}`, { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? 'Load failed');
      const data = (json?.data ?? []) as RegistrationRow[];
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
        No mission records.
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id}>
            <Link
              href={`/me/missions/${encodeURIComponent(r.id)}`}
              className="block p-3 border border-border/50 bg-background/30 hover:bg-accent/5 transition-colors group chamfer-sm"
            >
              <div className="display text-sm group-hover:text-accent transition-colors truncate">{r.event.title}</div>
              <div className="mt-1 flex justify-between items-end">
                <span className="text-[10px] text-muted-foreground telemetry">{new Date(r.event.event_date).toLocaleDateString()}</span>
                <Badge variant={r.status === 'PAID' ? 'success' : 'muted'} className="text-[9px] h-4">
                  {r.status}
                </Badge>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground telemetry group-hover:text-accent transition-colors">
                查看入場憑證 →
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

