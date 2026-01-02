import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Local/demo-friendly endpoint.
export async function GET() {
  return NextResponse.json({ data: null }, { status: 404 });
}

