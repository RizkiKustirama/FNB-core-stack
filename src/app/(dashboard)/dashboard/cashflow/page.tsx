'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Receipt,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Loader2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CashflowLog {
  id: string;
  type: 'IN' | 'OUT';
  category: string;
  amount: number;
  description: string | null;
  proofImageUrl: string | null;
  createdAt: string;
  user: { name: string } | null;
}

export default function CashflowPage() {
  const [logs, setLogs] = useState<CashflowLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortDate, setSortDate] = useState<string>('DESC');
  const [sortAmount, setSortAmount] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, categoryFilter, sortDate, sortAmount]);

  // Modal Expense State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('SUPPLIES_PURCHASE');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/cashflow');
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (err) {
      console.error('Failed to fetch cashflow logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount),
          description,
          proofImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal menyimpan pengeluaran');

      setMessage('Pengeluaran operasional berhasil dicatat!');
      setIsAddOpen(false);
      setAmount('');
      setDescription('');
      setProofImageUrl('');
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Sort Cashflow Logs
  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch =
        (log.description && log.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.user && log.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
      const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      if (sortAmount === 'DESC') return b.amount - a.amount;
      if (sortAmount === 'ASC') return a.amount - b.amount;
      if (sortDate === 'ASC') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalIn = logs.filter((l) => l.type === 'IN').reduce((sum, l) => sum + l.amount, 0);
  const totalOut = logs.filter((l) => l.type === 'OUT').reduce((sum, l) => sum + l.amount, 0);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            Arus Kas & Pengeluaran Manual (Cashflow)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan uang masuk otomatis dari POS kasir & input pengeluaran belanja harian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Uang Keluar (Expense)</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Total Uang Masuk</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalIn)}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Total Uang Keluar</span>
            <div className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(totalOut)}</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Saldo Bersih (Net)</span>
            <div className="text-xl font-bold text-blue-600 mt-1">
              {formatCurrency(totalIn - totalOut)}
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Dropdown Tipe */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Transaksi</option>
            <option value="IN">Uang Masuk (+)</option>
            <option value="OUT">Uang Keluar (-)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="POS_SALES">Penjualan POS</option>
            <option value="SUPPLIES_PURCHASE">Belanja Bahan</option>
            <option value="UTILITIES">Utilitas (Listrik/Air/Net)</option>
            <option value="SALARY">Gaji Karyawan</option>
            <option value="OTHER">Lain-lain</option>
          </select>

          {/* Dropdown Urut Waktu */}
          <select
            value={sortDate}
            onChange={(e) => {
              setSortDate(e.target.value);
              setSortAmount('ALL');
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DESC">Terbaru</option>
            <option value="ASC">Terlama</option>
          </select>

          {/* Dropdown Urut Nominal */}
          <select
            value={sortAmount}
            onChange={(e) => setSortAmount(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Nominal</option>
            <option value="DESC">Terbesar</option>
            <option value="ASC">Terkecil</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari keterangan / user..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition"
          />
        </div>
      </div>

      {/* Cashflow Logs Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Riwayat Jurnal Arus Kas</span>
          <span className="text-slate-400 font-normal">
            Total {filteredLogs.length} jurnal (Limit 10 per halaman)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat riwayat arus kas...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="font-bold text-slate-700">Tidak ada riwayat arus kas ditemukan.</p>
            <p className="text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">Waktu</th>
                    <th className="p-3.5">Tipe</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5">Dicatat Oleh</th>
                    <th className="p-3.5 pr-5 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-5 text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5">
                        {log.type === 'IN' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            MASUK (+)
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            KELUAR (-)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{log.category}</td>
                      <td className="p-3.5 text-slate-600">{log.description || '-'}</td>
                      <td className="p-3.5 text-slate-500">{log.user?.name || 'Sistem POS'}</td>
                      <td
                        className={`p-3.5 pr-5 text-right font-bold ${
                          log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {log.type === 'IN' ? '+' : '-'} {formatCurrency(log.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <strong className="text-slate-800">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredLogs.length)}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-800">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}
                </strong>{' '}
                dari <strong className="text-slate-800">{filteredLogs.length}</strong> transaksi
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>
                <span className="font-bold text-slate-800 px-2">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition flex items-center gap-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Add Manual Expense */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Arus Kas & Expense
                </span>
                <h3 className="text-base font-bold text-slate-900">Catat Pengeluaran Manual</h3>
                <p className="text-xs text-slate-500">Input transaksi uang keluar belanja harian</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="SUPPLIES_PURCHASE">Belanja Bahan & Pasar</option>
                  <option value="UTILITIES">Utilitas (Listrik, Air, Internet)</option>
                  <option value="SALARY">Gaji & Upah Karyawan</option>
                  <option value="OTHER">Lain-lain / Operasional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Uang Keluar (Rp)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Misal: 150000"
                  className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Beli Sayur Pasar Pagi & Gas LPG"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL / Link Foto Bukti Nota (Opsional)</label>
                <input
                  type="text"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                  placeholder="https://storage... / foto_nota.jpg"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
