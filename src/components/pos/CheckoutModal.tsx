'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';
import { X, Banknote, QrCode, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderData: any) => void;
}

export function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { items, getTotalAmount, clearCart } = useCartStore();
  const subtotal = getTotalAmount();
  const tax = Math.round(subtotal * 0.1);
  const serviceCharge = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax + serviceCharge;

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [cashReceived, setCashReceived] = useState<string>(String(grandTotal));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const numCashReceived = parseFloat(cashReceived) || 0;
  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, numCashReceived - grandTotal) : 0;
  const isInsufficient = paymentMethod === 'CASH' && numCashReceived < grandTotal;

  const handleProcessCheckout = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        paymentMethod,
        cashReceived: paymentMethod === 'CASH' ? numCashReceived : grandTotal,
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          price: item.price,
          note: item.note || undefined,
        })),
      };

      const res = await fetch('/api/v1/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memproses transaksi.');
      }

      clearCart();
      onSuccess(data.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-[#2C221E]/10">
        {/* Header */}
        <div className="p-5 border-b border-[#2C221E]/10 flex items-center justify-between bg-[#FAF6F0]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C221E]">Pembayaran & Checkout</h3>
            <p className="text-xs text-[#2C221E]/60">Pilih metode pembayaran transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-[#2C221E]/60 hover:text-[#2C221E] hover:bg-[#2C221E]/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-[#C62828] text-xs font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grand Total Card */}
          <div className="p-4 bg-[#FAF6F0] border border-[#2C221E]/10 rounded-2xl text-center">
            <span className="text-xs font-bold text-[#2C221E]/60 uppercase tracking-wider">
              Total Tagihan (Inc. Pajak & Service)
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#C62828] mt-1 tracking-tight">
              {formatCurrency(grandTotal)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[#2C221E] mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('CASH');
                  setCashReceived(String(grandTotal));
                }}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'CASH'
                    ? 'border-[#C62828] bg-[#C62828] text-white shadow-md shadow-red-700/20'
                    : 'border-[#2C221E]/10 bg-[#FAF6F0] text-[#2C221E] hover:bg-white'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'QRIS'
                    ? 'border-[#C62828] bg-[#C62828] text-white shadow-md shadow-red-700/20'
                    : 'border-[#2C221E]/10 bg-[#FAF6F0] text-[#2C221E] hover:bg-white'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-[#C62828] bg-[#C62828] text-white shadow-md shadow-red-700/20'
                    : 'border-[#2C221E]/10 bg-[#FAF6F0] text-[#2C221E] hover:bg-white'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Cash Specific Controls */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 pt-3 border-t border-[#2C221E]/10">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1.5">
                  Uang Diterima (Rp)
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-4 py-3 text-xl font-extrabold bg-[#FAF6F0] border border-[#2C221E]/10 rounded-2xl text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#C62828] transition"
                />
              </div>

              {/* Quick Nominal Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCashReceived(String(grandTotal))}
                  className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-white text-[#2C221E] text-xs font-bold rounded-xl border border-[#2C221E]/10 transition"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('50000')}
                  className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-white text-[#2C221E] text-xs font-bold rounded-xl border border-[#2C221E]/10 transition"
                >
                  50.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('100000')}
                  className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-white text-[#2C221E] text-xs font-bold rounded-xl border border-[#2C221E]/10 transition"
                >
                  100.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('150000')}
                  className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-white text-[#2C221E] text-xs font-bold rounded-xl border border-[#2C221E]/10 transition"
                >
                  150.000
                </button>
              </div>

              {/* Change Amount Box */}
              <div className="p-3.5 bg-[#FAF6F0] border border-[#2C221E]/10 rounded-2xl flex items-center justify-between text-xs font-bold text-[#2C221E]">
                <span>Uang Kembalian:</span>
                <span className="text-base text-[#C62828] font-extrabold">{formatCurrency(changeAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#FAF6F0] border-t border-[#2C221E]/10 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3.5 text-xs font-bold text-[#2C221E]/70 bg-white border border-[#2C221E]/10 hover:bg-[#FAF6F0] rounded-2xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading || isInsufficient}
            onClick={handleProcessCheckout}
            className="w-2/3 py-3.5 bg-[#C62828] hover:bg-[#a81c1c] text-white text-xs font-bold rounded-2xl shadow-md shadow-red-700/20 flex items-center justify-center gap-2 transition disabled:opacity-50 tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>PROSES PEMBAYARAN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
