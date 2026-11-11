import { create } from 'zustand';

export interface CartItem {
  cartItemId: string; // `${productId}_${productLevelId || 'REGULAR'}`
  productId: string;
  productLevelId?: string | null;
  levelName?: string | null;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string | null;
  note?: string;
}

interface CartStore {
  items: CartItem[];
  taxRate: number; // e.g. 0.1 for 10%
  addItem: (
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl?: string | null;
      productLevelId?: string | null;
      levelName?: string | null;
    },
    note?: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQty: (cartItemId: string, qty: number) => void;
  setItemQty: (
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl?: string | null;
      productLevelId?: string | null;
      levelName?: string | null;
    },
    qty: number
  ) => void;
  updateNote: (cartItemId: string, note: string) => void;
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
    const levelId = product.productLevelId || null;
    const cartItemId = `${product.id}_${levelId || 'REGULAR'}`;
    const existingIndex = currentItems.findIndex((item) => item.cartItemId === cartItemId);

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
            cartItemId,
            productId: product.id,
            productLevelId: levelId,
            levelName: product.levelName || null,
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

  removeItem: (cartItemId) => {
    set({
      items: get().items.filter(
        (item) => item.cartItemId !== cartItemId && item.productId !== cartItemId
      ),
    });
  },

  updateQty: (cartItemId, qty) => {
    if (qty <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.cartItemId === cartItemId || item.productId === cartItemId
          ? { ...item, qty }
          : item
      ),
    });
  },

  setItemQty: (product, qty) => {
    const levelId = product.productLevelId || null;
    const cartItemId = `${product.id}_${levelId || 'REGULAR'}`;
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.cartItemId === cartItemId);

    if (qty <= 0) {
      if (existingIndex > -1) {
        set({ items: currentItems.filter((_, i) => i !== existingIndex) });
      }
    } else if (existingIndex > -1) {
      const updated = [...currentItems];
      updated[existingIndex] = { ...updated[existingIndex], qty };
      set({ items: updated });
    } else {
      set({
        items: [
          ...currentItems,
          {
            cartItemId,
            productId: product.id,
            productLevelId: levelId,
            levelName: product.levelName || null,
            name: product.name,
            price: product.price,
            qty,
            imageUrl: product.imageUrl,
          },
        ],
      });
    }
  },

  updateNote: (cartItemId, note) => {
    set({
      items: get().items.map((item) =>
        item.cartItemId === cartItemId || item.productId === cartItemId
          ? { ...item, note }
          : item
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
