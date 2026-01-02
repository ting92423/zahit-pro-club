import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET() {
  const token = (await cookies()).get('auth_token')?.value;
  const res = await fetch(`${API_BASE}/ads/admin`, {
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

