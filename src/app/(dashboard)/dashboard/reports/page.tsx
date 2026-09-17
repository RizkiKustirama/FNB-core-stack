'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, DollarSign, TrendingDown, RefreshCw, Printer } from 'lucide-react';

interface ReportData {
  totalCashIn: number;
  totalCashOut: number;
  netProfit: number;
  expenseByCategory: Record<string, number>;
  transactionCount: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/reports/profit-loss');
      const data = await res.json();
      if (data.success) setReport(data.data);
    } catch (err) {
      console.error('Failed to fetch P&L report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Laporan Keuangan Laba Rugi (Profit & Loss)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Formulasi Laba Bersih = Total Uang Masuk Penjualan POS - Total Uang Keluar Operasional.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            title="Refresh Laporan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {loading || !report ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Mengkalkulasi Laporan Laba Rugi...
        </div>
      ) : (
        <>
          {/* Main Profit Card */}
          <div className="p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Laba Bersih Operasional (Net Profit)
              </span>
              <div className="text-4xl font-black mt-1 text-white">
                {formatCurrency(report.netProfit)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Terhitung dari {report.transactionCount} entri catatan transaksi & arus kas.
              </p>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-right">
              <div className="text-xs text-slate-300">Total Penjualan POS</div>
              <div className="text-lg font-bold text-emerald-400">{formatCurrency(report.totalCashIn)}</div>
              <div className="text-xs text-slate-300 mt-2">Total Beban Pengeluaran</div>
              <div className="text-lg font-bold text-rose-400">{formatCurrency(report.totalCashOut)}</div>
            </div>
          </div>

          {/* Breakdown Expenses Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Rincian Pengeluaran Berdasarkan Kategori
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold">Belanja Bahan & Pasar</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {formatCurrency(report.expenseByCategory['SUPPLIES_PURCHASE'] || 0)}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold">Utilitas (Listrik, Air, Net)</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {formatCurrency(report.expenseByCategory['UTILITIES'] || 0)}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold">Gaji Karyawan</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {formatCurrency(report.expenseByCategory['SALARY'] || 0)}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold">Lain-lain / Operasional</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {formatCurrency(report.expenseByCategory['OTHER'] || 0)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
