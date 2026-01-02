import { NextResponse } from 'next/server';

// Local/demo-friendly endpoint.
export async function GET() {
  return NextResponse.json({ data: null }, { status: 404 });
}

