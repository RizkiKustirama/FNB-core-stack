'use client';

import React, { useState } from 'react';
import { PosHeader } from '@/components/pos/PosHeader';
import { ProductCatalog } from '@/components/pos/ProductCatalog';
import { CartSidebar } from '@/components/pos/CartSidebar';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';

export default function PosPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const handleCheckoutSuccess = (orderData: any) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(orderData);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Top Header */}
      <PosHeader />

      {/* Main Workspace (Catalog + Cart) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Product Catalog Grid (Left 70%) */}
        <ProductCatalog />

        {/* Cart Sidebar (Right 30%) */}
        <CartSidebar onOpenCheckout={() => setIsCheckoutOpen(true)} />
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
