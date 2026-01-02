'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/provider';

export default function LineCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useI18n();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Missing code from LINE');
      return;
    }

    async function verifyLine() {
      try {
        const res = await fetch('/api/auth/member/line/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const json = await res.json();
        
        if (!res.ok) throw new Error(json?.error?.message || 'Authentication failed');

        if (json.data?.registration_required) {
          // If the user doesn't have a phone number yet, we could redirect to a profile completion page.
          // For now, we'll just show an error or redirect to a specific signup step.
          setError('Member profile incomplete. Please contact support.');
          return;
        }

        if (json.data?.token) {
          // Store token and redirect
          document.cookie = `auth_token=${json.data.token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `auth_role=${json.data.role}; path=/; max-age=604800; SameSite=Lax`;
          router.push('/me');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    }

    verifyLine();
  }, [searchParams, router]);

  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-sm w-full border border-border bg-card p-8 chamfer-lg scanlines text-center">
        {!error ? (
          <div className="space-y-4">
            <div className="h-2 w-24 bg-accent mx-auto animate-pulse" />
            <h1 className="display text-xl tracking-widest uppercase">Authenticating...</h1>
            <p className="text-xs text-muted-foreground telemetry uppercase tracking-tighter">Establishing secure connection to LINE protocol.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-red-500 font-black text-4xl">!</div>
            <h1 className="display text-xl text-red-500">AUTH FAILURE</h1>
            <p className="text-xs text-muted-foreground telemetry uppercase">{error}</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2 bg-foreground text-background text-xs font-bold chamfer-sm uppercase"
            >
              Return to Base
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
