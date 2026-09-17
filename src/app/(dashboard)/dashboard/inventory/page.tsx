'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Boxes, Plus, RefreshCw, AlertTriangle, CheckCircle, ArrowUpDown, Loader2 } from 'lucide-react';

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

      {/* Materials Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700">
          Daftar Persediaan Bahan Mentah
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat data bahan baku...</div>
        ) : (
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
                {materials.map((mat) => (
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
        )}
      </div>

      {/* Modal Add Material */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tambah Bahan Baku Baru</h3>
            <form onSubmit={handleAddMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Daging Ayam, Kopi Blend, Cup 16oz"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan Dasar</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Min. Stok</label>
                  <input
                    type="number"
                    step="any"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
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
                  disabled={submittingAdd}
                  className="w-2/3 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stok Opname: {selectedMaterial.name}
              </h3>
              <p className="text-xs text-slate-500">
                Stok fisik saat ini: <strong className="text-slate-800">{selectedMaterial.currentStock} {selectedMaterial.unit}</strong>
              </p>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Penyesuaian</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as 'IN' | 'OUT')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
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
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Penyesuaian</label>
                <select
                  value={adjustRefType}
                  onChange={(e) => setAdjustRefType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMaterial(null)}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="w-2/3 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-2"
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
