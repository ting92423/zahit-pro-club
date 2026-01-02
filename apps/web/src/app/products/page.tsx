import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPublicProducts } from '@/lib/public-products';
import { getDict } from '@/lib/i18n';
import { ProductList } from './product-list';

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

export default async function ProductsPage() {
  const [products, me, dict] = await Promise.all([
    getPublicProducts(),
    getMeIfMember(),
    getDict(),
  ]);

  const t = dict.home.kpi;

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-70" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display skew-title text-5xl font-bold tracking-tighter sm:text-7xl">
              <span className="skew-reset">{t.shop}</span>
            </h1>
            <p className="mt-4 max-w-[600px] text-zinc-400 telemetry uppercase tracking-widest text-xs">
              Selected defensive upgrades for your legacy. Engineered for precision.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge variant="accent" className="font-mono text-[10px] tracking-[0.2em] opacity-80">
              SUPPLY STATUS: ACTIVE
            </Badge>
            {me && (
              <div className="text-[10px] text-zinc-500 telemetry uppercase">
                Operator Clearance: <span className="text-accent font-bold">{me.tier}</span>
              </div>
            )}
            <Link href="/cart">
              <Button size="lg" variant="secondary" className="skew-cta">
                VIEW CART
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <ProductList products={products} userTier={me?.tier} />
        </div>
      </main>
    </div>
  );
}

