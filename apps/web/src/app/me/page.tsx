import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getNextTier } from '@zahit/shared';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrSvg } from '@/components/dashboard/qr-svg';
import { getDict } from '@/lib/i18n';
import { MemberNotificationsClient } from './notifications-client';
import { LogoutButton } from './logout-button';
import { MemberProfileClient } from './profile-client';
import { MemberOrdersClient } from './orders-client';
import { MemberRegistrationsClient } from './registrations-client';
import { MemberRedemptionsClient } from './redemptions-client';
import { MemberLedgerClient } from './ledger-client';

async function getMe() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/me`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) return null;
  const data = (json?.data ?? null) as any;
  if (!data) return null;
  // Defensive defaults: API may omit empty relations depending on query/select.
  return {
    ...data,
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    redemptions: Array.isArray(data.redemptions) ? data.redemptions : [],
    point_ledger: Array.isArray(data.point_ledger) ? data.point_ledger : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
    registrations: Array.isArray(data.registrations) ? data.registrations : [],
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
  } as {
    id: string;
    name: string;
    phone: string;
    email: string;
    address?: string | null;
    car?: { brand?: string | null; model?: string | null; year?: number | null; plate?: string | null } | null;
    tier: string;
    points_balance: number;
    total_spent: number;
    benefits: string[];
    notifications: Array<{ id: string; title: string; content: string; type: string; is_read: boolean; created_at: string }>;
    redemptions: Array<{ id: string; status: string; qr_token: string; created_at: string; item: { title: string; description: string | null } }>;
    point_ledger: Array<{ id: string; type: string; points_delta: number; reason: string | null; created_at: string }>;
    orders: Array<{ id: string; order_number: string; status: string; total_amount: number; created_at: string }>;
    registrations: Array<{
      id: string;
      status: string;
      qr_token: string;
      created_at: string;
      event: { id: string; title: string; event_date: string; location: string | null };
    }>;
  } | null;
}

export default async function MePage() {
  const me = await getMe();
  if (!me) redirect('/login?next=/me');
  const dict = await getDict();
  const t = dict.me;

  const tierClearance: Record<string, number> = {
    GUEST: 1,
    PRO: 2,
    ELITE: 3,
    'Z-MASTER': 4,
  };
  const clearance = tierClearance[me.tier] ?? 1;

  const { next, target } = getNextTier(me.tier);
  const progress = Math.min(1, me.total_spent / target);
  const remain = Math.max(0, target - me.total_spent);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="display skew-title text-3xl font-semibold tracking-tight">
              <span className="skew-reset">{t.title}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground telemetry">ID: {me.id.split('-')[0].toUpperCase()} // {me.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/orders/lookup">
              <Button variant="secondary" size="sm">{t.guest_lookup}</Button>
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
            {/* Digital Identity Card */}
            <div className="border border-border bg-card p-6 chamfer-lg scanlines relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent/50" />
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Digital Identity // Card</div>
              
              <div className="flex justify-center py-4 bg-zinc-950/50 chamfer-sm border border-border/50 group-hover:border-accent/30 transition-colors">
                <QrSvg text={`zahit://member/${me.id}`} className="w-40 h-40" />
              </div>

              <div className="mt-6 space-y-1">
                <div className="display text-xl font-bold italic">{me.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground break-all">UID: {me.id}</div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <Badge variant={me.tier === 'Z-MASTER' ? 'accent' : 'muted'}>{me.tier}</Badge>
                <span className="text-[9px] text-zinc-500 telemetry uppercase">Security Clear: Level 0{clearance}</span>
              </div>
            </div>

            <div className="border border-border bg-card p-6 chamfer-lg">
              <div className="display text-lg mb-4">OPERATOR STATS</div>
              <div className="space-y-4">
                <div className="p-4 border border-border bg-background/40 chamfer-sm">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{t.avail_points}</div>
                  <div className="text-2xl font-black font-mono text-accent">{me.points_balance.toLocaleString()}</div>
                </div>
                <div className="p-4 border border-border bg-background/40 chamfer-sm">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{t.total_spend}</div>
                  <div className="text-2xl font-black font-mono">${me.total_spent.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card p-6 chamfer-lg">
              <div className="display text-lg mb-4">{t.profile}</div>
              <MemberProfileClient
                initialName={me.name}
                initialPhone={me.phone || ''}
                initialAddress={me.address || ''}
                initialCar={me.car ? {
                  brand: me.car.brand || undefined,
                  model: me.car.model || undefined,
                  year: me.car.year || undefined,
                  plate: me.car.plate || undefined,
                } : undefined}
              />
            </div>

            <div className="border border-border bg-card p-6 chamfer-lg">
              <div className="display text-lg mb-4">BENEFITS</div>
              {me.benefits.length === 0 ? (
                <div className="text-xs text-muted-foreground telemetry uppercase">No benefits configured.</div>
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {me.benefits.map((b, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-accent">—</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="border border-border bg-card p-6 chamfer-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="display text-lg">{t.tier_progress}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">
                  {next ? t.to_next.replace('{next}', next).replace('{amount}', remain.toLocaleString()) : t.max_tier}
                </div>
              </div>
              <div className="relative h-2 w-full bg-zinc-900/50 chamfer-sm overflow-hidden border border-border/50">
                <div 
                  className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)] transition-all duration-1000" 
                  style={{ width: `${progress * 100}%` }} 
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Order History */}
              <div className="border border-border bg-card p-6 chamfer-lg scanlines min-h-[400px]">
                <div className="display text-lg mb-4 uppercase tracking-widest">{t.orders}</div>
                <MemberOrdersClient initial={me.orders} />
              </div>

            {/* Event History */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-border bg-card p-6 chamfer-lg scanlines min-h-[400px]">
                <div className="display text-lg mb-4 uppercase tracking-widest">{t.race_history}</div>
                <MemberRegistrationsClient initial={me.registrations} />
              </div>

              {/* Vouchers / Redemptions */}
              <div className="border border-border bg-card p-6 chamfer-lg scanlines min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="display text-lg uppercase tracking-widest">{t.redemptions}</div>
                  <Link href="/redemptions">
                    <Button variant="secondary" size="sm" className="h-7 text-[9px] font-bold px-3">EXCHANGE PTS</Button>
                  </Link>
                </div>
                <MemberRedemptionsClient initial={me.redemptions} />
              </div>
            </div>
            </div>

            {/* Notifications / Comms */}
            <div className="border border-border bg-card p-6 chamfer-lg relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300" style={{ animationFillMode: 'both' }}>
              <div className="absolute top-0 right-0 p-3 opacity-5 font-mono text-6xl font-bold select-none">COMMS</div>
              <div className="display text-lg mb-4 uppercase tracking-widest">{t.notifications}</div>
              <MemberNotificationsClient initial={me.notifications} />
            </div>

            {/* Point Ledger */}
            <div className="border border-border bg-card p-6 chamfer-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5 font-mono text-6xl font-bold select-none">LEDGER</div>
              <div className="display text-lg mb-4">{t.ledger}</div>
              <MemberLedgerClient initial={me.point_ledger} emptyText={t.no_ledger} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
