import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { cookies } from 'next/headers';
import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('auth_token')?.value;

  const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
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

