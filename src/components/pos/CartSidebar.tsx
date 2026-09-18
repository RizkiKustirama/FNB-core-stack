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
  const total = getTotalAmount();

  return (
    <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
      {/* Header Cart */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">Keranjang Pesanan</h2>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {items.reduce((sum, item) => sum + item.qty, 0)} item
          </span>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          )}

          {isMobileDrawer && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-200 mb-2 stroke-1" />
            <p className="text-xs font-medium text-slate-500">Keranjang masih kosong</p>
            <p className="text-[11px] text-slate-400 max-w-[200px] mt-1">
              Pilih menu dari katalog di sebelah kiri untuk menambahkan ke pesanan.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5 hover:border-blue-300 hover:shadow-sm transition"
            >
              {/* Item Top: Thumbnail Image + Details + Remove */}
              <div className="flex gap-3 items-center">
                {/* Thumbnail Display Image */}
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                {/* Name & Unit Price */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">
                    {item.name}
                  </h4>
                  <div className="text-[11px] font-semibold text-blue-600 mt-0.5">
                    {formatCurrency(item.price)}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-slate-400 hover:text-rose-500 transition p-1 shrink-0"
                  title="Hapus dari keranjang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Note input */}
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={item.note || ''}
                  onChange={(e) => updateNote(item.productId, e.target.value)}
                  placeholder="Catatan (misal: Tanpa daun bawang)..."
                  className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Qty Counter & Item Total */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-extrabold text-slate-800 px-2 min-w-[20px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-xs font-black text-slate-900">
                  {formatCurrency(item.price * item.qty)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Calculation & Checkout Button */}
      {items.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pajak / Service</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Tagihan</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenCheckout();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <CreditCard className="w-4 h-4" />
            <span>BAYAR {formatCurrency(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
