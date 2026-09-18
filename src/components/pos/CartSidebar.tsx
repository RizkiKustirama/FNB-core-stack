'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, Edit3, X, Utensils } from 'lucide-react';

interface CartSidebarProps {
  onOpenCheckout: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export function CartSidebar({ onOpenCheckout, isMobileDrawer, onCloseMobile }: CartSidebarProps) {
  const { items, removeItem, updateQty, updateNote, clearCart, getSubtotal, getTotalAmount } =
    useCartStore();

  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * 0.1); // PB1 Tax 10%
  const total = getTotalAmount();

  return (
    <div className="w-full lg:w-[400px] bg-[#fff8ef] border-l border-[#e2beba]/30 flex flex-col h-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] shrink-0 overflow-hidden">
      {/* Header Cart */}
      <div className="p-5 border-b border-[#e2beba]/30 flex items-center justify-between bg-[#fff8ef] shrink-0">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-[#1e1b13]">Keranjang Pesanan</h2>
          <span className="bg-[#b22222]/10 text-[#b22222] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {items.reduce((sum, item) => sum + item.qty, 0)} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-[#b22222] hover:underline flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>KOSONGKAN</span>
            </button>
          )}

          {isMobileDrawer && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#5a403e] hover:bg-[#efe7d9] rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#5a403e] py-12 text-center">
            <ShoppingBag className="w-14 h-14 text-[#e2beba] mb-3 stroke-1" />
            <p className="text-sm font-bold text-[#1e1b13]">Keranjang Masih Kosong</p>
            <p className="text-xs text-[#5a403e] max-w-[220px] mt-1">
              Pilih menu dari katalog di sebelah kiri untuk menambahkan ke pesanan.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="p-4 bg-[#f5edde] rounded-2xl border border-[#e2beba]/30 space-y-2.5 shadow-sm hover:border-[#e2beba] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#1e1b13] leading-tight">
                    {item.name}
                  </h4>
                  <div className="text-xs font-bold text-[#b22222] mt-1">
                    {formatCurrency(item.price)}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-[#5a403e] hover:text-[#b22222] transition p-1"
                  title="Hapus item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Note input */}
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#5a403e] shrink-0" />
                <input
                  type="text"
                  value={item.note || ''}
                  onChange={(e) => updateNote(item.productId, e.target.value)}
                  placeholder="Catatan pesanan (misal: Tanpa daun bawang)..."
                  className="w-full text-xs bg-[#fff8ef] border border-[#e2beba]/40 rounded-xl px-2.5 py-1 text-[#1e1b13] placeholder-[#5a403e]/50 focus:outline-none focus:ring-1 focus:ring-[#b22222]"
                />
              </div>

              {/* Qty Pill Counter & Item Total */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e2beba]/30">
                <div className="flex items-center gap-2 bg-[#fff8ef] border border-[#e2beba]/40 rounded-full p-1 shadow-sm">
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#1e1b13] hover:bg-[#efe7d9] transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-[#1e1b13] px-2 min-w-[20px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#1e1b13] hover:bg-[#efe7d9] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-sm font-bold text-[#1e1b13]">
                  {formatCurrency(item.price * item.qty)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Calculation & Order Button */}
      {items.length > 0 && (
        <div className="p-5 bg-[#fff8ef] border-t border-[#e2beba]/30 space-y-4 shrink-0 shadow-lg">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#5a403e]">
              <span>Subtotal</span>
              <span className="font-bold text-[#1e1b13]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5a403e]">
              <span>PB1 Tax (10%)</span>
              <span className="font-bold text-[#1e1b13]">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-3 border-t border-[#e2beba]/30 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-[#5a403e] uppercase tracking-wider">
                  TOTAL BILL
                </span>
                <span className="text-2xl font-extrabold text-[#b22222] tracking-tight leading-none mt-1">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenCheckout();
            }}
            className="w-full h-14 bg-[#b22222] hover:bg-[#8f000d] text-white font-bold text-base rounded-2xl shadow-lg shadow-[#b22222]/20 flex items-center justify-center gap-2.5 transition active:scale-[0.99]"
          >
            <CreditCard className="w-5 h-5" />
            <span>PROSES PEMBAYARAN ({formatCurrency(total)})</span>
          </button>
        </div>
      )}
    </div>
  );
}

