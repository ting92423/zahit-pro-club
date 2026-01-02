import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDict } from '@/lib/i18n';
import Link from 'next/link';

export default async function AboutPage() {
  const dict = await getDict();
  const t = dict.about;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-20">
        <div className="max-w-4xl mx-auto space-y-20">
          
          {/* Header */}
          <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="accent" className="mb-4">{dict.nav.brand}</Badge>
            <h1 className="display text-5xl sm:text-7xl font-bold tracking-tighter skew-title">
              <span className="skew-reset">{t.title}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto telemetry">
              {t.subtitle}
            </p>
          </section>

          {/* Style */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr] items-start p-8 border border-border bg-card/50 backdrop-blur chamfer-lg scanlines animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             <div className="space-y-2">
               <h2 className="display text-3xl text-accent">{t.style_title}</h2>
               <div className="h-1 w-12 bg-accent" />
               <div className="text-xs font-mono text-muted-foreground tracking-widest mt-2">{t.style_sub}</div>
             </div>
             <div className="space-y-4 text-muted-foreground leading-relaxed">
               <p>
                 <strong className="text-foreground">{t.style_content_1.split('。')[0]}。</strong><br/>
                 {t.style_content_1.split('。')[1]}
               </p>
               <p>
                 {t.style_content_2}
               </p>
               <div className="pl-4 border-l-2 border-accent/30 italic text-sm text-foreground/80">
                 {t.style_quote}
               </div>
             </div>
          </section>

          {/* Skill */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr] items-start p-8 border border-border bg-card/50 backdrop-blur chamfer-lg scanlines animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             <div className="space-y-2">
               <h2 className="display text-3xl text-accent">{t.skill_title}</h2>
               <div className="h-1 w-12 bg-accent" />
               <div className="text-xs font-mono text-muted-foreground tracking-widest mt-2 uppercase">{t.skill_sub}</div>
             </div>
             <div className="space-y-4 text-muted-foreground leading-relaxed">
               <p>
                 <strong className="text-foreground">{t.skill_content_1.split('。')[0]}。</strong><br/>
                 {t.skill_content_1.split('。')[1]}
               </p>
               <p>
                 {t.skill_content_2}
               </p>
               <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="p-3 border border-border/50 bg-background/40 chamfer-sm">
                   <div className="text-[10px] text-accent font-bold tracking-widest mb-1">PPF SPEC //</div>
                   <ul className="text-[10px] font-mono space-y-1">
                     <li>:: 8.5mil THICKNESS</li>
                     <li>:: SELF-HEALING COATING</li>
                   </ul>
                 </div>
                 <div className="p-3 border border-border/50 bg-background/40 chamfer-sm">
                   <div className="text-[10px] text-accent font-bold tracking-widest mb-1">DURABILITY //</div>
                   <ul className="text-[10px] font-mono space-y-1">
                     <li>:: HYDROPHOBIC TOP-COAT</li>
                     <li>:: 10-YEAR WARRANTY</li>
                   </ul>
                 </div>
               </div>
             </div>
          </section>

          {/* Soul */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr] items-start p-8 border border-border bg-card/50 backdrop-blur chamfer-lg scanlines animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
             <div className="space-y-2">
               <h2 className="display text-3xl text-accent">{t.soul_title}</h2>
               <div className="h-1 w-12 bg-accent" />
               <div className="text-xs font-mono text-muted-foreground tracking-widest mt-2">{t.soul_sub}</div>
             </div>
             <div className="space-y-4 text-muted-foreground leading-relaxed">
               <p>
                 <strong className="text-foreground">{t.soul_content_1.split('。')[0]}。</strong><br/>
                 {t.soul_content_1.split('。')[1]}
               </p>
               <p>
                 {t.soul_content_2}
               </p>
               <div className="mt-4">
                 <Link href="/login">
                   <Button size="lg" className="skew-cta">{t.cta}</Button>
                 </Link>
               </div>
             </div>
          </section>

        </div>
      </main>
    </div>
  );
}
