import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PACKAGES = [
  {
    name: 'ZÄHLT SHIELD',
    price: '依車型報價',
    desc: '日常通勤的高性價比防護：把細節做對，把體驗做乾淨。',
    meta: ['適合：新車/日常通勤', '工期：約 1–2 天', '交付：檢查清單 + 保養建議'],
  },
  {
    name: 'ZÄHLT TRACK',
    price: '依車型報價',
    desc: '面對更高強度的環境與使用：更強的耐用與更穩定的光澤控制。',
    meta: ['適合：常跑高速/戶外停放', '工期：約 2–3 天', '交付：重點區域加強'],
  },
  {
    name: 'ZÄHLT ULTIMATE',
    price: '依車型報價',
    desc: '完整防護與精修交付：以最嚴苛標準達到最少的視覺瑕疵。',
    meta: ['適合：收藏級/極致控', '工期：依車況調整', '交付：更細緻的交車驗收'],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-30" />
      <SiteHeader />
      <main className="container-app py-14 sm:py-20">
        <section className="max-w-3xl">
          <h1 className="display text-4xl font-semibold tracking-tight sm:text-6xl">服務方案</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            我們把選項收斂到三個等級，讓您能快速做決策：看得懂、選得準、交付有標準。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="lg" className="skew-cta">
                預約諮詢
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="secondary">
                先看材料與產品
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-3 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <Card key={p.name} className="surface-hover chamfer-lg">
              <CardHeader>
                <CardTitle className="display text-lg">{p.name}</CardTitle>
                <CardDescription>{p.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border border-border bg-background/40 px-4 py-3 chamfer-sm">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground telemetry">價格</div>
                  <div className="text-sm font-semibold text-foreground">{p.price}</div>
                </div>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {p.meta.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="text-accent">—</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="inline-flex">
                  <Button size="sm" variant="ghost" className="p-0 h-auto text-xs hover:bg-transparent hover:text-accent">
                    取得建議與報價 →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-12 max-w-3xl">
          <Card className="surface-hover chamfer-lg">
            <CardHeader>
              <CardTitle className="display text-lg">交付標準</CardTitle>
              <CardDescription>把「感覺」變成「可驗收」。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div>— 施工前：車況檢測與方案確認</div>
              <div>— 施工中：關鍵節點拍照/記錄（視方案）</div>
              <div>— 交付時：檢查清單、保養說明與注意事項</div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
