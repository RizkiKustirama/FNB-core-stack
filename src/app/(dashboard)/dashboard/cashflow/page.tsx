'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Receipt, Plus, RefreshCw, TrendingUp, TrendingDown, CheckCircle, Loader2 } from 'lucide-react';

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

  const totalIn = logs.filter((l) => l.type === 'IN').reduce((sum, l) => sum + l.amount, 0);
  const totalOut = logs.filter((l) => l.type === 'OUT').reduce((sum, l) => sum + l.amount, 0);

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

      {/* Cashflow Logs Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700">
          Riwayat Jurnal Arus Kas
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat riwayat arus kas...</div>
        ) : (
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
                {logs.map((log) => (
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
        )}
      </div>

      {/* Modal Add Manual Expense */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Catat Pengeluaran Manual</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
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
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL / Link Foto Bukti Nota (Opsional)</label>
                <input
                  type="text"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                  placeholder="https://storage... / foto_nota.jpg"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center justify-center gap-2"
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
