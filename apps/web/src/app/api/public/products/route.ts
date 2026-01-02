import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Local/demo-friendly endpoint.
// In Cloudflare (D1) we will query DB; for local demo we can safely return an empty list.
export async function GET() {
  return NextResponse.json({ data: [] });
}

