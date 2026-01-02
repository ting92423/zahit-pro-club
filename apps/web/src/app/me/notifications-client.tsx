'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type NotificationDto = {
  id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export function MemberNotificationsClient({ initial }: { initial: NotificationDto[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAllBusy, setIsAllBusy] = useState(false);

  const [items, setItems] = useState<NotificationDto[]>(initial);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [sort, setSort] = useState<'latest' | 'unread'>('latest');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [type, setType] = useState<string>('');

  const unreadCount = useMemo(() => items.filter((n) => !n.is_read).length, [items]);

  async function loadFirst() {
    setIsLoadingMore(true);
    try {
      const qs = new URLSearchParams();
      qs.set('take', '20');
      qs.set('sort', sort);
      if (unreadOnly) qs.set('unreadOnly', 'true');
      if (type) qs.set('type', type);
      const res = await fetch(`/api/notifications?${qs.toString()}`, { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? 'Load failed');
      const data = (json?.data ?? []) as NotificationDto[];
      setItems(data);
      setCursor(json?.meta?.nextCursor ?? (data.length ? data[data.length - 1].id : null));
      setHasMore(data.length >= 20);
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function loadMore() {
    if (!hasMore || !cursor) return;
    setIsLoadingMore(true);
    try {
      const qs = new URLSearchParams();
      qs.set('take', '20');
      qs.set('cursor', cursor);
      qs.set('sort', sort);
      if (unreadOnly) qs.set('unreadOnly', 'true');
      if (type) qs.set('type', type);
      const res = await fetch(`/api/notifications?${qs.toString()}`, { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? 'Load failed');
      const data = (json?.data ?? []) as NotificationDto[];
      setItems((prev) => [...prev, ...data]);
      const next = json?.meta?.nextCursor ?? (data.length ? data[data.length - 1].id : null);
      setCursor(next);
      setHasMore(data.length >= 20);
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    // whenever sort/filter changes, refetch first page
    loadFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, unreadOnly, type]);

  async function markRead(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? 'Mark read failed');
      // optimistic update
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      router.refresh(); // keep server data in sync
    } finally {
      setBusyId(null);
    }
  }

  async function markAllRead() {
    setIsAllBusy(true);
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? 'Mark all read failed');
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      router.refresh();
    } finally {
      setIsAllBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" variant={sort === 'latest' ? 'primary' : 'secondary'} className="h-7 text-[9px] font-bold px-3" onClick={() => setSort('latest')}>
              最新在上
            </Button>
            <Button size="sm" variant={sort === 'unread' ? 'primary' : 'secondary'} className="h-7 text-[9px] font-bold px-3" onClick={() => setSort('unread')}>
              未讀優先
            </Button>
            <Button size="sm" variant={unreadOnly ? 'primary' : 'secondary'} className="h-7 text-[9px] font-bold px-3" onClick={() => setUnreadOnly((v) => !v)}>
              只看未讀
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded-none border border-border bg-background px-2 text-[10px] telemetry"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">全部類型</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="PROMO">PROMO</option>
              <option value="ALERT">ALERT</option>
            </select>
            {unreadCount > 0 ? (
              <Button size="sm" variant="secondary" className="h-7 text-[9px] font-bold px-3" disabled={isAllBusy} onClick={markAllRead}>
                {isAllBusy ? 'SYNC...' : '全部已讀'}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="p-8 border border-dashed border-border/50 text-center text-xs text-muted-foreground telemetry uppercase">
          {isLoadingMore ? 'SYNCING...' : 'No transmissions received.'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={sort === 'latest' ? 'primary' : 'secondary'} className="h-7 text-[9px] font-bold px-3" onClick={() => setSort('latest')}>
            最新在上
          </Button>
          <Button size="sm" variant={sort === 'unread' ? 'primary' : 'secondary'} className="h-7 text-[9px] font-bold px-3" onClick={() => setSort('unread')}>
            未讀優先
          </Button>
          <Button size="sm" variant={unreadOnly ? 'primary' : 'secondary'} className="h-7 text-[9px] font-bold px-3" onClick={() => setUnreadOnly((v) => !v)}>
            只看未讀
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-7 rounded-none border border-border bg-background px-2 text-[10px] telemetry"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">全部類型</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="PROMO">PROMO</option>
            <option value="ALERT">ALERT</option>
          </select>
          <div className="text-[10px] text-muted-foreground telemetry uppercase">
            未讀：<span className="text-foreground font-bold">{unreadCount}</span>
          </div>
          {unreadCount > 0 ? (
            <Button size="sm" variant="secondary" className="h-7 text-[9px] font-bold px-3" disabled={isAllBusy} onClick={markAllRead}>
              {isAllBusy ? 'SYNC...' : '全部已讀'}
            </Button>
          ) : null}
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((n) => (
          <li
            key={n.id}
            className={`p-4 border chamfer-sm transition-all ${
              n.is_read ? 'border-border/30 bg-background/20 opacity-60' : 'border-accent/40 bg-accent/5'
            }`}
          >
            <div className="flex justify-between items-start gap-3 mb-1">
              <span className="text-[10px] font-bold text-accent tracking-widest uppercase">[{n.type}]</span>
              <span className="text-[9px] text-muted-foreground telemetry">{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="display text-base mb-1">{n.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{n.content}</p>
              </div>
              {!n.is_read ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-[9px] font-bold px-3 whitespace-nowrap"
                  disabled={busyId === n.id}
                  onClick={() => markRead(n.id)}
                >
                  {busyId === n.id ? 'SYNC...' : 'MARK READ'}
                </Button>
              ) : (
                <Badge variant="muted" className="text-[9px] h-5">
                  READ
                </Badge>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-center">
        {hasMore ? (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 text-[10px] font-bold px-4"
            disabled={isLoadingMore || !cursor}
            onClick={loadMore}
          >
            {isLoadingMore ? '載入中…' : '載入更多'}
          </Button>
        ) : (
          <div className="text-[10px] text-muted-foreground telemetry uppercase">END OF LOG</div>
        )}
      </div>
    </div>
  );
}

