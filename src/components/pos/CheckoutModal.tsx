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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Kasir & Kas
            </span>
            <h3 className="text-base font-bold text-slate-900">Pembayaran & Checkout</h3>
            <p className="text-xs text-slate-500">Pilih metode pembayaran transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grand Total Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Tagihan (Inc. Pajak & Service)
            </span>
            <div className="text-2xl font-black text-blue-600">
              {formatCurrency(grandTotal)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('CASH');
                  setCashReceived(String(grandTotal));
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'CASH'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'QRIS'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Cash Specific Controls */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uang Diterima (Rp)
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Quick Nominal Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCashReceived(String(grandTotal))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('50000')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition"
                >
                  50.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('100000')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition"
                >
                  100.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('150000')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition"
                >
                  150.000
                </button>
              </div>

              {/* Change Amount Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Uang Kembalian:</span>
                <span className="text-sm font-black">{formatCurrency(changeAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading || isInsufficient}
            onClick={handleProcessCheckout}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
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
