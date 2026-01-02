import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { cookies } from 'next/headers';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const { id } = await ctx.params;
  const res = await fetch(`${API_BASE}/members/${encodeURIComponent(id)}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = (await res.json()) as any;
  if (!res.ok) return NextResponse.json({ error: json?.error ?? { message: 'Failed' } }, { status: res.status });
  return NextResponse.json({ data: json.data });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();

  const res = await fetch(`${API_BASE}/members/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as any;
  if (!res.ok) return NextResponse.json({ error: json?.error ?? { message: 'Failed' } }, { status: res.status });
  return NextResponse.json({ data: json.data });
}
