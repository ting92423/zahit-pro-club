import { NextResponse } from 'next/server';

export const runtime = 'edge';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function POST(req: Request) {
  const raw = await req.text();
  if (!raw) {
    const ct = req.headers.get('content-type') ?? '(missing)';
    const cl = req.headers.get('content-length') ?? '(missing)';
    return NextResponse.json(
      { error: { message: `Missing request body (content-type=${ct}, content-length=${cl})` } },
      { status: 400 },
    );
  }

  let body: any = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // 容錯：若前端/工具以 urlencoded 送出，也能解析
    try {
      body = Object.fromEntries(new URLSearchParams(raw).entries());
    } catch {
      return NextResponse.json({ error: { message: 'Invalid request body' } }, { status: 400 });
    }
  }

  const res = await fetch(`${API_BASE}/auth/member/request-otp`, {
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
      'Request OTP failed';
    return NextResponse.json({ error: { message: msg } }, { status: res.status });
  }

  return NextResponse.json({ data: json?.data });
}

