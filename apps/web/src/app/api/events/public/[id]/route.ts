import { NextResponse } from 'next/server';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = await fetch(`${API_BASE}/events/public/${encodeURIComponent(id)}`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  return NextResponse.json(json, { status: res.status });
}

