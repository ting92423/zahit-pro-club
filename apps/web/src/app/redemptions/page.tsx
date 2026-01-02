import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { MemberRedemptionClient } from './redemption-client';

export default function RedemptionsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <SiteHeader />
      
      <main className="container-app py-10 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2">
              <Badge variant="accent">SUPPLY DROP</Badge>
              <Badge variant="muted">CREDIT EXCHANGE</Badge>
            </div>
            <h1 className="display text-5xl sm:text-6xl font-bold tracking-tighter skew-title">
              <span className="skew-reset">物資兌換 // REDEEM</span>
            </h1>
            <p className="text-sm text-muted-foreground telemetry uppercase tracking-widest">
              使用累積信用點數兌換品牌限量物資與合作夥伴權益。
            </p>
          </div>

          <MemberRedemptionClient />
        </div>
      </main>
    </div>
  );
}
