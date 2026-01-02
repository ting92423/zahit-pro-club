import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET() {
  const res = await fetch(`${API_BASE}/redemptions/items`, { cache: 'no-store' });
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

