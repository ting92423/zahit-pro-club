'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ asChild, children, open, setOpen }: any) {
  return (
    <div onClick={() => setOpen(!open)}>
      {children}
    </div>
  );
}

export function DropdownMenuContent({ children, align = 'end', className, open, setOpen }: any) {
  if (!open) return null;
  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[8rem] overflow-hidden border border-border bg-card p-1 shadow-md animate-in fade-in zoom-in-95 chamfer-sm',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, disabled, className, setOpen }: any) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'relative flex w-full cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={(e) => {
        if (onClick) onClick(e);
        setOpen?.(false);
      }}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children, className }: any) {
  return <div className={cn('px-2 py-1.5 text-xs font-semibold', className)}>{children}</div>;
}

export function DropdownMenuSeparator({ className }: any) {
  return <div className={cn('-mx-1 my-1 h-px bg-border/50', className)} />;
}
