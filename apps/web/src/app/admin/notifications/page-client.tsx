'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type NotificationRow = {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  member?: { name: string; email: string };
};

export function AdminNotificationsClient() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memberId, setMemberId] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [isSending, setIsSending] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications/admin', { cache: 'no-store' });
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

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, memberId: memberId || undefined, type }),
      });
      if (!res.ok) throw new Error('Send failed');
      setTitle('');
      setContent('');
      setMemberId('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[400px_1fr]">
      <Card className="surface-hover chamfer-lg h-fit">
        <CardHeader>
          <CardTitle className="display text-lg tracking-widest">COMMS DEPLOYMENT</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={send}>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">TITLE / SUBJECT</span>
              <Input
                placeholder="MISSION UPDATE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">TARGET MEMBER ID (OPTIONAL)</span>
              <Input
                placeholder="LEAVE EMPTY FOR ALL"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">PROTOCOL / TYPE</span>
              <select
                className="h-10 rounded-none border border-border bg-background px-3 text-sm focus:border-accent outline-none"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="SYSTEM">SYSTEM BROADCAST</option>
                <option value="PROMO">PROMOTIONAL INTEL</option>
                <option value="ALERT">SECURITY ALERT</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CONTENT / BODY</span>
              <Textarea
                placeholder="ENTER MESSAGE PROTOCOL..."
                className="min-h-[120px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <Button className="w-full skew-cta mt-2" disabled={isSending}>
              {isSending ? 'TRANSMITTING...' : 'EXECUTE BROADCAST'}
            </Button>
          </form>
          {error && (
            <div className="mt-4 border border-red-900/50 bg-red-900/10 p-3 text-[10px] text-red-400 telemetry uppercase">
              [ ERROR ]: {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="surface-hover chamfer-lg scanlines">
        <CardHeader>
          <CardTitle className="display text-lg tracking-widest">TRANSMISSION LOG</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Target</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Subject</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-muted-foreground telemetry animate-pulse" colSpan={4}>
                      SYNCING WITH COMMS SERVER...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-muted-foreground" colSpan={4}>
                      NO PREVIOUS TRANSMISSIONS.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-6 py-4 telemetry text-[11px] text-zinc-400">
                        {new Date(it.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {it.member ? (
                          <div className="text-[11px] font-mono">
                            <div className="font-bold">{it.member.name}</div>
                            <div className="opacity-60">{it.member.email}</div>
                          </div>
                        ) : (
                          <Badge variant="accent" className="text-[9px]">BROADCAST</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs">{it.title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{it.content}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="muted" className="text-[9px] font-mono">{it.type}</Badge>
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
