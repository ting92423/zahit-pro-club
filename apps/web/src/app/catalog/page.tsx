import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CATALOGS = [
  { 
    title: '2025 ZÄHLT 品牌主型錄', 
    desc: '包含完整車身防禦方案、TPU 膜料技術規格及物理防禦測試數據。',
    size: '18.5 MB', 
    type: 'PDF / HQ',
    version: 'v25.1'
  },
  { 
    title: '平交道咖啡 × 精選風味單', 
    desc: '本季單品豆清單、焙度分析及沖煮參數建議。',
    size: '4.2 MB', 
    type: 'PDF',
    version: 'v24.Q4'
  },
  { 
    title: 'ZAHIT 物理學實驗室報告', 
    desc: '關於自修復塗層 (Self-healing) 與疏水性 (Hydrophobic) 的長期追蹤報告。',
    size: '12.8 MB', 
    type: 'PDF / TECH',
    version: 'LAB-RE-01'
  },
  { 
    title: '場地部署與聯名方案', 
    desc: 'ZAHIT 空間租借、品牌聯名行動及活動包場規格說明。',
    size: '5.4 MB', 
    type: 'PDF',
    version: 'PRO-PARTNER'
  },
];

export default function CatalogPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber opacity-50" />
      <SiteHeader />
      
      <main className="container-app py-10 sm:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2">
              <Badge variant="accent">INTEL</Badge>
              <Badge variant="muted">ARCHIVE</Badge>
            </div>
            <h1 className="display text-5xl sm:text-6xl font-bold tracking-tighter skew-title">
              <span className="skew-reset">電子型錄 // CATALOG</span>
            </h1>
            <p className="text-sm text-muted-foreground telemetry uppercase tracking-widest">
              存取最新品牌技術文件與部署方案。
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" style={{ animationFillMode: 'both' }}>
            {CATALOGS.map((c) => (
              <Card key={c.title} className="surface-hover chamfer-lg scanlines border-border/50 bg-card/50 backdrop-blur group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="muted" className="text-[9px] font-mono opacity-60">{c.version}</Badge>
                    <span className="text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">ENCRYPTED // OK</span>
                  </div>
                  <CardTitle className="display text-xl group-hover:text-accent transition-colors">{c.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[3rem]">
                    {c.desc}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="text-[10px] font-mono text-zinc-500">
                      {c.type} // {c.size}
                    </div>
                    <Button size="sm" variant="secondary" className="h-8 px-4 text-[10px] font-bold skew-cta">
                      DOWNLOAD
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <section className="p-8 border border-dashed border-border/50 rounded-xl bg-muted/20 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200" style={{ animationFillMode: 'both' }}>
            <div className="text-xs text-muted-foreground telemetry uppercase">
              需要紙本型錄或專業技術支援？
            </div>
            <Button variant="primary" className="skew-cta">
              聯繫技術專員
            </Button>
          </section>

        </div>
      </main>
    </div>
  );
}
