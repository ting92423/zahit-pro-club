'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AdminLoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/admin/orders';

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? '登入失敗');
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container-app py-10 sm:py-14">
      <div className="mx-auto max-w-md">
        <Card className="surface-hover">
          <CardHeader>
            <CardTitle>後台登入（Admin）</CardTitle>
            <CardDescription>先用管理密碼登入（之後會改成真正帳號/權限系統）。</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">管理密碼</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? '登入中…' : '登入'}
              </Button>

              {error ? (
                <div className="rounded-[var(--radius-sm)] border border-border bg-muted p-3 text-sm text-foreground">
                  {error}
                </div>
              ) : null}

              <div className="text-xs text-muted-foreground">
                登入後會導向：<span className="font-mono">{next}</span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

