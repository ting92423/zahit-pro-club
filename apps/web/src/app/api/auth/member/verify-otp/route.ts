import { NextResponse } from 'next/server';

export const runtime = 'edge';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function POST(req: Request) {
  const raw = await req.text();
  if (!raw) return NextResponse.json({ error: { message: 'Missing request body' } }, { status: 400 });

  let body: any = null;
  try {
    body = JSON.parse(raw);
  } catch {
    try {
      body = Object.fromEntries(new URLSearchParams(raw).entries());
    } catch {
      return NextResponse.json({ error: { message: 'Invalid request body' } }, { status: 400 });
    }
  }

  const res = await fetch(`${API_BASE}/auth/member/verify-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg =
      json?.error?.message ??
      json?.message ??
      (text && text.length < 200 ? text : null) ??
      'Verify OTP failed';
    return NextResponse.json({ error: { message: msg } }, { status: res.status });
  }

  const token = json?.data?.token as string | undefined;
  if (!token) {
    return NextResponse.json({ error: { message: 'Missing token' } }, { status: 500 });
  }

  const resp = NextResponse.json({ data: { ok: true } });
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

