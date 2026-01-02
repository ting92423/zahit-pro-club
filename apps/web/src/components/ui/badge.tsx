import * as React from 'react';

import { cn } from '@/lib/cn';

export type BadgeVariant = 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'danger';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const v =
    variant === 'accent'
      ? 'border-[color:color-mix(in_oklab,var(--accent)_46%,var(--border))] bg-[color:color-mix(in_oklab,var(--accent)_20%,transparent)] text-foreground'
      : variant === 'muted'
        ? 'border-border bg-muted text-muted-foreground'
        : variant === 'success'
          ? 'border-[color:color-mix(in_oklab,var(--accent-3)_42%,var(--border))] bg-[color:color-mix(in_oklab,var(--accent-3)_18%,transparent)] text-foreground'
          : variant === 'warning'
            ? 'border-[color:color-mix(in_oklab,var(--accent-2)_46%,var(--border))] bg-[color:color-mix(in_oklab,var(--accent-2)_18%,transparent)] text-foreground'
            : variant === 'danger'
              ? 'border-[color:color-mix(in_oklab,var(--accent)_60%,var(--border))] bg-[color:color-mix(in_oklab,var(--accent)_22%,transparent)] text-foreground'
              : 'border-border bg-card text-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase chamfer-sm telemetry',
        v,
        className,
      )}
      {...props}
    />
  );
}

