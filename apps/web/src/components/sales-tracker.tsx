'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TrackerContent() {
  const sp = useSearchParams();
  const salesCode = sp.get('sales');

  useEffect(() => {
    if (salesCode) {
      // 存入 cookie，效期 7 天（如 PRD 所述）
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `sales_code=${salesCode}; path=/; expires=${expires.toUTCString()}; samesite=lax`;
    }
  }, [salesCode]);

  return null;
}

export function SalesTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
