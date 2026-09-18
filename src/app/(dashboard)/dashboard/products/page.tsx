'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  UtensilsCrossed,
  RefreshCw,
  ChefHat,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Coffee,
  Utensils,
  Search,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
}

interface RecipeItemInput {
  rawMaterialId: string;
  quantityNeeded: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId: string;
  category: { id: string; name: string };
  recipes: {
    id: string;
    rawMaterialId: string;
    quantityNeeded: number;
    rawMaterial: { id: string; name: string; unit: string };
  }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [selectedProductView, setSelectedProductView] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isActive: true,
  });
  const [recipeInputs, setRecipeInputs] = useState<RecipeItemInput[]>([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Category quick-add state
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, rawRes] = await Promise.all([
        fetch('/api/v1/products'),
        fetch('/api/v1/categories'),
        fetch('/api/v1/raw-materials'),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const rawData = await rawRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
      if (rawData.success) setRawMaterials(rawData.data);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      isActive: true,
    });
    setRecipeInputs([]);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      price: String(prod.price),
      categoryId: prod.categoryId,
      imageUrl: prod.imageUrl || '',
      isActive: prod.isActive,
    });
    setRecipeInputs(
      prod.recipes.map((r) => ({
        rawMaterialId: r.rawMaterialId,
        quantityNeeded: r.quantityNeeded,
      }))
    );
    setFormError('');
    setIsFormOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setFormError('');
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengunggah gambar');
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err: any) {
      setFormError(err.message || 'Error saat upload gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.data]);
        setFormData((prev) => ({ ...prev, categoryId: data.data.id }));
        setNewCategoryName('');
        setShowAddCategory(false);
      }
    } catch (err) {
      console.error('Gagal tambah kategori:', err);
    }
  };

  // Add/Remove Recipe Row
  const addRecipeRow = () => {
    if (rawMaterials.length === 0) return;
    setRecipeInputs((prev) => [
      ...prev,
      { rawMaterialId: rawMaterials[0].id, quantityNeeded: 1 },
    ]);
  };

  const removeRecipeRow = (index: number) => {
    setRecipeInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRecipeRow = (index: number, field: keyof RecipeItemInput, value: any) => {
    setRecipeInputs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Nama menu wajib diisi');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setFormError('Harga jual harus lebih dari 0');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Pilih kategori menu');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || null,
        isActive: formData.isActive,
        recipes: recipeInputs.map((r) => ({
          rawMaterialId: r.rawMaterialId,
          quantityNeeded: Number(r.quantityNeeded),
        })),
      };

      const url = editingProduct ? `/api/v1/products/${editingProduct.id}` : '/api/v1/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan menu');
      }

      setIsFormOpen(false);
      fetchAllData();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${name}"?`)) return;

    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      } else {
        alert(data.message || 'Gagal menghapus menu');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fff8ef] p-6 rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e1b13] flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-[#b22222]" />
            Katalog Menu & Resep BoM
          </h1>
          <p className="text-xs text-[#5a403e] mt-1 font-medium">
            Kelola data menu jualan, upload gambar display POS, dan racikan resep bahan baku (Bill of Materials).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchAllData}
            className="p-3 bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] rounded-2xl border border-[#e2beba]/30 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-3 bg-[#b22222] hover:bg-[#8f000d] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#b22222]/20 flex items-center gap-2 transition active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fff8ef] p-4 rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${
              selectedCategory === 'ALL'
                ? 'bg-[#b22222] text-white shadow-sm'
                : 'bg-[#f5edde] text-[#1e1b13] hover:bg-[#efe7d9] border border-[#e2beba]/30'
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-[#b22222] text-white shadow-sm'
                  : 'bg-[#f5edde] text-[#1e1b13] hover:bg-[#efe7d9] border border-[#e2beba]/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#5a403e] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama menu..."
            className="w-full pl-10 pr-4 py-2 bg-[#f5edde] border border-[#e2beba]/40 rounded-full text-xs text-[#1e1b13] placeholder-[#5a403e]/60 focus:outline-none focus:ring-2 focus:ring-[#b22222] transition"
          />
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-[#fff8ef] rounded-3xl border border-[#e2beba]/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-[#e2beba]/30 font-extrabold text-sm text-[#1e1b13] flex items-center justify-between">
          <span>Daftar Menu Jualan & Racikan Resep</span>
          <span className="text-xs text-[#5a403e] font-semibold">
            {filteredProducts.length} item ditampilkan
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#5a403e] font-semibold">
            <Loader2 className="w-6 h-6 animate-spin text-[#b22222] mx-auto mb-2" />
            Memuat data produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5a403e]">
            <UtensilsCrossed className="w-12 h-12 text-[#e2beba] mx-auto mb-2 stroke-1" />
            <p className="font-bold text-[#1e1b13]">Belum ada data menu jualan.</p>
            <p className="text-[11px] text-[#5a403e] mt-1">
              Klik tombol &quot;Tambah Menu Baru&quot; di atas untuk mulai memasukkan menu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1e1b13]">
              <thead className="bg-[#f5edde] text-[#5a403e] font-extrabold uppercase tracking-wider text-[10px] border-b border-[#e2beba]/30">
                <tr>
                  <th className="p-4 pl-6">Foto & Menu</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4">Racikan Resep (BoM)</th>
                  <th className="p-4">Status POS</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2beba]/20">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#f5edde]/50 transition">
                    <td className="p-4 pl-6 font-bold text-[#1e1b13]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#f5edde] border border-[#e2beba]/40 overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Utensils className="w-5 h-5 text-[#8e706d]" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-[#1e1b13]">{prod.name}</div>
                          <div className="text-[10px] text-[#5a403e] font-medium">
                            ID: {prod.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[#5a403e]">
                      <span className="bg-[#f5edde] border border-[#e2beba]/30 text-[#1e1b13] px-2.5 py-1 rounded-xl text-[11px] font-bold">
                        {prod.category.name}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-[#b22222] text-sm">
                      {formatCurrency(prod.price)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedProductView(prod)}
                        className="bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] border border-[#e2beba]/30 font-bold px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1.5 transition"
                      >
                        <ChefHat className="w-3.5 h-3.5 text-[#b22222]" />
                        <span>{prod.recipes?.length || 0} Bahan Baku</span>
                      </button>
                    </td>
                    <td className="p-4">
                      {prod.isActive ? (
                        <span className="bg-[#b22222]/10 text-[#b22222] border border-[#b22222]/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Aktif
                        </span>
                      ) : (
                        <span className="bg-[#f5edde] text-[#5a403e] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-2 bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] rounded-xl border border-[#e2beba]/30 transition"
                          title="Edit Menu"
                        >
                          <Pencil className="w-4 h-4 text-[#5a403e]" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-2 bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[#ba1a1a] rounded-xl border border-[#ba1a1a]/20 transition"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail BoM Recipe View */}
      {selectedProductView && (
        <div className="fixed inset-0 z-50 bg-[#1e1b13]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fff8ef] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-[#e2beba]/30">
            <div className="flex items-start justify-between border-b border-[#e2beba]/30 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#b22222] uppercase tracking-wider">
                  BILL OF MATERIALS (BOM)
                </span>
                <h3 className="text-lg font-extrabold text-[#1e1b13]">{selectedProductView.name}</h3>
                <p className="text-xs text-[#5a403e] font-semibold mt-0.5">
                  Harga Jual: {formatCurrency(selectedProductView.price)}
                </p>
              </div>
              <button
                onClick={() => setSelectedProductView(null)}
                className="p-2 text-[#5a403e] hover:text-[#1e1b13] rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-[#1e1b13]">Komponen Bahan Baku Per Porsi:</span>
              <div className="bg-[#f5edde] rounded-2xl p-4 border border-[#e2beba]/30 space-y-2.5">
                {selectedProductView.recipes && selectedProductView.recipes.length > 0 ? (
                  selectedProductView.recipes.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs font-bold text-[#1e1b13] bg-[#fff8ef] p-2.5 rounded-xl border border-[#e2beba]/30 shadow-sm"
                    >
                      <span>{item.rawMaterial.name}</span>
                      <span className="bg-[#b22222]/10 text-[#b22222] px-2.5 py-1 rounded-lg text-xs font-extrabold">
                        {item.quantityNeeded} {item.rawMaterial.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#5a403e] text-center py-3">
                    Belum ada racikan bahan baku terhubung.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedProductView(null)}
              className="w-full py-3 bg-[#b22222] hover:bg-[#8f000d] text-white font-bold text-xs rounded-2xl transition shadow-md shadow-[#b22222]/20"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Form Create / Edit Product */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-[#1e1b13]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fff8ef] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-[#e2beba]/30 my-8">
            <div className="flex items-center justify-between border-b border-[#e2beba]/30 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#1e1b13]">
                  {editingProduct ? 'Edit Menu Jualan' : 'Tambah Menu Jualan Baru'}
                </h3>
                <p className="text-xs text-[#5a403e] font-medium">
                  Isi informasi menu, foto display POS, dan takaran resep bahan baku (BoM).
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-[#5a403e] hover:text-[#1e1b13] rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1e1b13] mb-1">
                    Nama Menu <span className="text-[#b22222]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Misal: Cwie Mie Special Mbahkakung"
                    className="w-full px-4 py-2.5 bg-[#f5edde] border border-[#e2beba]/40 rounded-2xl text-xs font-bold text-[#1e1b13] focus:outline-none focus:ring-2 focus:ring-[#b22222]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e1b13] mb-1">
                    Harga Jual (Rp) <span className="text-[#b22222]">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="25000"
                    className="w-full px-4 py-2.5 bg-[#f5edde] border border-[#e2beba]/40 rounded-2xl text-xs font-bold text-[#1e1b13] focus:outline-none focus:ring-2 focus:ring-[#b22222]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e1b13] mb-1">
                    Kategori Menu <span className="text-[#b22222]">*</span>
                  </label>
                  {!showAddCategory ? (
                    <div className="flex gap-2">
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="flex-1 px-4 py-2.5 bg-[#f5edde] border border-[#e2beba]/40 rounded-2xl text-xs font-bold text-[#1e1b13] focus:outline-none focus:ring-2 focus:ring-[#b22222]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(true)}
                        className="px-3 py-2 bg-[#f5edde] hover:bg-[#efe7d9] text-[#b22222] font-bold text-xs rounded-2xl border border-[#e2beba]/40"
                        title="Tambah Kategori Baru"
                      >
                        + Kategori
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nama Kategori Baru"
                        className="flex-1 px-3 py-2 bg-[#f5edde] border border-[#e2beba]/40 rounded-2xl text-xs font-bold text-[#1e1b13]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-[#b22222] text-white font-bold text-xs rounded-2xl"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-2 py-2 text-[#5a403e]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Image Upload Setup */}
              <div className="space-y-2 pt-2 border-t border-[#e2beba]/30">
                <label className="block text-xs font-bold text-[#1e1b13]">
                  Gambar / Foto Display Menu (POS)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#f5edde] border border-[#e2beba]/40 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#8e706d]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2.5 bg-[#f5edde] hover:bg-[#efe7d9] text-[#1e1b13] font-bold text-xs rounded-2xl border border-[#e2beba]/40 cursor-pointer flex items-center gap-2 transition">
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#b22222]" />
                        ) : (
                          <Upload className="w-4 h-4 text-[#b22222]" />
                        )}
                        <span>{uploadingImage ? 'Uploading...' : 'Upload File Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>

                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="text-xs text-[#ba1a1a] font-bold hover:underline"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Atau masukan URL gambar (misal: https://...)"
                      className="w-full px-3 py-1.5 bg-[#f5edde] border border-[#e2beba]/40 rounded-xl text-[11px] text-[#1e1b13]"
                    />
                  </div>
                </div>
              </div>

              {/* Status Active Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#b22222] rounded"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-[#1e1b13] cursor-pointer">
                  Tampilkan menu ini secara aktif di aplikasi Kasir (POS)
                </label>
              </div>

              {/* BoM Recipe Items Setup */}
              <div className="space-y-3 pt-3 border-t border-[#e2beba]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1e1b13]">Racikan Resep (BoM)</h4>
                    <p className="text-[10px] text-[#5a403e]">
                      Stok bahan baku akan berkurang otomatis saat menu ini dipesan di POS.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addRecipeRow}
                    className="px-3 py-1.5 bg-[#f5edde] hover:bg-[#efe7d9] text-[#b22222] font-bold text-xs rounded-xl border border-[#e2beba]/40 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bahan Baku</span>
                  </button>
                </div>

                <div className="bg-[#f5edde] rounded-2xl p-3 border border-[#e2beba]/30 space-y-2">
                  {recipeInputs.length === 0 ? (
                    <p className="text-xs text-[#5a403e] text-center py-2">
                      Belum ada racikan bahan. Klik &quot;+ Bahan Baku&quot; di atas untuk memasukkan komposisi resep.
                    </p>
                  ) : (
                    recipeInputs.map((row, idx) => {
                      const selectedMaterial = rawMaterials.find((m) => m.id === row.rawMaterialId);
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-[#fff8ef] p-2 rounded-xl border border-[#e2beba]/30">
                          <select
                            value={row.rawMaterialId}
                            onChange={(e) => updateRecipeRow(idx, 'rawMaterialId', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#f5edde] border border-[#e2beba]/40 rounded-xl text-xs font-bold text-[#1e1b13]"
                          >
                            {rawMaterials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.unit})
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={row.quantityNeeded}
                              onChange={(e) =>
                                updateRecipeRow(idx, 'quantityNeeded', parseFloat(e.target.value) || 0)
                              }
                              placeholder="Takaran"
                              className="w-20 px-2.5 py-1.5 bg-[#f5edde] border border-[#e2beba]/40 rounded-xl text-xs font-bold text-[#1e1b13] text-center"
                            />
                            <span className="text-[11px] font-bold text-[#5a403e] min-w-[36px]">
                              {selectedMaterial?.unit || ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeRecipeRow(idx)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="pt-4 border-t border-[#e2beba]/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-3 text-xs font-bold text-[#5a403e] bg-[#f5edde] border border-[#e2beba]/40 hover:bg-[#efe7d9] rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-3 bg-[#b22222] hover:bg-[#8f000d] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#b22222]/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Simpan Perubahan' : 'Buat Menu Baru'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
