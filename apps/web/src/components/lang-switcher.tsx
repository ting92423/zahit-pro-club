'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { switchLanguage } from '@/app/actions';
import { cn } from '@/lib/cn';

export function LangSwitcher({ current }: { current: 'en' | 'zh' }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = current === 'en' ? 'zh' : 'en';
    startTransition(async () => {
      await switchLanguage(next);
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "relative flex h-6 w-12 items-center rounded-none border border-border bg-card transition-all chamfer-sm",
        isPending && "opacity-50 cursor-wait"
      )}
    >
      <div
        className={cn(
          "absolute h-4 w-5 bg-accent transition-all duration-300",
          current === 'en' ? "left-0.5" : "left-[calc(100%-1.35rem)]"
        )}
      />
      <span className={cn(
        "absolute left-1 text-[9px] font-bold transition-colors z-10",
        current === 'en' ? "text-white" : "text-muted-foreground"
      )}>
        EN
      </span>
      <span className={cn(
        "absolute right-1 text-[9px] font-bold transition-colors z-10",
        current === 'zh' ? "text-white" : "text-muted-foreground"
      )}>
        ZH
      </span>
    </button>
  );
}
