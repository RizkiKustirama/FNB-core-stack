'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Boxes,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  Loader2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  category: string | null;
  isLowStock: boolean;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('NAME_ASC');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, unitFilter, sortOption]);

  // Modal Add Material State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('GRAM');
  const [newStock, setNewStock] = useState<string>('0');
  const [newMinStock, setNewMinStock] = useState<string>('0');
  const [newCategory, setNewCategory] = useState<string>('Bahan Utama');
  const [submittingAdd, setSubmittingAdd] = useState<boolean>(false);

  // Modal Adjust Stock State
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [adjustQty, setAdjustQty] = useState<string>('0');
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustRefType, setAdjustRefType] = useState<string>('OPNAME_ADJUSTMENT');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [submittingAdjust, setSubmittingAdjust] = useState<boolean>(false);

  const [message, setMessage] = useState<string>('');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/raw-materials');
      const data = await res.json();
      if (data.success) setMaterials(data.data);
    } catch (err) {
      console.error('Failed to fetch raw materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAdd(true);
      const res = await fetch('/api/v1/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          unit: newUnit,
          currentStock: parseFloat(newStock),
          minStock: parseFloat(newMinStock),
          category: newCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal membuat bahan baku');

      setMessage('Bahan baku baru berhasil ditambahkan!');
      setIsAddOpen(false);
      setNewName('');
      setNewStock('0');
      setNewMinStock('0');
      fetchMaterials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    try {
      setSubmittingAdjust(true);
      const res = await fetch('/api/v1/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawMaterialId: selectedMaterial.id,
          qty: parseFloat(adjustQty),
          type: adjustType,
          referenceType: adjustRefType,
          reason: adjustReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal menyesuaikan stok');

      setMessage(`Stok ${selectedMaterial.name} berhasil diperbarui!`);
      setSelectedMaterial(null);
      setAdjustQty('0');
      setAdjustReason('');
      fetchMaterials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Filter & Sort Materials
  const filteredMaterials = materials
    .filter((mat) => {
      const matchesSearch = mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mat.category && mat.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'LOW_STOCK' && mat.isLowStock) ||
        (statusFilter === 'NORMAL' && !mat.isLowStock);
      const matchesUnit = unitFilter === 'ALL' || mat.unit.toUpperCase() === unitFilter.toUpperCase();
      return matchesSearch && matchesStatus && matchesUnit;
    })
    .sort((a, b) => {
      if (sortOption === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortOption === 'STOCK_ASC') return a.currentStock - b.currentStock;
      if (sortOption === 'STOCK_DESC') return b.currentStock - a.currentStock;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE));
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            Manajemen Inventori & Stok Opname
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau saldo fisik bahan mentah, ambang minimum, serta lakukan penyesuaian stok opname.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMaterials}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan Baku</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {[
            { id: 'ALL', label: 'Semua Stok' },
            { id: 'LOW_STOCK', label: 'Stok Menipis' },
            { id: 'NORMAL', label: 'Stok Aman' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Unit Filter */}
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Satuan</option>
            <option value="GRAM">Satuan: GRAM</option>
            <option value="ML">Satuan: ML</option>
            <option value="PCS">Satuan: PCS</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="NAME_ASC">Urut: Nama A-Z</option>
            <option value="STOCK_ASC">Stok: Terendah</option>
            <option value="STOCK_DESC">Stok: Terbanyak</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama bahan / kategori..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      {/* Materials Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Daftar Persediaan Bahan Mentah</span>
          <span className="text-slate-400 font-normal">
            Total {filteredMaterials.length} bahan (Limit 10 per halaman)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat data bahan baku...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="font-bold text-slate-700">Tidak ada bahan baku ditemukan.</p>
            <p className="text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">Nama Bahan</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Satuan (Unit)</th>
                    <th className="p-3.5">Stok Saat Ini</th>
                    <th className="p-3.5">Min. Stok</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-5 font-bold text-slate-900">{mat.name}</td>
                      <td className="p-3.5 text-slate-500">{mat.category || '-'}</td>
                      <td className="p-3.5 uppercase font-medium">{mat.unit}</td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {mat.currentStock} {mat.unit}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {mat.minStock} {mat.unit}
                      </td>
                      <td className="p-3.5">
                        {mat.isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => {
                            setSelectedMaterial(mat);
                            setAdjustQty('0');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition flex items-center gap-1 ml-auto"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                          <span>Stok Opname</span>
                        </button>
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
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredMaterials.length)}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-800">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredMaterials.length)}
                </strong>{' '}
                dari <strong className="text-slate-800">{filteredMaterials.length}</strong> bahan
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

      {/* Modal Add Material */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Manajemen Bahan Baku
                </span>
                <h3 className="text-base font-bold text-slate-900">Tambah Bahan Baku Baru</h3>
                <p className="text-xs text-slate-500">Masukkan item persediaan & ambang minimum stok</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Daging Ayam, Kopi Blend, Cup 16oz"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan Dasar</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    <option value="GRAM">GRAM</option>
                    <option value="ML">ML</option>
                    <option value="PCS">PCS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Bahan Utama, Kemasan, Bumbu"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    step="any"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Min. Stok</label>
                  <input
                    type="number"
                    step="any"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
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
                  disabled={submittingAdd}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submittingAdd ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adjust Stock */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Penyesuaian Fisik Stok
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Stok Opname: {selectedMaterial.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Stok fisik saat ini: <strong className="text-slate-800">{selectedMaterial.currentStock} {selectedMaterial.unit}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Penyesuaian</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as 'IN' | 'OUT')}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    <option value="IN">TAMBAH STOK (+)</option>
                    <option value="OUT">KURANGI STOK (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah (Qty)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Penyesuaian</label>
                <select
                  value={adjustRefType}
                  onChange={(e) => setAdjustRefType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="OPNAME_ADJUSTMENT">Stok Opname Rutin</option>
                  <option value="WASTE">Bahan Rusak / Cacat (Waste)</option>
                  <option value="EXPIRED">Kedaluwarsa (Expired)</option>
                  <option value="INITIAL">Stok Awal Tambahan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Alasan Detail</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Misal: Pecah saat pengiriman, kadaluwarsa per 17 Sep"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMaterial(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submittingAdjust ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Stok Opname'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
