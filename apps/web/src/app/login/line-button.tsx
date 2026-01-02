'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/provider';

export function LineLoginButton() {
  const { dict } = useI18n();
  const t = dict.login;
  const [isLoading, setIsLoading] = useState(false);

  async function handleLineLogin() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/member/line/login-url');
      const json = (await res.json().catch(() => null)) as any;
      if (res.ok && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        console.error('Failed to get LINE login URL');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className="inline-flex h-10 w-full items-center justify-center border border-[#06C755] bg-[#06C755] text-sm font-bold text-white hover:opacity-90 transition-all chamfer-sm tracking-widest uppercase disabled:opacity-50"
      onClick={handleLineLogin}
      disabled={isLoading}
      type="button"
    >
      <span className="mr-2">LINE</span> {t.line_login}
    </button>
  );
}
