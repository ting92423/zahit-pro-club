'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ItemRow = {
  id: string;
  title: string;
  description?: string;
  pointsCost: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
};

export function AdminRedemptionsClient() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointsCost, setPointsCost] = useState(100);
  const [stock, setStock] = useState(10);
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/redemptions/admin/items', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Load failed');
      setItems(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title || pointsCost <= 0) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/redemptions/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, pointsCost: Number(pointsCost), stock: Number(stock) }),
      });
      if (!res.ok) throw new Error('Create failed');
      setTitle('');
      setDescription('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleStatus(id: string, current: boolean) {
    try {
      await fetch(`/api/redemptions/admin/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      await load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[400px_1fr]">
      <Card className="surface-hover chamfer-lg h-fit">
        <CardHeader>
          <CardTitle className="display text-lg tracking-widest">PROVISION NEW ITEM</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={create}>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ITEM TITLE</span>
              <Input placeholder="FREE ESPRESSO" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CREDIT COST</span>
                <Input type="number" value={pointsCost} onChange={(e) => setPointsCost(Number(e.target.value))} required />
              </div>
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">INITIAL STOCK</span>
                <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
              </div>
            </div>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">DESCRIPTION</span>
              <Textarea placeholder="ITEM DETAILS..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button className="w-full skew-cta mt-2" disabled={isCreating}>
              {isCreating ? 'PROVISIONING...' : 'REGISTER ITEM'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="surface-hover chamfer-lg scanlines">
        <CardHeader>
          <CardTitle className="display text-lg tracking-widest">INVENTORY CATALOG</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Item / Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Cost</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground telemetry animate-pulse">SYNCING INVENTORY...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">NO ITEMS PROVISIONED.</td></tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs">{it.title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{it.description || 'No description.'}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-accent">{it.pointsCost} PTS</td>
                      <td className="px-6 py-4 text-center font-mono">{it.stock}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => toggleStatus(it.id, it.isActive)} className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${it.isActive ? 'text-accent hover:text-red-500' : 'text-zinc-600 hover:text-accent'}`}>
                          {it.isActive ? '[ ACTIVE ]' : '[ VOID ]'}
                        </button>
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
