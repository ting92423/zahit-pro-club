import { NextResponse } from 'next/server';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET() {
  const res = await fetch(`${API_BASE}/events/public`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  return NextResponse.json(json, { status: res.status });
}

