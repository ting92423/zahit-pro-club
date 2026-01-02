'use client';

import { useEffect, useMemo, useState } from 'react';

type RegistrationRow = {
  id: string;
  eventId: string;
  memberId: string | null;
  name: string;
  phone: string;
  email: string;
  status: string;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
};

type EventRow = {
  id: string;
  title: string;
  location: string | null;
  eventDate: string;
  maxSlots: number;
  currentSlots: number;
  price: number;
};

export function AdminEventDetailClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [regs, setRegs] = useState<RegistrationRow[]>([]);
  const [q, setQ] = useState('');

  const [qrToken, setQrToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return regs;
    return regs.filter((r) => {
      return (
        r.name.toLowerCase().includes(query) ||
        r.phone.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.qrToken.toLowerCase().includes(query)
      );
    });
  }, [regs, q]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/registrations`, { cache: 'no-store' });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '載入失敗');
      setEvent(json.data.event);
      setRegs(json.data.registrations);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [eventId]);

  async function checkIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setIsCheckingIn(true);
    try {
      const res = await fetch('/api/admin/events/checkin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ qr_token: qrToken }),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '核銷失敗');
      setOkMsg('核銷成功');
      setQrToken('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '核銷失敗');
    } finally {
      setIsCheckingIn(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-medium">活動資訊</div>
          {isLoading ? (
            <div className="mt-3 text-sm text-muted-foreground">載入中…</div>
          ) : event ? (
            <div className="mt-3 text-sm">
              <div className="font-medium">{event.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(event.eventDate).toLocaleString()}
                {event.location ? ` · ${event.location}` : ''}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                名額：{event.currentSlots}/{event.maxSlots || '∞'}｜費用：{event.price}
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-muted-foreground">找不到活動</div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-medium">報到核銷</div>
          <p className="mt-2 text-sm text-muted-foreground">
            將 QR token 貼上即可核銷（不需相機串接）。
          </p>
          <form className="mt-4 grid gap-3" onSubmit={checkIn}>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">QR Token</span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm font-mono"
                placeholder="16 bytes hex..."
                required
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
              />
            </label>
            <button
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
              disabled={isCheckingIn}
              type="submit"
            >
              {isCheckingIn ? '核銷中…' : '確認核銷'}
            </button>
          </form>

          {okMsg ? <div className="mt-3 rounded-md border border-border bg-muted p-3 text-sm">{okMsg}</div> : null}
          {error ? <div className="mt-3 rounded-md border border-border bg-muted p-3 text-sm">{error}</div> : null}
        </div>
      </aside>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-medium">報名名單</div>
            <div className="mt-1 text-xs text-muted-foreground">支援搜尋姓名/電話/Email/QR。</div>
          </div>
          <button
            className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
            onClick={load}
            type="button"
          >
            重新整理
          </button>
        </div>

        <div className="mt-4">
          <input
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="搜尋：姓名 / 電話 / Email / QR token"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="mt-4 text-sm text-muted-foreground">載入中…</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">姓名</th>
                  <th className="px-3 py-2">電話</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">狀態</th>
                  <th className="px-3 py-2">QR Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className="px-3 py-3 font-medium">{r.name}</td>
                    <td className="px-3 py-3 text-xs">{r.phone}</td>
                    <td className="px-3 py-3 text-xs">{r.email}</td>
                    <td className="px-3 py-3 text-xs">
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5">{r.status}</span>
                    </td>
                    <td className="px-3 py-3 font-mono text-[10px] text-muted-foreground">{r.qrToken}</td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                      沒有符合條件的名單
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

