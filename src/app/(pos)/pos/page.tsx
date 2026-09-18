'use client';

import React, { useState } from 'react';
import { PosHeader } from '@/components/pos/PosHeader';
import { ProductCatalog } from '@/components/pos/ProductCatalog';
import { CartSidebar } from '@/components/pos/CartSidebar';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ChevronUp } from 'lucide-react';

export default function PosPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState<boolean>(false);

  const { items, getTotalAmount } = useCartStore();
  const totalItemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = getTotalAmount();
  const tax = Math.round(subtotal * 0.1);
  const serviceCharge = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax + serviceCharge;

  const handleCheckoutSuccess = (orderData: any) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(orderData);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden select-none font-sans">
      {/* Top Header */}
      <PosHeader />

      {/* Main Workspace (Catalog + Cart Panel) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Product Catalog Grid */}
        <ProductCatalog />

        {/* Desktop Cart Sidebar (Hidden on Mobile) */}
        <div className="hidden lg:block h-full">
          <CartSidebar onOpenCheckout={() => setIsCheckoutOpen(true)} />
        </div>
      </div>

      {/* Mobile Floating Bottom Bar (Visible on Mobile when items in cart) */}
      {totalItemCount > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30">
          <button
            onClick={() => setMobileCartOpen(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs active:scale-[0.99] transition border border-blue-400/30"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div>Keranjang Pesanan ({totalItemCount} Item)</div>
                <div className="text-[10px] text-blue-200 font-normal">Klik untuk lihat rincian</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm font-extrabold">
              <span>{formatCurrency(grandTotal)}</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Cart Drawer Backdrop */}
      {mobileCartOpen && (
        <div
          onClick={() => setMobileCartOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Cart Drawer Slide-Up */}
      <div
        className={`fixed inset-x-0 bottom-0 top-12 bg-white z-50 rounded-t-3xl overflow-hidden transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${
          mobileCartOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <CartSidebar
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          isMobileDrawer
          onCloseMobile={() => setMobileCartOpen(false)}
        />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Receipt Modal & Thermal Printing */}
      <ThermalReceiptModal
        order={completedOrder}
        isOpen={!!completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}
