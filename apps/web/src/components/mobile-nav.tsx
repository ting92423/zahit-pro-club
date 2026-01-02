'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/cn';
import { LangSwitcher } from './lang-switcher';
import { ThemeSwitcher } from './theme-switcher';

export function MobileNav() {
  const pathname = usePathname();
  const { dict, lang } = useI18n();
  const t = dict.nav;
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = document.cookie.split('; ').find(row => row.startsWith('auth_role='))?.split('=')[1];
    setRole(r || null);
  }, [pathname]);

  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navs = [
    { href: '/', label: '總部', icon: 'HQ' },
    { href: '/events', label: t.events, icon: 'OPS' },
    { href: '/products', label: t.shop, icon: 'GEAR' },
    { href: '/me', label: t.hud, icon: 'HUD' },
  ];

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-16 md:hidden" />

      {/* Control Deck */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background/90 backdrop-blur md:hidden">
        <div className="grid h-16 grid-cols-4 items-center gap-1 px-2">
          {navs.map((n) => {
            const isActive = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "group relative flex h-12 flex-col items-center justify-center overflow-hidden transition-all chamfer-sm",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 h-0.5 w-4 bg-accent shadow-[0_0_8px_var(--accent)]" />
                )}
                <span className="font-mono text-[10px] font-bold tracking-widest">{n.icon}</span>
                <span className="text-[9px] opacity-70 scale-90">{n.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "group relative flex h-12 flex-col items-center justify-center overflow-hidden transition-all chamfer-sm",
              isOpen
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="font-mono text-[10px] font-bold tracking-widest">{t.sys}</span>
            <span className="text-[9px] opacity-70 scale-90">{t.menu}</span>
          </button>
        </div>
      </nav>

      {/* SYS Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background/95 backdrop-blur animate-in fade-in slide-in-from-bottom-10 duration-200 md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold tracking-widest telemetry">SYSTEM MENU</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              [CLOSE]
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="grid gap-4">
              <button
                onClick={() => {
                  (window as any).toggleCommandMenu?.();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between border border-accent/50 bg-accent/5 p-4 text-accent hover:bg-accent/10 chamfer-sm transition-colors group"
              >
                <span className="text-sm font-bold tracking-widest uppercase">LAUNCH TERMINAL</span>
                <span className="font-mono text-xs group-hover:animate-pulse">&gt;_</span>
              </button>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">LANGUAGE PROTOCOL</span>
                <LangSwitcher current={lang} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">VISUAL MODE</span>
                <ThemeSwitcher />
              </div>

              <div className="h-px bg-border/50 my-2" />

              <div className="grid gap-2">
                <MenuLink href="/about" label={t.brand} />
                <MenuLink href="/products" label={t.shop} />
                <MenuLink href="/events" label={t.events} />
                <MenuLink href="/catalog" label={t.catalog} />
                <MenuLink href="/orders/lookup" label={t.lookup} />
                
                {(isAdmin || isStaff) && (
                  <>
                    <div className="h-px bg-border/50 my-2" />
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest px-1 mb-1">Internal Operations</div>
                    <MenuLink href="/admin" label={t.admin} />
                    {isStaff && <MenuLink href="/staff/scan" label="現場核銷終端" />}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border border-border bg-card p-4 transition-all hover:border-accent hover:bg-accent/5 hover:text-accent chamfer-sm group"
    >
      <span className="text-sm font-medium tracking-wide">{label}</span>
      <span className="text-xs text-muted-foreground group-hover:text-accent">→</span>
    </Link>
  );
}
