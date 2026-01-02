import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { cookies } from 'next/headers';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

async function requireAdminToken() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  return token;
}

export async function GET() {
  const token = await requireAdminToken();
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const res = await fetch(`${API_BASE}/events`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = (await res.json()) as any;
  if (!res.ok) return NextResponse.json({ error: json?.error ?? { message: 'Failed' } }, { status: res.status });
  return NextResponse.json({ data: json.data });
}

export async function POST(req: Request) {
  const token = await requireAdminToken();
  if (!token) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as any;
  if (!res.ok) return NextResponse.json({ error: json?.error ?? { message: 'Failed' } }, { status: res.status });
  return NextResponse.json({ data: json.data });
}

