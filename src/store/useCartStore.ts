import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string | null;
  note?: string;
}

interface CartStore {
  items: CartItem[];
  taxRate: number; // e.g. 0.1 for 10%
  addItem: (product: { id: string; name: string; price: number; imageUrl?: string | null }, note?: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateNote: (productId: string, note: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  taxRate: 0, // set tax to 0% default (can be updated)

  addItem: (product, note = '') => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const updated = [...currentItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: updated[existingIndex].qty + 1,
        note: note || updated[existingIndex].note,
      };
      set({ items: updated });
    } else {
      set({
        items: [
          ...currentItems,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            imageUrl: product.imageUrl,
            note,
          },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) });
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      ),
    });
  },

  updateNote: (productId, note) => {
    set({
      items: get().items.map((item) =>
        item.productId === productId ? { ...item, note } : item
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  getTaxAmount: () => {
    return get().getSubtotal() * get().taxRate;
  },

  getTotalAmount: () => {
    return get().getSubtotal() + get().getTaxAmount();
  },
}));
