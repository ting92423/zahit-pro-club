import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { cookies } from 'next/headers';
import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function POST(req: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 });

  const res = await fetch(`${API_BASE}/events/checkin`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json(
      { error: { message: 'Upstream returned non-JSON response' }, debug: { snippet: text.slice(0, 200) } },
      { status: 502 },
    );
  }
  return NextResponse.json(json, { status: res.status });
}

