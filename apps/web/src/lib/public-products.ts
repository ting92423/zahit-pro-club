import { getApiBase } from '@/lib/api-base';
import { headers } from 'next/headers';

const API_BASE = getApiBase();

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  skus: Array<{
    sku_code: string;
    price: number;
    member_price: number | null;
    stock: number;
  }>;
};

export async function getPublicProducts(): Promise<PublicProduct[]> {
  let url = `${API_BASE}/public/products`;

  // On the server, Node fetch requires an absolute URL. If API_BASE is relative (e.g. "/api"),
  // build an absolute origin from request headers.
  if (API_BASE.startsWith('/') && typeof window === 'undefined') {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
    const proto = h.get('x-forwarded-proto') ?? 'http';
    url = `${proto}://${host}${url}`;
  }

  const res = await fetch(url, { cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load products');
  return json.data as PublicProduct[];
}

