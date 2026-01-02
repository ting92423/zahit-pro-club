import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminHomePage() {
  const adminLinks = [
    { title: '訂單管理', desc: '查訂單、填出貨資訊、推進狀態', href: '/admin/orders', badge: 'LOGISTICS' },
    { title: '活動管理', desc: '建立活動、看名單、報到核銷', href: '/admin/events', badge: 'OPERATIONS' },
    { title: '會員管理', desc: '查會員、看點數流水、手動調整', href: '/admin/members', badge: 'CRM' },
    { title: '分潤報表', desc: 'Sales Code 匯總、成交歸因對帳', href: '/admin/sales', badge: 'AFFILIATE' },
    { title: '通知廣播', desc: '發送系統訊息與分眾推播', href: '/admin/notifications', badge: 'COMMS' },
    { title: '廣告管理', desc: '版位刊登、橫幅設定與排程', href: '/admin/ads', badge: 'AD-SPACE' },
    { title: '點數兌換', desc: '兌換品項管理、庫存與核銷', href: '/admin/redemptions', badge: 'VOUCHER' },
  ];

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-70" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber opacity-50" />
      <SiteHeader />
      
      <main className="container-app py-10 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent">COMMAND CENTER</Badge>
              <Badge variant="muted">v1.0</Badge>
            </div>
            <h1 className="display skew-title text-5xl sm:text-6xl font-bold tracking-tighter italic">
              <span className="skew-reset">中控管理平台</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground telemetry uppercase tracking-widest max-w-xl">
              目標：讓營運可以快速完成「建立活動 → 名單 → 報到核銷」、「會員點數處理」、「訂單出貨」、「分潤對帳」。
            </p>
          </div>
          <div className="flex gap-2">
            <div className="h-2 w-2 bg-accent animate-pulse" />
            <span className="text-[10px] font-mono text-accent">SYSTEM STATUS: OPTIMAL</span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" style={{ animationFillMode: 'both' }}>
          {adminLinks.map((link, idx) => (
            <Link key={link.href} className="block group" href={link.href}>
              <Card className="surface-hover chamfer-lg scanlines h-full border-border/50 bg-card/50 backdrop-blur transition-all group-hover:border-accent/50 group-hover:translate-y-[-4px]">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="muted" className="text-[9px] font-mono opacity-60 group-hover:opacity-100 group-hover:text-accent group-hover:border-accent/50 transition-all">
                      {link.badge}
                    </Badge>
                    <span className="text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">ACCESS // GRANT</span>
                  </div>
                  <CardTitle className="display text-2xl group-hover:text-accent transition-colors">{link.title}</CardTitle>
                  <CardDescription className="text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">{link.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-px bg-border/50 w-full mb-4" />
                  <div className="flex items-center text-[10px] font-bold tracking-widest text-muted-foreground group-hover:text-accent transition-colors uppercase">
                    Launch Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

