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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fff8ef] p-6 rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e1b13] tracking-tight">Ringkasan Operasional F&B</h1>
          <p className="text-xs text-[#5a403e] mt-1 font-medium">
            Pantau arus kas, pemasukan dari POS, dan status persediaan stok bahan baku secara real-time.
          </p>
        </div>
        <Link
          href="/pos"
          className="px-5 py-3 bg-[#b22222] hover:bg-[#8f000d] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#b22222]/20 flex items-center justify-center gap-2 transition self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buka Order Terminal (POS)</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Total Pemasukan */}
        <div className="bg-[#fff8ef] p-5 rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403e] uppercase tracking-wider">Total Pemasukan (POS)</span>
            <div className="p-2.5 bg-[#f5edde] text-[#b22222] rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1e1b13]">
            {formatCurrency(report.totalCashIn)}
          </div>
          <div className="text-[11px] text-[#b22222] font-semibold">
            Otomatis dari transaksi POS Kasir
          </div>
        </div>

        {/* Card Total Pengeluaran */}
        <div className="bg-[#fff8ef] p-5 rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403e] uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2.5 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1e1b13]">
            {formatCurrency(report.totalCashOut)}
          </div>
          <div className="text-[11px] text-[#ba1a1a] font-semibold">
            Belanja pasar, utilitas, & operasional
          </div>
        </div>

        {/* Card Laba Bersih */}
        <div className="bg-[#fff8ef] p-5 rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403e] uppercase tracking-wider">Laba Bersih (Net Profit)</span>
            <div className="p-2.5 bg-[#f5edde] text-[#b22222] rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${report.netProfit >= 0 ? 'text-[#b22222]' : 'text-[#ba1a1a]'}`}>
            {formatCurrency(report.netProfit)}
          </div>
          <div className="text-[11px] text-[#5a403e] font-medium">
            Kalkulasi: Pemasukan - Pengeluaran
          </div>
        </div>

        {/* Card Stock Alert Warning */}
        <div className="bg-[#fff8ef] p-5 rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403e] uppercase tracking-wider">Stok Menipis</span>
            <div className={`p-2.5 rounded-2xl ${lowStockItems.length > 0 ? 'bg-[#cca72f]/20 text-[#735c00]' : 'bg-[#f5edde] text-[#5a403e]'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1e1b13]">
            {lowStockItems.length} <span className="text-sm font-medium text-[#5a403e]">Bahan</span>
          </div>
          <div className="text-[11px] text-[#735c00] font-bold">
            {lowStockItems.length > 0 ? 'Perlu Stok Opname / Pembelian' : 'Stok dalam batas aman'}
          </div>
        </div>
      </div>

      {/* Warning Alert Banner if low stock items exist */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-3xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-[#ba1a1a] font-bold">
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a] shrink-0" />
            <span>
              Perhatian: Terdapat {lowStockItems.length} bahan baku dengan stok saat ini di bawah ambang minimum (
              {lowStockItems.map((i) => i.name).join(', ')}).
            </span>
          </div>
          <Link
            href="/dashboard/inventory"
            className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold rounded-2xl transition shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>Cek Inventori</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/inventory"
          className="p-6 bg-[#fff8ef] rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#b22222]/40 transition-all group"
        >
          <div className="p-3 bg-[#f5edde] text-[#b22222] rounded-2xl w-fit mb-3 group-hover:bg-[#b22222] group-hover:text-white transition">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-[#1e1b13]">Kelola Bahan Baku & Inventori</h3>
          <p className="text-xs text-[#5a403e] mt-1 font-medium">
            Lihat daftar stok bahan mentah, batas minimum, dan lakukan Stok Opname.
          </p>
        </Link>

        <Link
          href="/dashboard/cashflow"
          className="p-6 bg-[#fff8ef] rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#b22222]/40 transition-all group"
        >
          <div className="p-3 bg-[#f5edde] text-[#b22222] rounded-2xl w-fit mb-3 group-hover:bg-[#b22222] group-hover:text-white transition">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-[#1e1b13]">Catat Pengeluaran Manual</h3>
          <p className="text-xs text-[#5a403e] mt-1 font-medium">
            Input belanja pasar, biaya tempat, gaji karyawan, dan upload bukti foto nota.
          </p>
        </Link>

        <Link
          href="/dashboard/reports"
          className="p-6 bg-[#fff8ef] rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#b22222]/40 transition-all group"
        >
          <div className="p-3 bg-[#f5edde] text-[#b22222] rounded-2xl w-fit mb-3 group-hover:bg-[#b22222] group-hover:text-white transition">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-[#1e1b13]">Laporan Laba Rugi</h3>
          <p className="text-xs text-[#5a403e] mt-1 font-medium">
            Analisis ringkasan finansial harian dan bulanan secara terperinci.
          </p>
        </Link>
      </div>
    </div>
  );
}

