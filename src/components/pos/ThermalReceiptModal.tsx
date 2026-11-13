'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Printer,
  CheckCircle2,
  X,
  Zap,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  printReceiptBluetooth,
  connectBluetoothPrinter,
  reconnectKnownPrinter,
  subscribePrinterState,
  ThermalPrinterState,
} from '@/lib/bluetooth-printer';
import { buildWhatsAppShareUrl } from '@/lib/receipt-formatter';

interface ThermalReceiptModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ThermalReceiptModal({ order, isOpen, onClose }: ThermalReceiptModalProps) {
  const [printerState, setPrinterState] = useState<ThermalPrinterState>({
    isSupported: false,
    isConnected: false,
    isConnecting: false,
    deviceName: null,
    error: null,
  });
  const [isPrintingBt, setIsPrintingBt] = useState<boolean>(false);
  const [printError, setPrintError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePrinterState((state) => {
      setPrinterState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen || !order) return null;

  const handleStandardPrint = () => {
    window.print();
  };

  const handlePrintBluetooth = async () => {
    try {
      setIsPrintingBt(true);
      setPrintError(null);

      if (!printerState.isConnected) {
        const ok = await reconnectKnownPrinter();
        if (!ok) {
          await connectBluetoothPrinter();
        }
      }

      await printReceiptBluetooth(order);
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setPrintError(err.message || 'Gagal mencetak ke printer Bluetooth.');
      }
    } finally {
      setIsPrintingBt(false);
    }
  };

  const handleShareWhatsApp = () => {
    const url = buildWhatsAppShareUrl(order);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Print CSS optimized for 58mm & 80mm thermal printers */}
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
            width: 58mm;
            max-width: 58mm;
            padding: 4px;
            margin: 0;
            font-family: monospace;
            font-size: 11px;
            line-height: 1.25;
            color: #000;
            background: #fff;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Transaksi Berhasil
            </span>
            <h3 className="text-base font-bold text-slate-900">Struk Pembayaran</h3>
            <p className="text-xs text-slate-500">Nota belanja pelanggan siap dicetak</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {printError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-[11px]">{printError}</span>
          </div>
        )}

        {/* Printable Thermal Receipt Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-[50vh] overflow-y-auto">
          <div
            id="thermal-receipt-printable"
            className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs font-mono text-xs text-slate-900 space-y-3"
          >
            {/* Store Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
              <div className="font-bold text-sm tracking-wider uppercase text-slate-900">
                F&B RESTO & POS
              </div>
              <div className="text-[10px] text-slate-500">Jl. Kuliner No. 123, Indonesia</div>
              <div className="text-[10px] text-slate-500">Telp: 0812-3456-7890</div>
            </div>

            {/* Transaction Metadata */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span>No. Struk:</span>
                <span className="font-bold text-slate-900">{order.orderNumber}</span>
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
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Item Details */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="font-bold text-slate-900">
                    {item.product?.name}
                    {item.levelName ? ` (${item.levelName})` : ''}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-700">
                    <span>
                      {item.qty} x {formatCurrency(item.price)}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </span>
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
                <span className="text-blue-700">{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-[11px] text-slate-700">
                    <span>Bayar (Tunai):</span>
                    <span>{formatCurrency(order.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-900 font-bold">
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

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {/* Web Bluetooth Fast Print Button */}
          {printerState.isSupported && (
            <button
              type="button"
              onClick={handlePrintBluetooth}
              disabled={isPrintingBt || printerState.isConnecting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
            >
              {isPrintingBt || printerState.isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyambung & Mencetak...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>
                    {printerState.isConnected
                      ? `Cetak Cepat Bluetooth (${printerState.deviceName || 'Thermal'})`
                      : printerState.deviceName
                      ? `Sambung & Cetak (${printerState.deviceName})`
                      : 'Sambungkan & Cetak Bluetooth'}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleStandardPrint}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
              title="Cetak via dialog browser / PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak Biasa</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
              title="Kirim Struk via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Struk WA</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Selesai / Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
}
