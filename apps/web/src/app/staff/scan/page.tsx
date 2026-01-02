import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { StaffScanClient } from './scan-client';

export default function StaffScanPage() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-20" />
      <SiteHeader />
      
      <main className="container-app py-8 max-w-lg mx-auto">
        <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Badge variant="accent" className="mb-2">FIELD OPERATOR TERMINAL</Badge>
          <h1 className="display text-4xl font-bold tracking-tighter italic">掃描核銷 // SCAN</h1>
          <p className="text-[10px] text-muted-foreground telemetry uppercase tracking-[0.2em]">
            偵測中... 準備接收 QR 傳輸數據
          </p>
        </div>

        <StaffScanClient />
      </main>
    </div>
  );
}
