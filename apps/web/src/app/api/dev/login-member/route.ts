import { NextResponse } from 'next/server';

export const runtime = 'edge';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET(req: Request) {
  // 僅限開發：避免把捷徑帶進 production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: { message: 'Not found' } }, { status: 404 });
  }

  const url = new URL(req.url);
  const email = (url.searchParams.get('email') ?? '').trim().toLowerCase();
  const name = (url.searchParams.get('name') ?? 'Dev Member').trim();
  const phone = (url.searchParams.get('phone') ?? '0900000000').trim();
  const next = url.searchParams.get('next') ?? '/';

  if (!email) {
    return NextResponse.json({ error: { message: 'Missing email' } }, { status: 400 });
  }

  // 1) request otp（dev mode 會回 dev_code）
  const reqRes = await fetch(`${API_BASE}/auth/member/request-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const reqJson = (await reqRes.json()) as any;
  if (!reqRes.ok) {
    return NextResponse.json({ error: { message: reqJson?.error?.message ?? reqJson?.message ?? 'Request OTP failed' } }, { status: reqRes.status });
  }

  const code = reqJson?.data?.dev_code as string | undefined;
  if (!code) {
    return NextResponse.json({ error: { message: 'Missing dev_code (is API in dev mode?)' } }, { status: 500 });
  }

  // 2) verify otp（新會員需要 name/phone）
  const verRes = await fetch(`${API_BASE}/auth/member/verify-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, code, name, phone }),
  });
  const verJson = (await verRes.json()) as any;
  if (!verRes.ok) {
    return NextResponse.json({ error: { message: verJson?.error?.message ?? verJson?.message ?? 'Verify OTP failed' } }, { status: verRes.status });
  }

  const token = verJson?.data?.token as string | undefined;
  if (!token) {
    return NextResponse.json({ error: { message: 'Missing token' } }, { status: 500 });
  }

  const resp = NextResponse.redirect(new URL(next, url.origin));
  resp.cookies.set('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  resp.cookies.set('auth_role', 'MEMBER', {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return resp;
}

