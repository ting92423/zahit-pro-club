import * as React from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  'inline-flex items-center justify-center gap-2 border text-sm font-semibold tracking-[0.14em] uppercase ' +
  'bg-[color:var(--card)] text-foreground ' +
  'transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] ' +
  'disabled:pointer-events-none disabled:opacity-45 ' +
  'active:translate-y-[0.5px] ' +
  'chamfer-sm';

const variants: Record<ButtonVariant, string> = {
  primary:
    'relative overflow-hidden border-[color:color-mix(in_oklab,var(--accent)_55%,var(--border))] ' +
    'shadow-[var(--shadow-sm)] ' +
    'hover:bg-[color:var(--accent)] hover:border-[color:var(--accent)] hover:text-white hover:glow-red ' +
    'before:absolute before:inset-0 before:pointer-events-none ' +
    'before:bg-[linear-gradient(90deg,transparent,rgba(240,240,240,0.12),transparent)] ' +
    'before:translate-x-[-120%] before:transition-transform before:duration-300 ' +
    'hover:before:translate-x-[120%] ' +
    'skew-cta',
  secondary:
    'border-border bg-[color:color-mix(in_oklab,var(--card)_94%,black)] text-foreground ' +
    'hover:border-[color:color-mix(in_oklab,var(--accent)_40%,var(--border))] hover:bg-muted',
  ghost:
    'border-transparent bg-transparent text-foreground hover:bg-muted hover:border-border',
  danger:
    'border-transparent bg-[color:var(--accent)] text-white hover:bg-[color:color-mix(in_oklab,var(--accent)_92%,black)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[12px]',
  md: 'h-10 px-4 text-[12px]',
  lg: 'h-11 px-5 text-[13px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="btn__label skew-reset inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
});

