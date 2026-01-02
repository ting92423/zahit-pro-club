import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { cookies } from 'next/headers';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET(req: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  const apiUrl = new URL(`${API_BASE}/members`);
  if (q) apiUrl.searchParams.set('q', q);

  const res = await fetch(apiUrl.toString(), { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) return NextResponse.json({ error: json?.error ?? { message: 'Failed' } }, { status: res.status });
  return NextResponse.json({ data: json.data });
}

