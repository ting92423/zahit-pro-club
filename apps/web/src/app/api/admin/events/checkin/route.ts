import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { cookies } from 'next/headers';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function POST(req: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${API_BASE}/events/checkin`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as any;
  if (!res.ok) return NextResponse.json({ error: json?.error ?? { message: 'Failed' } }, { status: res.status });
  return NextResponse.json({ data: json.data });
}

