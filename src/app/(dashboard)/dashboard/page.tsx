import React from 'react';
import Link from 'next/link';
import { getProfitAndLossReport } from '@/services/cashflow.service';
import { getRawMaterials } from '@/services/inventory.service';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Boxes,
  Receipt,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const report = await getProfitAndLossReport();
  const rawMaterials = await getRawMaterials();
  const lowStockItems = rawMaterials.filter((m) => m.isLowStock);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ringkasan Operasional F&B</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas, pemasukan dari POS, dan status persediaan stok bahan baku secara real-time.
          </p>
        </div>
        <Link
          href="/pos"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buka Kasir Web POS</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Total Pemasukan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pemasukan (POS)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(report.totalCashIn)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Otomatis dari transaksi POS Kasir
          </div>
        </div>

        {/* Card Total Pengeluaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pengeluaran</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(report.totalCashOut)}
          </div>
          <div className="text-[11px] text-rose-600 font-medium">
            Belanja pasar, utilitas, & operasional
          </div>
        </div>

        {/* Card Laba Bersih */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Laba Bersih (Net Profit)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatCurrency(report.netProfit)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Kalkulasi: Pemasukan - Pengeluaran
          </div>
        </div>

        {/* Card Stock Alert Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Stok Menipis</span>
            <div className={`p-2 rounded-xl ${lowStockItems.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {lowStockItems.length} <span className="text-sm font-normal text-slate-500">Bahan</span>
          </div>
          <div className="text-[11px] text-amber-600 font-medium">
            {lowStockItems.length > 0 ? 'Perlu Stok Opname / Pembelian' : 'Stok dalam batas aman'}
          </div>
        </div>
      </div>

      {/* Warning Alert Banner if low stock items exist */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-900 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Perhatian: Terdapat {lowStockItems.length} bahan baku dengan stok saat ini di bawah ambang minimum (
              {lowStockItems.map((i) => i.name).join(', ')}).
            </span>
          </div>
          <Link
            href="/dashboard/inventory"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shrink-0 flex items-center gap-1"
          >
            <span>Cek Inventori</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/inventory"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Kelola Bahan Baku</h3>
          <p className="text-xs text-slate-500 mt-1">
            Lihat daftar stok bahan mentah, batas minimum, dan lakukan Stok Opname.
          </p>
        </Link>

        <Link
          href="/dashboard/cashflow"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Catat Pengeluaran Manual</h3>
          <p className="text-xs text-slate-500 mt-1">
            Input belanja pasar, biaya tempat, gaji karyawan, dan upload bukti foto nota.
          </p>
        </Link>

        <Link
          href="/dashboard/reports"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Laporan Laba Rugi</h3>
          <p className="text-xs text-slate-500 mt-1">
            Analisis ringkasan finansial harian dan bulanan secara terperinci.
          </p>
        </Link>
      </div>
    </div>
  );
}
