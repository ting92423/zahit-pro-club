'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function StaffScanClient() {
  const [token, setToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    
    setError(null);
    setResult(null);
    setIsProcessing(true);

    try {
      // 嘗試活動核銷
      let res = await fetch('/api/events/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_token: token }),
      });
      let json = await res.json();
      
      if (!res.ok) {
        // 如果活動核銷失敗，嘗試兌換券核銷
        res = await fetch('/api/redemptions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr_token: token }),
        });
        json = await res.json();
        
        if (!res.ok) throw new Error(json?.error?.message || 'Verification failed');
        
        setResult({
          type: 'VOUCHER',
          name: json.data.member.name,
          email: json.data.member.email,
          item: json.data.item.title,
        });
      } else {
        setResult({
          type: 'EVENT',
          name: json.data.registration.name,
          email: json.data.registration.email,
        });
      }
      setToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="surface-hover chamfer-lg scanlines bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-accent/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Input
                className="relative h-16 text-center font-mono text-xl tracking-[0.3em] bg-black border-zinc-800 focus:border-accent uppercase"
                placeholder="QR_TOKEN"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoFocus
                disabled={isProcessing}
              />
            </div>
            <Button 
              size="lg" 
              className="w-full h-14 display text-lg font-black italic skew-cta"
              disabled={isProcessing || !token}
            >
              {isProcessing ? 'VERIFYING...' : 'AUTHORIZE ENTRY'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="p-6 border border-red-900/50 bg-red-900/10 chamfer-sm animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <span className="font-black text-xl">!</span>
            <span className="display font-bold tracking-widest uppercase">Access Denied</span>
          </div>
          <p className="text-xs text-red-400 telemetry uppercase">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-6 border border-accent/50 bg-accent/5 chamfer-sm animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 text-accent mb-4">
            <div className="h-2 w-2 bg-accent rounded-full animate-ping" />
            <span className="display font-bold tracking-widest uppercase">Verified // OK</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Operator Profile</div>
              <div className="display text-2xl font-black italic">{result.name}</div>
              <div className="text-xs text-muted-foreground telemetry uppercase">Email: {result.email}</div>
            </div>

            {result.type === 'VOUCHER' && (
              <div className="p-3 border border-accent/30 bg-accent/5 rounded">
                <div className="text-[10px] text-accent font-bold tracking-widest uppercase mb-1">Redeeming Item</div>
                <div className="text-sm font-bold">{result.item}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-accent/20">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Verification</div>
                <Badge variant="success">{result.type} OK</Badge>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Timestamp</div>
                <div className="text-[10px] font-mono">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="w-full mt-6 h-10 text-[10px] font-bold tracking-widest uppercase"
            onClick={() => setResult(null)}
          >
            Clear Terminal
          </Button>
        </div>
      )}

      <div className="text-center pt-8">
        <p className="text-[9px] text-muted-foreground telemetry uppercase opacity-50">
          ZAHIT PROTOCOL // SECURE CHANNEL 02-B
        </p>
      </div>
    </div>
  );
}
