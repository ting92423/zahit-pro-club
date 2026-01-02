import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Local/demo-friendly endpoint.
// The previous implementation proxied to an upstream API_BASE; for the Cloudflare-only build
// we serve JSON directly here (empty list until D1-backed events are implemented).
export async function GET() {
  return NextResponse.json({ data: [] });
}

