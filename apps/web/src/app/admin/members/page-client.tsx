'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type MemberRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: string;
  pointsBalance: number;
  totalSpent: number;
  createdAt: string;
};

export function AdminMembersClient() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<MemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const url = q.trim() ? `/api/admin/members?q=${encodeURIComponent(q.trim())}` : '/api/admin/members';
      const res = await fetch(url, { cache: 'no-store' });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '載入失敗');
      setItems(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-8 space-y-6">
      <Card className="surface-hover chamfer-lg">
        <CardContent className="p-6">
          <form 
            className="flex flex-wrap items-end gap-4"
            onSubmit={(e) => { e.preventDefault(); load(); }}
          >
            <label className="grid flex-1 gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SEARCH DATABASE</span>
              <Input
                placeholder="NAME / PHONE / EMAIL"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="font-mono h-10"
              />
            </label>
            <Button
              className="h-10 px-8 skew-cta"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'SEARCHING...' : 'EXECUTE SEARCH'}
            </Button>
          </form>

          {error ? (
            <div className="mt-4 border border-red-900/50 bg-red-900/10 p-3 text-xs text-red-400 chamfer-sm telemetry">
              [ ACCESS ERROR ]: {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="surface-hover chamfer-lg scanlines">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Operator Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Communication</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Clearance</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Credits</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Total LTV</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-muted-foreground telemetry animate-pulse" colSpan={6}>
                      FETCHING OPERATOR LIST...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-muted-foreground" colSpan={6}>
                      NO OPERATORS FOUND.
                    </td>
                  </tr>
                ) : (
                  items.map((m) => (
                    <tr key={m.id} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-6 py-4 font-bold italic display text-base">{m.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                          <div>{m.email}</div>
                          <div>{m.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={m.tier !== 'GUEST' ? 'accent' : 'muted'} className="font-mono text-[10px]">
                          {m.tier}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-accent">
                        {m.pointsBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        ${m.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/admin/members/${m.id}`}>
                          <Button size="sm" variant="secondary" className="h-7 px-3 text-[9px] font-bold">
                            VIEW PROFILE
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

