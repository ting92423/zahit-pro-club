'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { TIERS } from '@/lib/shared-lite';

type EventRow = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  eventDate: string;
  maxSlots: number;
  currentSlots: number;
  price: number;
  minTier: string;
  isActive: boolean;
};

export function AdminEventsClient() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxSlots, setMaxSlots] = useState<number>(20);
  const [price, setPrice] = useState<number>(0);
  const [minTier, setMinTier] = useState<string>('GUEST');
  const [isCreating, setIsCreating] = useState(false);

  const canCreate = useMemo(() => title.trim() && eventDate, [title, eventDate]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/events', { cache: 'no-store' });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '載入失敗');
      setEvents(json.data as EventRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setError(null);
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title,
          location: location || undefined,
          eventDate,
          maxSlots: Number(maxSlots),
          price: Number(price),
          minTier,
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '建立失敗');
      setTitle('');
      setLocation('');
      setEventDate('');
      setMaxSlots(20);
      setPrice(0);
      setMinTier('GUEST');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '建立失敗');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-medium">建立活動</div>
        <p className="mt-2 text-sm text-muted-foreground">先做最小可營運：標題/時間/名額/費用。</p>

        <form className="mt-4 grid gap-3" onSubmit={createEvent}>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">活動標題</span>
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              placeholder="例如：拉花體驗課"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">地點（可選）</span>
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              placeholder="店內 / 外場..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">時間</span>
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              required
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">名額</span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                min={0}
                type="number"
                value={maxSlots}
                onChange={(e) => setMaxSlots(Number(e.target.value))}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">費用</span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                min={0}
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">最低等級要求</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={minTier}
              onChange={(e) => setMinTier(e.target.value)}
            >
              {Object.values(TIERS).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
            disabled={isCreating || !canCreate}
            type="submit"
          >
            {isCreating ? '建立中…' : '建立活動'}
          </button>
        </form>

        {error ? <div className="mt-3 rounded-md border border-border bg-muted p-3 text-sm">{error}</div> : null}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">活動列表</div>
          <button
            className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-60"
            disabled={isLoading}
            onClick={load}
            type="button"
          >
            重新整理
          </button>
        </div>

        {isLoading ? (
          <div className="mt-3 text-sm text-muted-foreground">載入中…</div>
        ) : events.length === 0 ? (
          <div className="mt-3 text-sm text-muted-foreground">目前沒有活動。</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">標題</th>
                  <th className="px-3 py-2">時間</th>
                  <th className="px-3 py-2">等級要求</th>
                  <th className="px-3 py-2">名額</th>
                  <th className="px-3 py-2">費用</th>
                  <th className="px-3 py-2">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-muted/40">
                    <td className="px-3 py-3">
                      <div className="font-medium">{ev.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{ev.location ?? '—'}</div>
                    </td>
                    <td className="px-3 py-3 text-xs">{new Date(ev.eventDate).toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs">
                      <span className={`rounded px-1.5 py-0.5 font-bold ${ev.minTier !== 'GUEST' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        {ev.minTier}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {ev.currentSlots}/{ev.maxSlots || '∞'}
                    </td>
                    <td className="px-3 py-3 text-xs">{ev.price}</td>
                    <td className="px-3 py-3">
                      <Link className="text-xs underline" href={`/admin/events/${ev.id}`}>
                        看名單 / 核銷
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

