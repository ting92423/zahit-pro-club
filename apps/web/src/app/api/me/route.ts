import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = (await cookies()).get('auth_token')?.value;
  const authorization = authHeader ?? (token ? `Bearer ${token}` : null);

  const res = await fetch(`${API_BASE}/me`, {
    cache: 'no-store',
    headers: authorization ? { authorization } : {},
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json(
      {
        error: {
          message: 'Upstream returned non-JSON response',
          status: res.status,
        },
        debug: {
          content_type: res.headers.get('content-type'),
          snippet: text.slice(0, 200),
        },
      },
      { status: 502 },
    );
  }

  return NextResponse.json(json, { status: res.status });
}

export async function PATCH(req: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 });

  const res = await fetch(`${API_BASE}/me`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json(
      {
        error: {
          message: 'Upstream returned non-JSON response',
          status: res.status,
        },
        debug: {
          content_type: res.headers.get('content-type'),
          snippet: text.slice(0, 200),
        },
      },
      { status: 502 },
    );
  }

  return NextResponse.json(json, { status: res.status });
}

