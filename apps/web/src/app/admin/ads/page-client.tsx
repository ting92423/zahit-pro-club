'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdRow = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  minTier: string;
  createdAt: string;
};

export function AdminAdsClient() {
  const [items, setItems] = useState<AdRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [position, setPosition] = useState('HOME_HERO');
  const [minTier, setMinTier] = useState('GUEST');
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ads/admin', { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as any;
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
    if (!title || !imageUrl) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, imageUrl, linkUrl, position, minTier }),
      });
      if (!res.ok) throw new Error('Create failed');
      setTitle('');
      setImageUrl('');
      setLinkUrl('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleStatus(id: string, current: boolean) {
    try {
      await fetch(`/api/ads/${id}`, {
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
          <CardTitle className="display text-lg tracking-widest">DEPLOY NEW ASSET</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={create}>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CAMPAIGN TITLE</span>
              <Input placeholder="WINTER SEASON PPF" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">IMAGE URL</span>
              <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">DESTINATION LINK</span>
              <Input placeholder="/products/..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">POSITION</span>
                <select className="h-10 border border-border bg-background px-3 text-sm focus:border-accent outline-none" value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="HOME_HERO">HOME HERO</option>
                  <option value="HOME_BANNER">HOME BANNER</option>
                  <option value="HUD_SIDEBAR">HUD SIDEBAR</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">MIN TIER</span>
                <select className="h-10 border border-border bg-background px-3 text-sm focus:border-accent outline-none" value={minTier} onChange={(e) => setMinTier(e.target.value)}>
                  <option value="GUEST">GUEST</option>
                  <option value="PRO">PRO</option>
                  <option value="ELITE">ELITE</option>
                  <option value="Z-MASTER">Z-MASTER</option>
                </select>
              </div>
            </div>
            <Button className="w-full skew-cta mt-2" disabled={isCreating}>
              {isCreating ? 'UPLOADING...' : 'PUBLISH ASSET'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="surface-hover chamfer-lg scanlines">
        <CardHeader>
          <CardTitle className="display text-lg tracking-widest">ACTIVE ASSETS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Preview / Title</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Position</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Clearance</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground telemetry animate-pulse">SYNCING ASSETS...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">NO ASSETS DEPLOYED.</td></tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-20 bg-muted border border-border/50 overflow-hidden chamfer-sm shrink-0">
                            <img src={it.imageUrl} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs truncate">{it.title}</div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">{it.linkUrl || 'NO LINK'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px]">{it.position}</td>
                      <td className="px-6 py-4"><Badge variant="muted" className="text-[9px] font-mono">{it.minTier}</Badge></td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleStatus(it.id, it.isActive)} className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${it.isActive ? 'text-accent hover:text-red-500' : 'text-zinc-600 hover:text-accent'}`}>
                          {it.isActive ? '[ DEPLOYED ]' : '[ OFFLINE ]'}
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
