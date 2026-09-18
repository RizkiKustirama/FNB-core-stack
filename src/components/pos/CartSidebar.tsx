'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Edit3,
  X,
  Utensils,
  Printer,
  MoreHorizontal,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

interface CartSidebarProps {
  onOpenCheckout: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export function CartSidebar({ onOpenCheckout, isMobileDrawer, onCloseMobile }: CartSidebarProps) {
  const { items, removeItem, updateQty, updateNote, clearCart, getSubtotal, getTotalAmount } =
    useCartStore();

  const [tableNumber, setTableNumber] = useState<string>('Meja 12');
  const [guestCount, setGuestCount] = useState<string>('2 Tamu');

  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * 0.1); // PB1 Tax 10%
  const serviceCharge = Math.round(subtotal * 0.05); // Service Charge 5%
  const grandTotal = subtotal + tax + serviceCharge;

  return (
    <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shadow-lg shrink-0 overflow-hidden">
      {/* Header Panel & Table/Guest Selectors */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 space-y-3.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Keranjang Pesanan</h2>
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

        {/* Table Info & Guest Dropdown Pickers */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-xl p-2.5 flex items-center justify-between border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <UtensilsCrossed className="w-3.5 h-3.5 text-blue-600" />
              <span>{tableNumber}</span>
            </div>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-transparent text-[11px] text-slate-600 focus:outline-none cursor-pointer font-bold"
            >
              <option value="Meja 12">Meja 12</option>
              <option value="Meja 01">Meja 01</option>
              <option value="Meja 05">Meja 05</option>
              <option value="Takeaway">Takeaway</option>
            </select>
          </div>

          <div className="bg-white rounded-xl p-2.5 flex items-center justify-between border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>{guestCount}</span>
            </div>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="bg-transparent text-[11px] text-slate-600 focus:outline-none cursor-pointer font-bold"
            >
              <option value="1 Tamu">1 Tamu</option>
              <option value="2 Tamu">2 Tamu</option>
              <option value="4 Tamu">4 Tamu</option>
              <option value="6 Tamu">6 Tamu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Order Item List (Compact Item Cards with Thumbnail photo & Stepper) */}
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
              className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5 hover:border-blue-300 transition"
            >
              {/* Item Card Top Row */}
              <div className="flex gap-3 items-center">
                {/* Thumbnail photo (rounded square) */}
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

                {/* Menu Details & Price */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">
                    {item.name}
                  </h4>
                  <div className="text-xs font-bold text-blue-600 mt-0.5">
                    {formatCurrency(item.price * item.qty)}
                  </div>
                </div>

                {/* Quantity Stepper (- 1 +) */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs shrink-0">
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 px-1.5 min-w-[18px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sub-notes Input */}
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={item.note || ''}
                  onChange={(e) => updateNote(item.productId, e.target.value)}
                  placeholder="Catatan pesanan (misal: Pedas)..."
                  className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout Section */}
      {items.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>PB1 Tax (10%)</span>
              <span className="font-bold text-slate-800">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge (5%)</span>
              <span className="font-bold text-slate-800">{formatCurrency(serviceCharge)}</span>
            </div>

            {/* Total Amount */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  TOTAL TAGIHAN
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight leading-none mt-0.5">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                onClick={clearCart}
                className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wider mb-0.5"
              >
                Kosongkan
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              title="Opsi Opsi Tambahan"
              className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition shrink-0"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button
              title="Cetak Struk"
              className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition shrink-0"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onOpenCheckout();
              }}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] tracking-wider"
            >
              <CreditCard className="w-4 h-4" />
              <span>BAYAR {formatCurrency(grandTotal)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
