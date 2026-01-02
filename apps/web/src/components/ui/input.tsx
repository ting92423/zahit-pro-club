import * as React from 'react';

import { cn } from '@/lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-10 w-full border border-border bg-[color:var(--card)] px-3 text-sm text-foreground ' +
          'placeholder:text-muted-foreground ' +
          'transition-[box-shadow,border-color,background-color] duration-200 ' +
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] ' +
          'chamfer-sm',
        className,
      )}
      {...props}
    />
  );
});

