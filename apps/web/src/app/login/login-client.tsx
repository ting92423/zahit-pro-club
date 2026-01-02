'use client';

import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/provider';

export function MemberLoginClient({ nextPath }: { nextPath: string }) {
  const { dict } = useI18n();
  const t = dict.login;
  const common = dict.common;

  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isExisting, setIsExisting] = useState<boolean | null>(null);

  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showProfileFields = useMemo(() => isExisting === false, [isExisting]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const form = new URLSearchParams({ email });
      const res = await fetch('/api/auth/member/request-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? common.error);
      setIsExisting(!!json?.data?.is_existing_member);
      setDevCode(json?.data?.dev_code ?? null);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : common.error);
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload: Record<string, string> = { email, code };
      if (showProfileFields) {
        payload.name = name;
        payload.phone = phone;
      }
      const form = new URLSearchParams(payload);
      const res = await fetch('/api/auth/member/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error?.message ?? common.error);
      window.location.href = nextPath || '/me';
    } catch (err) {
      setError(err instanceof Error ? err.message : common.error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4 border border-border bg-card p-4 chamfer-lg">
      {step === 'email' ? (
        <form className="space-y-3" onSubmit={requestOtp}>
          <label className="grid gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.email_label}</span>
            <input
              className="h-10 border border-border bg-background px-3 text-sm chamfer-sm focus:border-accent focus:outline-none transition-colors"
              placeholder="name@example.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button
            className="inline-flex h-10 w-full items-center justify-center bg-foreground text-sm font-bold tracking-widest text-background hover:bg-accent hover:text-white transition-all disabled:opacity-60 chamfer-sm uppercase"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? t.transmitting : t.request_code}
          </button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={verifyOtp}>
          <div className="text-xs text-muted-foreground">
            {t.sent_msg}
          </div>
          {devCode ? (
            <div className="border border-border bg-muted px-3 py-2 text-sm chamfer-sm">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.dev_code}</div>
              <div className="mt-1 font-mono text-lg tracking-widest text-accent glitch">{devCode}</div>
            </div>
          ) : null}

          <label className="grid gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.access_code}</span>
            <input
              className="h-10 border border-border bg-background px-3 text-sm font-mono tracking-[0.5em] text-center chamfer-sm focus:border-accent focus:outline-none transition-colors"
              placeholder="000000"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>

          {showProfileFields ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.driver_name}</span>
                <input
                  className="h-10 border border-border bg-background px-3 text-sm chamfer-sm focus:border-accent focus:outline-none"
                  placeholder="FULL NAME"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.mobile}</span>
                <input
                  className="h-10 border border-border bg-background px-3 text-sm chamfer-sm focus:border-accent focus:outline-none"
                  placeholder="09xx-xxx-xxx"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
          ) : null}

          <button
            className="inline-flex h-10 w-full items-center justify-center bg-foreground text-sm font-bold tracking-widest text-background hover:bg-accent hover:text-white transition-all disabled:opacity-60 chamfer-sm uppercase"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? t.verifying : t.verify_btn}
          </button>

          <button
            className="inline-flex h-10 w-full items-center justify-center border border-border bg-background text-xs font-medium hover:bg-muted chamfer-sm uppercase tracking-wide"
            onClick={() => {
              setStep('email');
              setCode('');
              setDevCode(null);
              setError(null);
            }}
            type="button"
          >
            {t.retry}
          </button>
        </form>
      )}

      {error ? <div className="border border-red-900/50 bg-red-900/10 p-3 text-sm text-red-400 chamfer-sm">{common.error}: {error}</div> : null}
    </div>
  );
}
