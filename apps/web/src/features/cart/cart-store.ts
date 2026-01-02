import { create } from 'zustand';

export type CartItem = {
  sku_code: string;
  name: string;
  unit_price: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (sku_code: string, qty: number) => void;
  removeItem: (sku_code: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.sku_code === item.sku_code);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.sku_code === item.sku_code ? { ...i, qty: i.qty + qty } : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, qty }] };
    }),
  setQty: (sku_code, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.sku_code !== sku_code)
          : state.items.map((i) => (i.sku_code === sku_code ? { ...i, qty } : i)),
    })),
  removeItem: (sku_code) => set((state) => ({ items: state.items.filter((i) => i.sku_code !== sku_code) })),
  clear: () => set({ items: [] }),
}));

