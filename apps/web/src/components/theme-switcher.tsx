'use client';

import { useTheme } from './theme-provider';
import { cn } from '@/lib/cn';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-6 w-12 items-center rounded-none border border-border bg-card transition-all chamfer-sm"
      title={theme === 'night' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
    >
      <div
        className={cn(
          "absolute h-4 w-5 bg-foreground transition-all duration-300",
          theme === 'night' ? "left-0.5" : "left-[calc(100%-1.35rem)]"
        )}
      />
      <span className={cn(
        "absolute left-1 text-[9px] font-bold transition-colors z-10 pointer-events-none",
        theme === 'night' ? "text-background" : "text-muted-foreground"
      )}>
        NITE
      </span>
      <span className={cn(
        "absolute right-1 text-[9px] font-bold transition-colors z-10 pointer-events-none",
        theme === 'day' ? "text-background" : "text-muted-foreground"
      )}>
        DAY
      </span>
    </button>
  );
}
