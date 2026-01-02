import { getApiBase } from '@/lib/api-base';

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
  const res = await fetch(`${API_BASE}/public/products`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load products');
  return json.data as PublicProduct[];
}

