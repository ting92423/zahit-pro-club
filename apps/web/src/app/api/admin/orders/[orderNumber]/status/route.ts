import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as any;
  return NextResponse.json(json, { status: res.status });
}

