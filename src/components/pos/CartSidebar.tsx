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
    <div className="w-full lg:w-[420px] bg-white border-l border-[#2C221E]/10 flex flex-col h-full shadow-lg shrink-0 overflow-hidden">
      {/* Header Panel & Table/Guest Selectors */}
      <div className="p-5 border-b border-[#2C221E]/10 bg-white space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-2xl font-extrabold text-[#2C221E]">Current Order</h2>
            <span className="bg-[#C62828]/10 text-[#C62828] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {items.reduce((sum, item) => sum + item.qty, 0)} ITEMS
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-[#C62828] hover:underline flex items-center gap-1 transition uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            {isMobileDrawer && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-[#2C221E]/60 hover:bg-[#FAF6F0] rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Info & Guest Dropdown Pickers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FAF6F0] rounded-2xl p-3 flex items-center justify-between border border-[#2C221E]/10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C221E]">
              <UtensilsCrossed className="w-4 h-4 text-[#C62828]" />
              <span>{tableNumber}</span>
            </div>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-transparent text-[11px] text-[#2C221E]/70 focus:outline-none cursor-pointer font-bold"
            >
              <option value="Meja 12">Meja 12</option>
              <option value="Meja 01">Meja 01</option>
              <option value="Meja 05">Meja 05</option>
              <option value="Takeaway">Takeaway</option>
            </select>
          </div>

          <div className="bg-[#FAF6F0] rounded-2xl p-3 flex items-center justify-between border border-[#2C221E]/10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C221E]">
              <Users className="w-4 h-4 text-[#C62828]" />
              <span>{guestCount}</span>
            </div>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="bg-transparent text-[11px] text-[#2C221E]/70 focus:outline-none cursor-pointer font-bold"
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
      <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#2C221E]/50 py-12 text-center">
            <ShoppingBag className="w-14 h-14 text-[#2C221E]/20 mb-3 stroke-1" />
            <p className="text-sm font-bold text-[#2C221E]">Keranjang Masih Kosong</p>
            <p className="text-xs text-[#2C221E]/60 max-w-[220px] mt-1 font-medium">
              Pilih menu dari katalog di sebelah kiri untuk menambahkan ke pesanan.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="p-3.5 bg-[#FAF6F0]/80 rounded-2xl border border-[#2C221E]/10 space-y-2.5 hover:border-[#C62828]/30 hover:shadow-xs transition"
            >
              {/* Item Card Top Row */}
              <div className="flex gap-3 items-center">
                {/* Thumbnail photo (rounded square) */}
                <div className="w-14 h-14 rounded-xl bg-white border border-[#2C221E]/10 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils className="w-6 h-6 text-[#2C221E]/30" />
                  )}
                </div>

                {/* Menu Details & Unit Price */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#2C221E] leading-snug truncate">
                    {item.name}
                  </h4>
                  <div className="text-xs font-extrabold text-[#C62828] mt-0.5">
                    {formatCurrency(item.price * item.qty)}
                  </div>
                </div>

                {/* Quantity Stepper (- 1 +) minimalis */}
                <div className="flex items-center gap-1.5 bg-white border border-[#2C221E]/10 rounded-full p-1 shadow-xs shrink-0">
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[#2C221E] hover:bg-[#FAF6F0] transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-extrabold text-[#2C221E] px-1.5 min-w-[18px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[#2C221E] hover:bg-[#FAF6F0] transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sub-notes Input */}
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3 h-3 text-[#2C221E]/40 shrink-0" />
                <input
                  type="text"
                  value={item.note || ''}
                  onChange={(e) => updateNote(item.productId, e.target.value)}
                  placeholder="Tambah catatan (misal: Tanpa daun bawang)..."
                  className="w-full text-[11px] bg-white border border-[#2C221E]/10 rounded-lg px-2.5 py-1 text-[#2C221E] placeholder-[#2C221E]/40 focus:outline-none focus:ring-1 focus:ring-[#C62828]"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout Section */}
      {items.length > 0 && (
        <div className="p-5 bg-[#FAF6F0]/60 border-t border-[#2C221E]/10 space-y-4 shrink-0 shadow-lg">
          <div className="space-y-2 text-xs font-medium text-[#2C221E]/70">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-[#2C221E]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>PB1 Tax (10%)</span>
              <span className="font-bold text-[#2C221E]">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge (5%)</span>
              <span className="font-bold text-[#2C221E]">{formatCurrency(serviceCharge)}</span>
            </div>

            {/* Total Amount in Serif Font in Cherry Red (#C62828) */}
            <div className="pt-3 border-t border-[#2C221E]/10 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-[#2C221E]/60 uppercase tracking-widest">
                  TOTAL AMOUNT
                </span>
                <span className="font-serif text-3xl font-extrabold text-[#C62828] tracking-tight leading-none mt-1">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                onClick={clearCart}
                className="text-[10px] font-extrabold text-[#C62828] hover:underline uppercase tracking-wider mb-1"
              >
                Clear Order
              </button>
            </div>
          </div>

          {/* Action Buttons: Icon Buttons + Big Cherry Red CHARGE button */}
          <div className="flex items-center gap-2.5">
            <button
              title="More Options"
              className="w-14 h-14 flex items-center justify-center bg-white border border-[#2C221E]/10 text-[#2C221E] rounded-2xl hover:bg-[#FAF6F0] transition shadow-xs"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button
              title="Print Receipt Preview"
              className="w-14 h-14 flex items-center justify-center bg-white border border-[#2C221E]/10 text-[#2C221E] rounded-2xl hover:bg-[#FAF6F0] transition shadow-xs"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onOpenCheckout();
              }}
              className="flex-1 h-14 bg-[#C62828] hover:bg-[#a81c1c] text-white font-bold text-base rounded-2xl shadow-lg shadow-red-700/20 flex items-center justify-center gap-2 transition active:scale-[0.99] tracking-wider"
            >
              <CreditCard className="w-5 h-5" />
              <span>CHARGE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
