'use client';

import { useEffect, useState } from 'react';
import { getApiBase } from '@/lib/api-base';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = getApiBase();

export function CheckoutPayClient({
  orderNumber,
  method,
}: {
  orderNumber: string;
  method: 'CREDIT' | 'ATM';
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setError(null);
      setHtml(null);
      try {
        if (!orderNumber) throw new Error('Missing order number');
        const res = await fetch(`${API_BASE}/payments/ecpay/create`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ order_number: orderNumber, method }),
        });
        const json = (await res.json()) as any;
        if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to create payment');
        if (!cancelled) setHtml(json.data.form_html as string);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '建立付款失敗');
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, method]);

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="display text-lg">PAYMENT FAILED</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
      </Card>
    );
  }

  if (!html) {
    return (
      <Card className="mt-6">
        <CardContent className="py-6 text-sm text-muted-foreground">建立付款中…</CardContent>
      </Card>
    );
  }

  return <div className="sr-only" dangerouslySetInnerHTML={{ __html: html }} />;
}

