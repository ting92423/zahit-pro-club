import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { MemberLoginClient } from './login-client';
import { LineLoginButton } from './line-button';
import { getDict } from '@/lib/i18n';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = sp.next ?? '/me';
  const dict = await getDict();
  const t = dict.login;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md px-4 py-10">
        <h1 className="display skew-title text-3xl font-semibold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="skew-reset">{t.title}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground telemetry animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {t.subtitle}
        </p>

        <div className="mt-8 border border-border bg-card p-6 chamfer-lg shadow-md scanlines relative animate-in fade-in zoom-in-95 duration-500 delay-200" style={{ animationFillMode: 'both' }}>
          <div className="absolute top-0 right-0 p-2 opacity-50">
            <div className="h-1 w-1 bg-accent rounded-full animate-ping" />
          </div>

          <LineLoginButton />

          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.or_email}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <MemberLoginClient nextPath={nextPath} />

          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            {t.guest_access} <Link className="text-foreground hover:underline transition-colors hover:text-accent" href="/orders/lookup">{t.guest_lookup}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
