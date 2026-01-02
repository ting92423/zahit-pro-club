import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { TIER_THRESHOLDS, getNextTier } from '@/lib/shared-lite';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDict } from '@/lib/i18n';

type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  eventDate: string;
  maxSlots: number;
  currentSlots: number;
  price: number;
  minTier: string;
};

async function getMeIfMember() {
  const c = await cookies();
  const token = c.get('auth_token')?.value;
  if (!token) return null;

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3001';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/me`, {
    cache: 'no-store',
    headers: { authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as any;
  if (!res.ok) return null;
  return json.data as { tier: string } | null;
}

async function getPublicEvents() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3001';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/events/public`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load events');
  return (json.data ?? []) as PublicEvent[];
}

export default async function EventsPage() {
  const [events, me] = await Promise.all([getPublicEvents(), getMeIfMember()]);
  const dict = await getDict();
  const t = dict.events;

  const userTierScore = TIER_THRESHOLDS[me?.tier as keyof typeof TIER_THRESHOLDS] ?? 0;

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-4xl font-semibold tracking-tight skew-title">
              <span className="skew-reset">{t.title}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground telemetry">{t.subtitle}</p>
          </div>
          <Badge variant="accent">{t.public_access}</Badge>
        </div>

        {events.length === 0 ? (
          <Card className="mt-8 surface-hover chamfer-lg border-dashed animate-in fade-in zoom-in-95 duration-500">
            <CardHeader>
              <CardTitle className="display text-2xl">{t.no_races}</CardTitle>
              <CardDescription className="text-base">{t.no_races_desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link href="/services">
                <Button variant="secondary" className="px-8">{t.view_membership}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {events.map((e, i) => {
              const dateText = new Date(e.eventDate).toLocaleString();
              const slotsLeft = e.maxSlots > 0 ? Math.max(0, e.maxSlots - e.currentSlots) : null;
              const requiredTierScore = TIER_THRESHOLDS[e.minTier as keyof typeof TIER_THRESHOLDS] ?? 0;
              const isLocked = userTierScore < requiredTierScore;

              return (
                <Card
                  key={e.id}
                  className={`surface-hover track-bar chamfer-lg animate-in fade-in slide-in-from-bottom-4 duration-500 ${isLocked ? 'opacity-80 grayscale-[0.5]' : ''}`}
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isLocked && <Badge variant="muted" className="bg-red-900/20 text-red-400 border-red-900/30">LOCKED</Badge>}
                          {e.minTier !== 'GUEST' && (
                            <Badge variant="muted" className="text-[9px] tracking-tighter uppercase font-mono">
                              REQ: {e.minTier}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className={`display text-xl glitch ${isLocked ? 'text-foreground/60' : ''}`}>{e.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2 telemetry text-xs uppercase tracking-wide text-zinc-300">
                          <span>{dateText}</span>
                          {e.location ? <span className="text-zinc-500"> // {e.location}</span> : null}
                        </CardDescription>
                      </div>
                      {slotsLeft === null ? (
                        <Badge variant="muted">{t.open_entry}</Badge>
                      ) : slotsLeft > 0 ? (
                        <Badge variant="success">{t.slots}: {slotsLeft}</Badge>
                      ) : (
                        <Badge variant="danger">{t.full}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3 pt-4">
                    <div className="text-xs text-zinc-400 line-clamp-2 max-w-[70%] font-medium">
                      {isLocked ? `此任務僅限 ${e.minTier} 以上權限等級。` : (e.description || t.no_briefing)}
                    </div>
                    {isLocked ? (
                      <Link href="/me">
                        <Button size="sm" variant="secondary" className="text-[10px]">UPGRADE</Button>
                      </Link>
                    ) : (
                      <Link href={`/events/${e.id}`}>
                        <Button size="sm" className="skew-cta">{t.enter_race}</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
