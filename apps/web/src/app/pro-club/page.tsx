import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type MilestoneItem = {
  title: string;
  status: '✅ 待驗收' | '✅ 已完成' | '🛑 待串接';
  desc: string;
  href: string;
};

const acceptance: MilestoneItem[] = [
  {
    title: 'Milestone 5：電商主線（訪客 Guest）',
    status: '✅ 待驗收',
    desc: '購物車、結帳、金流（信用卡/ATM）、訂單查詢、後台訂單管理。',
    href: '/products',
  },
  {
    title: 'M3：活動管理（建立/名單/核銷）',
    status: '✅ 待驗收',
    desc: '後台建立活動、報名名單、現場核銷（QR Token）。',
    href: '/admin/events',
  },
  {
    title: 'B1：後台會員管理（含調點/流水）',
    status: '✅ 待驗收',
    desc: '會員列表/詳情、點數流水、手動調點（ADJUST）。',
    href: '/admin/members',
  },
  {
    title: 'B7：分潤報表（sales_code 匯總）',
    status: '✅ 待驗收',
    desc: '依 sales_code 匯總訂單數/金額，支援期間篩選。',
    href: '/admin/sales',
  },
  {
    title: 'LINE Login / 推播',
    status: '🛑 待串接',
    desc: '需等待權限與 OA 設定完成後接入。',
    href: '/login',
  },
  {
    title: '電子發票 / 物流',
    status: '🛑 待串接',
    desc: '待綠界相關申請完成後啟用。',
    href: '/admin/orders',
  },
];

const journeys = [
  { title: '首次接觸 → 加入會員', desc: 'Link Hub → 登入 → 會員卡/基本資料就緒' },
  { title: '消費 → 自動累點 → 等級更新', desc: '訂單/付款事件入帳 → 點數流水 → 等級進度' },
  { title: '活動報名 → 提醒 → 現場核銷', desc: '報名成功 → 名單 → 掃碼核銷 → 可稽核' },
  { title: '業務分潤歸因 → 成交 → 對帳', desc: 'sales 來源追蹤 7 天 → 訂單寫入歸因 → 報表匯總' },
];

export default function ProClubPage() {
  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <header className="surface relative overflow-hidden p-6 sm:p-10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(980px_320px_at_18%_0%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_62%),radial-gradient(860px_320px_at_85%_10%,color-mix(in_oklab,var(--accent-2)_14%,transparent),transparent_64%)]" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">CLUB MANIFESTO</Badge>
                <Badge variant="muted">車聚・會員・活動</Badge>
                <Badge variant="muted">營運可稽核</Badge>
              </div>
              <h1 className="display mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                俱樂部章程 & 驗收入口
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                這頁不是文件搬運，而是「俱樂部視角」：會員要感覺有身份、活動要感覺有儀式、後台要感覺像在管理一個車隊。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/products">
                <Button size="lg">前台驗收</Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="secondary">
                  後台驗收
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-3 lg:grid-cols-2">
          <Card className="surface-hover">
            <CardHeader>
              <CardTitle className="display text-lg">PRINCIPLES</CardTitle>
              <CardDescription>俱樂部的質感，來自每一次互動都「像一個品牌」。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-[var(--radius-sm)] border border-border bg-muted p-3">
                <div className="font-medium text-foreground">身份感</div>
                <div className="mt-1">會員卡/徽章/等級語言一致，讓人一眼就知道「我屬於這裡」。</div>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border bg-muted p-3">
                <div className="font-medium text-foreground">儀式感</div>
                <div className="mt-1">活動報名、成功回饋、核銷結果要清楚且有「完成感」。</div>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border bg-muted p-3">
                <div className="font-medium text-foreground">Mobile First</div>
                <div className="mt-1">現場操作（核銷、查詢、下單）優先把手機體驗做到極致。</div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-hover">
            <CardHeader>
              <CardTitle className="display text-lg">JOURNEYS</CardTitle>
              <CardDescription>用「旅程」驗收：從加入到活動、從下單到對帳。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {journeys.map((j) => (
                <div
                  key={j.title}
                  className="rounded-[var(--radius-sm)] border border-border bg-muted p-3"
                >
                  <div className="text-sm font-medium text-foreground">{j.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{j.desc}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">進度與驗收入口</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                先驗收「可營運主線」：下單 → 查詢 → 後台處理 → 報表對帳。
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground">
                回首頁 →
              </Button>
            </Link>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {acceptance.map((m) => (
              <Link key={m.title} href={m.href} className="block">
                <div className="surface surface-hover p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold tracking-tight">{m.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{m.desc}</div>
                    </div>
                    <Badge variant={m.status.startsWith('✅') ? 'accent' : 'muted'}>{m.status}</Badge>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground underline">前往驗收 →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-border/70 py-8 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>提示：這頁是「可讀版摘要」。正式規格仍以文件為準。</div>
            <div className="flex flex-wrap gap-3">
              <Link className="hover:text-foreground" href="/admin">
                後台入口
              </Link>
              <Link className="hover:text-foreground" href="/products">
                前台驗收
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

