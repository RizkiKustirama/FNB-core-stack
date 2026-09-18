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
  const total = getTotalAmount();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [cashReceived, setCashReceived] = useState<string>(String(total));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const numCashReceived = parseFloat(cashReceived) || 0;
  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, numCashReceived - total) : 0;
  const isInsufficient = paymentMethod === 'CASH' && numCashReceived < total;

  const handleProcessCheckout = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        paymentMethod,
        cashReceived: paymentMethod === 'CASH' ? numCashReceived : total,
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
    <div className="fixed inset-0 z-50 bg-[#1e1b13]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fff8ef] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-[#e2beba]/30">
        {/* Header */}
        <div className="p-5 border-b border-[#e2beba]/30 flex items-center justify-between bg-[#f5edde]">
          <div>
            <h3 className="text-base font-bold text-[#1e1b13]">Pembayaran & Checkout</h3>
            <p className="text-xs text-[#5a403e]">Pilih metode pembayaran transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-[#5a403e] hover:text-[#1e1b13] hover:bg-[#efe7d9] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs rounded-2xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grand Total Card */}
          <div className="p-4 bg-[#f5edde] border border-[#e2beba]/40 rounded-2xl text-center">
            <span className="text-xs font-bold text-[#5a403e] uppercase tracking-wider">Total Pembayaran</span>
            <div className="text-3xl font-extrabold text-[#b22222] mt-1 tracking-tight">
              {formatCurrency(total)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1e1b13] mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('CASH');
                  setCashReceived(String(total));
                }}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'CASH'
                    ? 'border-[#b22222] bg-[#b22222] text-white shadow-md shadow-[#b22222]/20'
                    : 'border-[#e2beba]/40 bg-[#f5edde] text-[#1e1b13] hover:bg-[#efe7d9]'
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
                    ? 'border-[#b22222] bg-[#b22222] text-white shadow-md shadow-[#b22222]/20'
                    : 'border-[#e2beba]/40 bg-[#f5edde] text-[#1e1b13] hover:bg-[#efe7d9]'
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
                    ? 'border-[#b22222] bg-[#b22222] text-white shadow-md shadow-[#b22222]/20'
                    : 'border-[#e2beba]/40 bg-[#f5edde] text-[#1e1b13] hover:bg-[#efe7d9]'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Cash Specific Controls */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 pt-3 border-t border-[#e2beba]/30">
              <div>
                <label className="block text-xs font-bold text-[#1e1b13] mb-1.5">
                  Uang Diterima (Rp)
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-4 py-3 text-xl font-extrabold bg-[#f5edde] border border-[#e2beba]/40 rounded-2xl text-[#1e1b13] focus:outline-none focus:ring-2 focus:ring-[#b22222] transition"
                />
              </div>

              {/* Quick Nominal Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCashReceived(String(total))}
                  className="px-3 py-1.5 bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] text-xs font-bold rounded-xl border border-[#e2beba]/30 transition"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('20000')}
                  className="px-3 py-1.5 bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] text-xs font-bold rounded-xl border border-[#e2beba]/30 transition"
                >
                  20.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('50000')}
                  className="px-3 py-1.5 bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] text-xs font-bold rounded-xl border border-[#e2beba]/30 transition"
                >
                  50.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('100000')}
                  className="px-3 py-1.5 bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] text-xs font-bold rounded-xl border border-[#e2beba]/30 transition"
                >
                  100.000
                </button>
              </div>

              {/* Change Amount Box */}
              <div className="p-3.5 bg-[#f5edde] border border-[#e2beba]/40 rounded-2xl flex items-center justify-between text-xs font-bold text-[#1e1b13]">
                <span>Uang Kembalian:</span>
                <span className="text-base text-[#b22222] font-extrabold">{formatCurrency(changeAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#f5edde] border-t border-[#e2beba]/30 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3.5 text-xs font-bold text-[#5a403e] bg-[#fff8ef] border border-[#e2beba]/40 hover:bg-[#efe7d9] rounded-2xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading || isInsufficient}
            onClick={handleProcessCheckout}
            className="w-2/3 py-3.5 bg-[#b22222] hover:bg-[#8f000d] text-white text-xs font-bold rounded-2xl shadow-md shadow-[#b22222]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
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

