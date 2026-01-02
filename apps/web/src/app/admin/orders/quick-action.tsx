'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_OPTIONS = [
  { value: 'UNPAID', label: '待付款' },
  { value: 'PAID', label: '已付款' },
  { value: 'FULFILLING', label: '備貨中' },
  { value: 'SHIPPED', label: '已出貨' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

export function OrderQuickAction({ orderNumber, currentStatus }: { orderNumber: string; currentStatus: string }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateStatus(next: string) {
    if (next === currentStatus) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next, force: true }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message ?? 'Update failed');
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold" disabled={isUpdating}>
          {isUpdating ? '...' : 'QUICK ACTION'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 chamfer-sm">
        <DropdownMenuLabel className="text-[10px] telemetry uppercase">Update Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => updateStatus(opt.value)}
            disabled={opt.value === currentStatus}
            className="text-xs"
          >
            {opt.label} ({opt.value})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
