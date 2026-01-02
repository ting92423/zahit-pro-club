import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const token = (await cookies()).get('auth_token')?.value;
  const role = (await cookies()).get('auth_role')?.value;
  if (!token || role !== 'MEMBER') {
    return NextResponse.json({ error: { message: 'Please login as member' } }, { status: 401 });
  }

  // 1) 以 server 端 JWT 取得會員資料（避免 client 重填，也避免 client 持有 JWT）
  const meRes = await fetch(`${API_BASE}/me`, {
    cache: 'no-store',
    headers: { authorization: `Bearer ${token}` },
  });
  const meJson = (await meRes.json()) as any;
  if (!meRes.ok) {
    return NextResponse.json({ error: meJson?.error ?? { message: 'Failed to load profile' } }, { status: meRes.status });
  }

  const me = meJson?.data as { id: string; name: string; phone: string; email: string } | null;
  if (!me) {
    return NextResponse.json({ error: { message: 'Member not found' } }, { status: 404 });
  }

  // 2) 一鍵報名（本輪：不扣點/不付費，直接建立 registration）
  const regRes = await fetch(`${API_BASE}/events/${encodeURIComponent(id)}/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      memberId: me.id,
      name: me.name,
      phone: me.phone,
      email: me.email,
    }),
  });
  const regJson = (await regRes.json()) as any;
  return NextResponse.json(regJson, { status: regRes.status });
}

