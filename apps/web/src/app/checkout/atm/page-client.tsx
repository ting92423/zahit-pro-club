'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { lookupGuestOrder } from '@/lib/api';
import { useI18n } from '@/i18n/provider';

type OrderDto = {
  order_number: string;
  customer_email: string;
  payment: {
    status: string;
    method: string;
    atm?: {
      bank_code: string;
      account: string;
      expire_at: string;
    };
  } | null;
  customer_reported_paid_at: string | null;
};

export function CheckoutAtmClient() {
  const { dict } = useI18n();
  const t = dict.checkout;
  const common = dict.common;

  const sp = useSearchParams();
  const orderNumber = sp.get('order_number');

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderDto | null>(null);

  const [copied, setCopied] = useState('');
  const [reported, setReported] = useState(false);

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await lookupGuestOrder({ order_number: orderNumber, email });
      setResult({
        order_number: res.order_number,
        customer_email: email,
        payment: res.payment ? {
          status: res.payment.status,
          method: res.payment.method || 'N/A',
          atm: res.payment.atm ? {
            bank_code: res.payment.atm.bank_code || '',
            account: res.payment.atm.account_masked || '',
            expire_at: res.payment.atm.expire_at || '',
          } : undefined
        } : null,
        customer_reported_paid_at: res.customer_reported_paid_at || null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : common.error);
    } finally {
      setIsLoading(false);
    }
  }

  function copy(label: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  async function onReport() {
    if (!orderNumber) return;
    const ok = window.confirm(t.report_complete + '?');
    if (!ok) return;

    try {
      await fetch(`/api/admin/orders/${orderNumber}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PAID_VERIFYING' }), // Simulate report
      });
      setReported(true);
      // Refresh data
      if (email) {
        const res = await lookupGuestOrder({ order_number: orderNumber, email });
        setResult({
          order_number: res.order_number,
          customer_email: email,
          payment: res.payment ? {
            status: res.payment.status,
            method: res.payment.method || 'N/A',
            atm: res.payment.atm ? {
              bank_code: res.payment.atm.bank_code || '',
              account: res.payment.atm.account_masked || '',
              expire_at: res.payment.atm.expire_at || '',
            } : undefined
          } : null,
          customer_reported_paid_at: res.customer_reported_paid_at || null
        });
      }
    } catch {
      // ignore
    }
  }

  const canCopy = !!result?.payment?.atm?.account;
  const canReport = !!result && !result.customer_reported_paid_at && result.payment?.status === 'PENDING';

  return (
    <main className="container-app py-10 sm:py-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="display skew-title text-4xl font-semibold tracking-tight">
            <span className="skew-reset">{t.atm_title}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground telemetry">
            {t.atm_subtitle}
          </p>
        </div>
        <Badge variant="muted">{t.step_payment}</Badge>
      </div>

      <Card className="mt-8 surface-hover chamfer-lg scanlines animate-in fade-in zoom-in-95 duration-500 delay-100" style={{ animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle className="display text-lg">{t.order_ref}</CardTitle>
          <CardDescription>{t.decrypt_desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border bg-muted px-4 py-3 font-mono text-lg text-accent tracking-widest chamfer-sm">
            {orderNumber || 'NO_DATA'}
          </div>
          {!orderNumber ? (
            <div className="mt-3 text-xs text-muted-foreground">
              Missing order number? <Link className="underline hover:text-accent" href="/orders/lookup">{t.public_lookup}</Link>
            </div>
          ) : null}

          <form className="mt-6 grid gap-4" onSubmit={onLookup}>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{t.verify_email}</span>
              <Input
                placeholder="you@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="chamfer-sm focus:border-accent"
              />
            </label>
            <Button disabled={isLoading || !orderNumber} type="submit" className="w-full sm:w-auto">
              {isLoading ? t.decrypting : t.reveal}
            </Button>
          </form>

          {error ? (
            <div className="mt-4 border border-red-900/50 bg-red-900/10 p-3 text-sm text-red-400 chamfer-sm">
              {common.access_denied}: {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <Card className="mt-6 surface-hover chamfer-lg border-accent/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="display text-lg">{t.transaction_details}</CardTitle>
            <CardDescription>{t.expire_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <Badge variant="accent">{common.status}</Badge>
              <span className="text-sm font-mono tracking-wider text-foreground uppercase">
                {result.payment?.status ?? 'UNKNOWN'}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-border bg-background p-4 chamfer-sm">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{t.bank_code}</div>
                <div className="mt-1 font-mono text-xl text-foreground">{result.payment?.atm?.bank_code ?? '---'}</div>
              </div>
              <div className="border border-border bg-background p-4 chamfer-sm">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{t.expiration}</div>
                <div className="mt-1 text-sm font-mono text-red-400">
                  {result.payment?.atm?.expire_at
                    ? new Date(result.payment.atm.expire_at).toLocaleString()
                    : '---'}
                </div>
              </div>
              <div className="border border-border bg-background p-4 chamfer-sm sm:col-span-2">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{t.virtual_acc}</div>
                <div className="mt-1 font-mono text-2xl text-accent tracking-widest glitch">{result.payment?.atm?.account ?? '----------------'}</div>
              </div>
            </div>

          {result.payment?.method !== 'ATM' ? (
            <div className="border border-border bg-muted p-4 text-sm text-muted-foreground chamfer-sm">
              Transaction method mismatch. No wire details available.
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!result.payment?.atm?.bank_code}
              onClick={() => copy(t.bank_code, result.payment?.atm?.bank_code ?? '')}
              type="button"
            >
              {common.copy} {t.bank_code}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!canCopy}
              onClick={() => copy(t.virtual_acc, result.payment?.atm?.account ?? '')}
              type="button"
            >
              {common.copy} {t.virtual_acc}
            </Button>
            {copied ? <span className="self-center text-xs text-accent uppercase tracking-widest animate-pulse">{common.copied}: {copied}</span> : null}
          </div>

          <div className="pt-6 border-t border-border">
            <Button disabled={!canReport} onClick={onReport} type="button" className="skew-cta w-full sm:w-auto">
              {t.report_complete}
            </Button>
            {result.customer_reported_paid_at ? (
              <div className="mt-3 text-xs text-muted-foreground font-mono">
                {t.report_timestamp}: {new Date(result.customer_reported_paid_at).toLocaleString()}
              </div>
            ) : null}
            {reported ? (
              <div className="mt-3 text-xs text-accent uppercase tracking-widest">
                {t.report_received}
              </div>
            ) : null}
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            {t.monitor_status} <Link className="underline hover:text-accent" href="/orders/lookup">{t.public_lookup}</Link>
          </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
