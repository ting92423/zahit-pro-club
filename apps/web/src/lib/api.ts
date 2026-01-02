import { getApiBase } from '@/lib/api-base';

const API_BASE = getApiBase();

async function readJsonOrThrow(res: Response) {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    const ct = res.headers.get('content-type');
    throw new Error(`Upstream returned non-JSON response (status=${res.status}, content-type=${ct ?? 'unknown'})`);
  }
  return json;
}

export type CreateOrderRequest = {
  items: Array<{ sku_code: string; qty: number }>;
  shipping: { name: string; phone: string; email: string; address: string };
  sales_code?: string;
  points_to_redeem?: number;
};

export async function createGuestOrder(body: CreateOrderRequest) {
  const cookieStr = typeof document !== 'undefined' ? document.cookie : '';
  const token = cookieStr
    .split('; ')
    .find((row) => row.startsWith('auth_token='))
    ?.split('=')[1];

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await readJsonOrThrow(res);
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to create order');
  return json.data as {
    order_number: string;
    status: string;
    total_amount: number;
  };
}

export async function lookupGuestOrder(body: { order_number: string; email: string }) {
  const res = await fetch(`${API_BASE}/orders/lookup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await readJsonOrThrow(res);
  if (!res.ok) throw new Error(json?.error?.message ?? 'Order not found');
  return json.data as {
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    customer_reported_paid_at?: string | null;
    payment?: {
      provider: string;
      method: string | null;
      status: string;
      atm?: { bank_code: string | null; account_masked: string | null; expire_at: string | null } | null;
    } | null;
    items: Array<{ name: string; qty: number; unit_price: number; total_price: number }>;
  };
}

