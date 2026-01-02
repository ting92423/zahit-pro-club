import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { cookies } from 'next/headers';
import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET(req: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const res = await fetch(`${API_BASE}/me/orders${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
    headers: token ? { authorization: `Bearer ${token}` } : {},
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

