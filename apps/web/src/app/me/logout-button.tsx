'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" disabled={isLoading} onClick={logout}>
      {isLoading ? '登出中…' : '登出'}
    </Button>
  );
}

