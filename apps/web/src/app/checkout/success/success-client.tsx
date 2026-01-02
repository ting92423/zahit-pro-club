'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CheckoutSuccessClient({ orderNumber }: { orderNumber: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore; user can still select manually
    }
  }

  return (
    <Card className="mt-6 surface-hover">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="display text-lg">YOUR PLATE NO.</CardTitle>
            <CardDescription>像車號一樣重要：複製保存，之後用它查詢訂單。</CardDescription>
          </div>
          <Badge variant={orderNumber ? 'success' : 'warning'}>
            {orderNumber ? 'LOCKED' : 'MISSING'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-[var(--radius-sm)] border border-border bg-background/20 p-3">
          <div className="pointer-events-none absolute inset-0 track-stripe opacity-40" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-sm">{orderNumber ?? '(missing)'}</div>
            {orderNumber ? (
              <Button size="sm" variant="secondary" onClick={copy} type="button">
                {copied ? '已複製' : '複製'}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/orders/lookup">
            <Button>前往查訂單</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">加入/登入會員</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

