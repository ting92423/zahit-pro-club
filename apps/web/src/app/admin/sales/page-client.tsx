'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Row = { sales_code: string; orders_count: number; total_amount: number };

function toDateOnly(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function AdminSalesClient() {
  const [from, setFrom] = useState<string>(() => '');
  const [to, setTo] = useState<string>(() => '');
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalOrders = useMemo(() => rows.reduce((s, r) => s + r.orders_count, 0), [rows]);
  const totalAmount = useMemo(() => rows.reduce((s, r) => s + r.total_amount, 0), [rows]);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (from) qs.set('from', new Date(`${from}T00:00:00`).toISOString());
      if (to) qs.set('to', new Date(`${to}T23:59:59`).toISOString());
      const url = `/api/admin/sales/report${qs.toString() ? `?${qs.toString()}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '載入失敗');
      setRows(json.data as Row[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // 預設：近 30 天
    const d = new Date();
    const toD = toDateOnly(d);
    d.setDate(d.getDate() - 30);
    const fromD = toDateOnly(d);
    setFrom(fromD);
    setTo(toD);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (from || to) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  return (
    <div className="mt-8 space-y-6">
      <Card className="surface-hover chamfer-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">START DATE</span>
              <input
                className="h-10 rounded-none border border-border bg-background px-3 text-sm font-mono focus:border-accent outline-none transition-colors"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">END DATE</span>
              <input
                className="h-10 rounded-none border border-border bg-background px-3 text-sm font-mono focus:border-accent outline-none transition-colors"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            <Button
              className="ml-auto h-10 px-6 skew-cta"
              disabled={isLoading}
              onClick={load}
            >
              {isLoading ? 'SYNCING...' : 'REFRESH TELEMETRY'}
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="border border-border/60 bg-background/40 p-5 chamfer-sm relative overflow-hidden">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Attributed Orders</div>
              <div className="mt-2 text-4xl font-black tabular-nums font-mono">{totalOrders}</div>
              <div className="absolute top-0 right-0 p-2 opacity-5 font-mono text-4xl font-black">QTY</div>
            </div>
            <div className="border border-border/60 bg-background/40 p-5 chamfer-sm relative overflow-hidden">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Revenue (USD)</div>
              <div className="mt-2 text-4xl font-black tabular-nums font-mono text-accent">${totalAmount.toLocaleString()}</div>
              <div className="absolute top-0 right-0 p-2 opacity-5 font-mono text-4xl font-black">VAL</div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 border border-red-900/50 bg-red-900/10 p-4 text-sm text-red-400 chamfer-sm telemetry">
              [ ERROR ]: {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="surface-hover chamfer-lg scanlines">
        <CardHeader>
          <CardTitle className="display text-lg tracking-widest">AGGREGATED DATA BY CODE</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground telemetry animate-pulse">
              LOADING ENCRYPTED DATA...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground border-t border-border">
              NO RECORDS FOUND IN SPECIFIED RANGE.
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Operator / Sales Code</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Order Count</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Total Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.sales_code} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold group-hover:text-accent transition-colors">{r.sales_code}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="muted" className="font-mono tabular-nums">{r.orders_count}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-bold">${r.total_amount.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

