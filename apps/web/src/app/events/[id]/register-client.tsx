'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/provider';

type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  eventDate: string;
  maxSlots: number;
  currentSlots: number;
  price: number;
};

type Registration = {
  id: string;
  status: string;
  qrToken: string;
  createdAt: string;
};

function mapsHref(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function googleCalendarLink(event: PublicEvent) {
  const start = new Date(event.eventDate);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours
  
  const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description || '',
    location: event.location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventJoinClient({ event }: { event: PublicEvent }) {
  const { dict } = useI18n();
  const t = dict.events;
  const common = dict.common;

  const [isPending, setIsPending] = useState(false);
  const [showLoadingFx, setShowLoadingFx] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reg, setReg] = useState<Registration | null>(null);

  const isFull = useMemo(() => event.maxSlots > 0 && event.currentSlots >= event.maxSlots, [event.maxSlots, event.currentSlots]);

  useEffect(() => {
    if (!isPending) return;
    const t = window.setTimeout(() => setShowLoadingFx(true), 200);
    return () => window.clearTimeout(t);
  }, [isPending]);

  async function join() {
    setError(null);
    setIsPending(true);
    setShowLoadingFx(false);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(event.id)}/register`, { method: 'POST' });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? common.error);

      const data = json.data as any;
      setReg({
        id: data.id,
        status: data.status,
        qrToken: data.qrToken,
        createdAt: data.createdAt,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : common.error);
    } finally {
      setIsPending(false);
      setShowLoadingFx(false);
    }
  }

  if (reg) {
    return (
      <div className="border border-accent/50 bg-accent/5 p-4 chamfer-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-accent tracking-widest uppercase">{t.entry_confirmed}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t.confirmed_desc}</div>
          </div>
          <Badge variant="success" className="animate-pulse">{common.confirmed}</Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="border border-border bg-background p-3 chamfer-sm">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{common.status}</div>
            <div className="mt-1 font-mono text-sm text-accent">{reg.status}</div>
          </div>
          <div className="border border-border bg-background p-3 chamfer-sm">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.copy_token}</div>
            <div className="mt-1 font-mono text-xs break-all">{reg.qrToken}</div>
          </div>
        </div>

        {event.location ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={mapsHref(event.location)} rel="noreferrer" target="_blank">
              <Button>{t.navigate_venue}</Button>
            </a>
            <a href={googleCalendarLink(event)} rel="noreferrer" target="_blank">
              <Button variant="secondary">{t.add_calendar}</Button>
            </a>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(reg.qrToken)} type="button">
              {t.copy_token}
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={googleCalendarLink(event)} rel="noreferrer" target="_blank">
              <Button variant="secondary">{t.add_calendar}</Button>
            </a>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(reg.qrToken)} type="button">
              {t.copy_token}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border bg-card p-4 chamfer-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold tracking-widest uppercase">{t.quick_entry}</div>
          <div className="mt-1 text-sm text-muted-foreground">{t.quick_entry_desc}</div>
        </div>
        <Badge variant="accent">MEMBER</Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={isPending || isFull} onClick={join} type="button" className="skew-cta w-full sm:w-auto">
          {isFull ? t.grid_full : isPending ? t.locking : t.confirm_entry}
        </Button>
        {showLoadingFx ? <span className="text-xs text-accent animate-pulse font-mono">{t.system_locking}</span> : null}
      </div>

      {error ? (
        <div className="mt-4 border border-red-900/50 bg-red-900/10 p-3 text-sm chamfer-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold text-red-400">{t.entry_denied}</div>
            <Badge variant="danger">{common.error}</Badge>
          </div>
          <div className="mt-2 text-sm text-red-300/80">{error}</div>
        </div>
      ) : null}
    </div>
  );
}
