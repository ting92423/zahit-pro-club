'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useI18n } from '@/i18n/provider';
import { LangSwitcher } from './lang-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const { dict, lang } = useI18n();
  const t = dict.nav;
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = document.cookie.split('; ').find(row => row.startsWith('auth_role='))?.split('=')[1];
    setRole(r || null);
  }, [pathname]);

  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur">
      <div className="container-app">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link className="group flex items-center gap-2" href="/">
            <span className="relative inline-flex h-7 w-7 items-center justify-center">
              <span className="absolute inset-0 chamfer-sm bg-[color:color-mix(in_oklab,var(--accent)_22%,transparent)] blur-[14px]" />
              <span className="relative grid h-7 w-7 place-items-center border border-border bg-card shadow-sm chamfer-sm">
                <span className="h-2.5 w-2.5 bg-[color:var(--accent)] shadow-sm" />
              </span>
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-[0.16em] text-foreground telemetry uppercase">
                ZAHIT PRO-CLUB
              </span>
              <span className="block text-[11px] text-muted-foreground">WIR BEWAHREN, WAS ZÄHLT.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <NavLink href="/about">{t.brand}</NavLink>
            <NavLink href="/products">{t.shop}</NavLink>
            <NavLink href="/events">{t.events}</NavLink>
            <NavLink href="/catalog">{t.catalog}</NavLink>
            <NavLink href="/me">{t.hud}</NavLink>
            
            {(isAdmin || isStaff) && (
              <>
                <span className="mx-1 h-5 w-px bg-border/70" />
                <NavLink href="/admin">{t.admin}</NavLink>
                {isStaff && <NavLink href="/staff/scan">現場核銷</NavLink>}
              </>
            )}

            <div className="ml-2 pl-2 border-l border-border/50 flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => (window as any).toggleCommandMenu?.()}
                  className="flex h-6 w-8 items-center justify-center rounded-none border border-border bg-card hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-all chamfer-sm group"
                  title="Command Menu (Ctrl+K)"
                >
                  <span className="font-mono text-[10px] group-hover:animate-pulse">&gt;_</span>
                </button>
              )}
              <ThemeSwitcher />
              <LangSwitcher current={lang} />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground chamfer-sm telemetry"
      href={href}
    >
      {children}
    </Link>
  );
}

