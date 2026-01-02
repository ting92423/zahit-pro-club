'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type MemberDetail = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: string;
  pointsBalance: number;
  totalSpent: number;
  pointLedgers: Array<{
    type: string;
    pointsDelta: number;
    reason: string | null;
    createdAt: string;
  }>;
};

export function AdminMemberDetailClient({ memberId }: { memberId: string }) {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const canSave = useMemo(() => Number.isInteger(delta) && delta !== 0, [delta]);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTier, setEditTier] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}`, { cache: 'no-store' });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '載入失敗');
      setMember(json.data);
      setEditName(json.data.name);
      setEditPhone(json.data.phone || '');
      setEditTier(json.data.tier);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [memberId]);

  async function updateBasic(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone, tier: editTier }),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '儲存失敗');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      setIsUpdating(false);
    }
  }

  async function adjustPoints(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/points`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ points_delta: delta, reason }),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '儲存失敗');
      setDelta(0);
      setReason('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">載入中…</div>
    );
  }

  if (!member) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">找不到會員</div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <Card className="surface-hover chamfer-lg">
          <CardHeader>
            <CardTitle className="display text-lg tracking-widest">OPERATOR PROFILE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={updateBasic} className="space-y-4">
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Name</span>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phone</span>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tier</span>
                <select
                  className="h-10 rounded-[calc(var(--radius-sm))] border border-border bg-card px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                >
                  <option value="GUEST">GUEST</option>
                  <option value="PRO">PRO</option>
                  <option value="ELITE">ELITE</option>
                  <option value="Z-MASTER">Z-MASTER</option>
                </select>
              </div>
              <Button type="submit" className="w-full skew-cta h-9 text-[11px]" disabled={isUpdating}>
                {isUpdating ? 'UPDATING...' : 'SAVE BASIC INFO'}
              </Button>
            </form>

            <div className="grid gap-3 pt-4 border-t border-border/50">
              <div className="p-4 border border-border/60 bg-background/40 chamfer-sm">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Clearance Level</div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono">{member.tier}</span>
                  <Badge variant={member.tier !== 'GUEST' ? 'accent' : 'muted'}>ACTIVE</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border border-border/60 bg-background/40 chamfer-sm">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Credits</div>
                  <div className="text-xl font-black font-mono text-accent">{member.pointsBalance.toLocaleString()}</div>
                </div>
                <div className="p-4 border border-border/60 bg-background/40 chamfer-sm">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total LTV</div>
                  <div className="text-xl font-black font-mono">${member.totalSpent.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-hover chamfer-lg">
          <CardHeader>
            <CardTitle className="display text-lg tracking-widest">CREDIT ADJUSTMENT</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={adjustPoints}>
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">DELTA (PTS)</span>
                <Input
                  className="font-mono"
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">REASON / NOTES</span>
                <Input
                  placeholder="EX: Manual Correction"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button
                className="w-full skew-cta mt-2"
                disabled={isSaving || !canSave}
                type="submit"
              >
                {isSaving ? 'EXECUTING...' : 'AUTHORIZE ADJUSTMENT'}
              </Button>
            </form>

            {error ? (
              <div className="mt-4 border border-red-900/50 bg-red-900/10 p-3 text-xs text-red-400 chamfer-sm telemetry">
                [ ACCESS ERROR ]: {error}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </aside>

      <section className="space-y-6">
        <Card className="surface-hover chamfer-lg scanlines">
          <CardHeader>
            <CardTitle className="display text-lg tracking-widest">TRANSACTION LOG (RECENT 20)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Protocol</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Delta</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Reference / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {member.pointLedgers.map((p, idx) => (
                    <tr key={idx} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-6 py-4 telemetry text-[11px] text-zinc-400">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="muted" className="text-[9px] font-mono">{p.type}</Badge>
                      </td>
                      <td className={`px-6 py-4 text-center font-mono font-bold ${p.pointsDelta > 0 ? 'text-accent' : 'text-zinc-500'}`}>
                        {p.pointsDelta > 0 ? `+${p.pointsDelta}` : p.pointsDelta}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        {p.reason ?? 'SYSTEM_AUTO_SYNC'}
                      </td>
                    </tr>
                  ))}
                  {member.pointLedgers.length === 0 && (
                    <tr>
                      <td className="px-6 py-10 text-center text-sm text-muted-foreground telemetry uppercase" colSpan={4}>
                        NO DATA STREAM DETECTED.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

