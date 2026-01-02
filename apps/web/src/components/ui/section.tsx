import * as React from 'react';

import { cn } from '@/lib/cn';

export function Section({
  as,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' }) {
  const Comp = (as ?? 'section') as any;
  return <Comp className={cn('container-app py-10 sm:py-14', className)} {...props} />;
}

