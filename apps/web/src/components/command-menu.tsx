'use client';

import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import { switchLanguage } from '@/app/actions';
import { cn } from '@/lib/cn';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { dict, lang } = useI18n();
  const t = dict.nav;
  const common = dict.common;

  // Toggle with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Expose toggle function to window for other components to trigger
  useEffect(() => {
    (window as any).toggleCommandMenu = () => setOpen((open) => !open);
    return () => {
      delete (window as any).toggleCommandMenu;
    };
  }, []);

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      
      <div className="relative w-full max-w-lg overflow-hidden border border-accent/30 bg-background shadow-2xl chamfer-lg scanlines animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
          <span className="mr-2 h-4 w-4 shrink-0 text-accent font-bold animate-pulse">&gt;</span>
          <Command.Input
            className="flex h-12 w-full rounded-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-mono tracking-wider text-foreground"
            placeholder="TYPE A COMMAND..."
          />
          <div className="hidden text-[10px] text-muted-foreground md:inline-block border border-border px-1.5 py-0.5 chamfer-sm">
            ESC
          </div>
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scrollbar-hide">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground font-mono">
            NO MATCHING PROTOCOLS.
          </Command.Empty>

          <Command.Group heading="NAVIGATION" className="text-[10px] text-muted-foreground font-bold tracking-widest px-2 py-1.5 mb-1 select-none">
            <Item onSelect={() => run(() => router.push('/'))} shortcut="H">
              {t.hq}
            </Item>
            <Item onSelect={() => run(() => router.push('/events'))} shortcut="E">
              {t.ops}
            </Item>
            <Item onSelect={() => run(() => router.push('/me'))} shortcut="M">
              {t.hud}
            </Item>
            <Item onSelect={() => run(() => router.push('/products'))} shortcut="S">
              {t.shop}
            </Item>
             <Item onSelect={() => run(() => router.push('/admin'))} shortcut="A">
              {t.admin}
            </Item>
          </Command.Group>

          <Command.Separator className="my-1 h-px bg-border/50" />

          <Command.Group heading="SYSTEM" className="text-[10px] text-muted-foreground font-bold tracking-widest px-2 py-1.5 mb-1 select-none">
            <Item
              onSelect={() => run(async () => {
                await switchLanguage(lang === 'en' ? 'zh' : 'en');
                router.refresh();
              })}
            >
              SWITCH LANGUAGE: {lang === 'en' ? '中文' : 'ENGLISH'}
            </Item>
            <Item
               onSelect={() => run(() => {
                 navigator.clipboard.writeText(window.location.href);
               })}
            >
              COPY CURRENT URL
            </Item>
          </Command.Group>
        </Command.List>

        <div className="border-t border-border bg-muted/50 px-3 py-1.5">
          <div className="text-[10px] text-muted-foreground flex justify-between font-mono">
             <span>ZAHIT_CMD_V1.0</span>
             <span>CONNECTED</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}

function Item({
  children,
  shortcut,
  onSelect,
}: {
  children: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-default select-none items-center px-2 py-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[selected]:bg-accent/10 data-[selected]:text-accent transition-colors group chamfer-sm"
      )}
    >
      <div className="mr-2 flex h-4 w-4 items-center justify-center opacity-0 group-data-[selected]:opacity-100 transition-opacity">
        <div className="h-1.5 w-1.5 bg-accent shadow-[0_0_5px_var(--accent)]" />
      </div>
      <span className="flex-1 font-medium tracking-wide">{children}</span>
      {shortcut && (
        <span className="ml-auto text-[10px] text-muted-foreground font-mono border border-border px-1">
          {shortcut}
        </span>
      )}
    </Command.Item>
  );
}
