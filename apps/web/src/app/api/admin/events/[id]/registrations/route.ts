import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const { id } = await ctx.params;
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(id)}/registrations`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = (await res.json()) as any;
  if (!res.ok) return NextResponse.json({ error: json?.error ?? { message: 'Failed' } }, { status: res.status });
  return NextResponse.json({ data: json.data });
}

