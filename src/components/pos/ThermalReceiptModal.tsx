'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Printer, CheckCircle2, X } from 'lucide-react';

interface ThermalReceiptModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ThermalReceiptModal({ order, isOpen, onClose }: ThermalReceiptModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt-printable,
          #thermal-receipt-printable * {
            visibility: visible;
          }
          #thermal-receipt-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10px;
            font-family: monospace;
            color: #000;
            background: #fff;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Banner */}
        <div className="bg-emerald-500 text-white p-4 text-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">Transaksi Berhasil!</h3>
          <p className="text-xs text-emerald-100">Nota struk belanja siap dicetak</p>
        </div>

        {/* Printable Thermal Receipt Box */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50">
          <div
            id="thermal-receipt-printable"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner font-mono text-xs text-slate-800 space-y-3"
          >
            {/* Store Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
              <div className="font-bold text-sm tracking-wider uppercase">F&B RESTO & POS</div>
              <div className="text-[10px] text-slate-500">Jl. Kuliner No. 123, Indonesia</div>
              <div className="text-[10px] text-slate-500">Telp: 0812-3456-7890</div>
            </div>

            {/* Transaction Metadata */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span>No. Struk:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{order.cashier?.name || 'Kasir POS'}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Item Details */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="font-bold text-slate-900">{item.product?.name}</div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>
                      {item.qty} x {formatCurrency(item.price)}
                    </span>
                    <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                  </div>
                  {item.note && (
                    <div className="text-[10px] text-slate-500 italic pl-2">
                      * Note: {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Calculations Summary */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>TOTAL:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Bayar (Tunai):</span>
                    <span>{formatCurrency(order.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                    <span>Kembalian:</span>
                    <span>{formatCurrency(order.changeAmount)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p className="mt-0.5">Simpan nota ini sebagai bukti pembayaran.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Struk</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition"
          >
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
}
