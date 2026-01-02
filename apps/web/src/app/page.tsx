import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Home() {
  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-40" />
      <SiteHeader />

      <main className="container-app py-14 sm:py-20">
        {/* HERO (single message + single primary action) */}
        <section className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="telemetry uppercase">
              ZÄHLT STANDARD
            </Badge>
            <Badge variant="accent" className="telemetry uppercase">
              German Engineering
            </Badge>
          </div>

          <h1 className="display mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            德國車體防護工程，讓新車感更久。
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            ZÄHLT 以膜料、工法與細節控管，為在意光澤、耐用與價值保存的車主提供可驗證的防護方案。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/services">
              <Button size="lg" className="skew-cta">
                預約諮詢
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="secondary">
                查看方案與產品
              </Button>
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground telemetry">
              閱讀品牌故事 →
            </Link>
          </div>
        </section>

        {/* PROOF STRIP (3 trust points) */}
        <section className="mt-14 grid gap-3 sm:grid-cols-3">
          <Card className="surface-hover">
            <CardHeader>
              <CardTitle className="display text-base">德系工法流程</CardTitle>
              <CardDescription>從檢測、清潔、施工到交付，全流程可追溯。</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/services" className="text-xs text-muted-foreground hover:text-accent telemetry">
                查看流程 →
              </Link>
            </CardContent>
          </Card>
          <Card className="surface-hover">
            <CardHeader>
              <CardTitle className="display text-base">材料等級 / 保固</CardTitle>
              <CardDescription>明確標示膜料等級與保固年限，避免不透明承諾。</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/products" className="text-xs text-muted-foreground hover:text-accent telemetry">
                查看規格 →
              </Link>
            </CardContent>
          </Card>
          <Card className="surface-hover">
            <CardHeader>
              <CardTitle className="display text-base">施工時程</CardTitle>
              <CardDescription>依車況與方案提供預估工期與交付檢查清單。</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/services" className="text-xs text-muted-foreground hover:text-accent telemetry">
                了解時程 →
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* OFFER (two core entrances) */}
        <section className="mt-14 grid gap-3 lg:grid-cols-2">
          <Card className="surface-hover chamfer-lg">
            <CardHeader>
              <CardTitle className="display text-lg">車體防護方案</CardTitle>
              <CardDescription>用最少的選項，給出最清楚的結果。</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground telemetry">服務 / 施工 / 保固</div>
              <Link href="/services">
                <Button size="sm" className="skew-cta">
                  進入 →
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="surface-hover chamfer-lg">
            <CardHeader>
              <CardTitle className="display text-lg">精選軍械庫</CardTitle>
              <CardDescription>膜料、保養、週邊：只上架值得上架的。</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground telemetry">產品 / 規格 / 會員價</div>
              <Link href="/products">
                <Button size="sm" variant="secondary">
                  進入 →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* MANIFESTO (single short paragraph) */}
        <section className="mt-14 max-w-2xl">
          <h2 className="display text-2xl font-semibold tracking-tight">我們的信念</h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            我們不是把車包起來，而是把車的價值保存下來。每一次施工，都以「交付時的標準」為終點，而不是以「完工」為終點。
          </p>
          <div className="mt-5">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground telemetry">
              閱讀品牌故事 →
            </Link>
          </div>
        </section>

        <footer className="mt-14 border-t border-border/70 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Zahit Pro-Club</div>
            <div className="flex flex-wrap gap-4">
              <Link className="hover:text-foreground" href="/about">
                關於我們
              </Link>
              <Link className="hover:text-foreground" href="/services">
                服務方案
              </Link>
              <Link className="hover:text-foreground" href="/products">
                精選軍械庫
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
