import { NextResponse } from 'next/server';

export async function POST() {
  const resp = NextResponse.json({ data: { ok: true } });
  resp.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
  resp.cookies.set('auth_role', '', { path: '/', maxAge: 0 });
  return resp;
}

