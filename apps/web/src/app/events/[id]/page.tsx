import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { TIER_THRESHOLDS } from '@/lib/shared-lite';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EventJoinClient } from './register-client';

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

async function getPublicEvent(id: string) {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3001';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/events/public/${encodeURIComponent(id)}`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load event');
  return json.data as PublicEvent;
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, me] = await Promise.all([getPublicEvent(id), getMeIfMember()]);

  const userTierScore = TIER_THRESHOLDS[me?.tier as keyof typeof TIER_THRESHOLDS] ?? 0;
  const requiredTierScore = TIER_THRESHOLDS[event.minTier as keyof typeof TIER_THRESHOLDS] ?? 0;
  const isLocked = userTierScore < requiredTierScore;

  const dateText = new Date(event.eventDate).toLocaleString();
  const slotsLeft = event.maxSlots > 0 ? Math.max(0, event.maxSlots - event.currentSlots) : null;

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <Link href="/events">
              <Button variant="secondary" size="sm" className="h-8 px-4 text-[10px] font-bold">
                ← BACK TO OPS
              </Button>
            </Link>
            <Badge variant="muted" className="telemetry text-[9px] uppercase tracking-widest h-5">MISSION INTEL</Badge>
          </div>
          <div className="flex gap-2">
            {event.minTier !== 'GUEST' && (
              <Badge variant="accent" className="font-mono text-[9px] h-5">REQUIRED: {event.minTier}</Badge>
            )}
            {slotsLeft === null ? (
              <Badge variant="muted" className="h-5 text-[9px]">OPEN ENROLLMENT</Badge>
            ) : slotsLeft > 0 ? (
              <Badge variant="success" className="h-5 text-[9px]">SLOTS AVAILABLE: {slotsLeft}</Badge>
            ) : (
              <Badge variant="danger" className="h-5 text-[9px]">CAPACITY REACHED</Badge>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card className="surface-hover track-bar chamfer-lg scanlines">
              <CardHeader className="p-8">
                <CardTitle className="display text-4xl font-black italic">{event.title}</CardTitle>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 telemetry text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">DATE //</span>
                    <span className="font-mono">{dateText}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-bold">COORD //</span>
                      <span className="font-mono uppercase">{event.location}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="h-px bg-border/50" />
                
                {isLocked ? (
                  <div className="p-10 border border-dashed border-red-900/50 bg-red-900/5 text-center chamfer-sm">
                    <div className="text-red-500 font-black display text-xl mb-2">RESTRICTED ACCESS</div>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      此任務情資僅限 <span className="text-foreground font-bold">{event.minTier}</span> 以上權限等級的操作員存取。
                    </p>
                    <Link href="/me" className="mt-6 inline-block">
                      <Button variant="primary" className="skew-cta">提升權限等級</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] mb-4 uppercase">[ MISSION BRIEFING ]</div>
                    <div className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {event.description || 'No additional deployment data provided for this operation.'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="surface-hover chamfer-lg">
              <CardHeader>
                <CardTitle className="display text-lg tracking-widest">DEPLOYMENT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-border bg-background/40 chamfer-sm">
                  <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1">Entry Fee</div>
                  <div className="text-2xl font-black font-mono">
                    {event.price > 0 ? `$${event.price.toLocaleString()}` : 'FREE ACCESS'}
                  </div>
                </div>

                {!me ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground text-center">Identity verification required for mission entry.</p>
                    <Link href={`/login?next=/events/${id}`} className="block">
                      <Button className="w-full skew-cta" size="lg">AUTHENTICATE</Button>
                    </Link>
                  </div>
                ) : isLocked ? (
                  <Button disabled className="w-full opacity-50" variant="secondary" size="lg">INSUFFICIENT CLEARANCE</Button>
                ) : (
                  <EventJoinClient event={event} />
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

