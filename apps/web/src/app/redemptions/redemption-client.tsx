'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type RedemptionItem = {
  id: string;
  title: string;
  description: string | null;
  pointsCost: number;
  stock: number;
  imageUrl: string | null;
};

export function MemberRedemptionClient() {
  const [items, setItems] = useState<RedemptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/redemptions/items', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error('Load failed');
      setItems(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRedeem(itemId: string) {
    if (!confirm('確認使用點數兌換此項物資？')) return;
    setIsRedeeming(itemId);
    setError(null);
    try {
      const res = await fetch('/api/redemptions/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Redemption failed');
      
      alert('兌換成功！請至會員中心查看憑證。');
      window.location.href = '/me';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRedeeming(null);
    }
  }

  if (isLoading) return <div className="text-center py-20 telemetry animate-pulse">SCANNING AVAILABLE SUPPLIES...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((it) => (
        <Card key={it.id} className="surface-hover chamfer-lg scanlines bg-card/50 backdrop-blur border-border/50 group">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="accent" className="font-mono text-[10px] tracking-widest">{it.pointsCost} PTS</Badge>
              <span className="text-[9px] text-muted-foreground telemetry uppercase">Stock: {it.stock}</span>
            </div>
            <CardTitle className="display text-xl group-hover:text-accent transition-colors">{it.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-muted-foreground leading-relaxed min-h-[3rem]">
              {it.description || 'No additional intel provided.'}
            </p>
            <div className="h-px bg-border/50 w-full" />
            <Button 
              className="w-full skew-cta" 
              disabled={isRedeeming === it.id || it.stock <= 0}
              onClick={() => handleRedeem(it.id)}
            >
              {isRedeeming === it.id ? 'PROCESSING...' : 'INITIATE EXCHANGE'}
            </Button>
          </CardContent>
        </Card>
      ))}
      
      {error && (
        <div className="md:col-span-2 p-4 border border-red-900/50 bg-red-900/10 text-red-400 text-xs telemetry uppercase chamfer-sm">
          [ ERROR ]: {error}
        </div>
      )}
    </div>
  );
}
