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
  Utensils,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Flame,
  Sparkles,
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

interface ProductLevel {
  id?: string;
  productId?: string;
  level: number;
  name: string;
  price: number;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId: string;
  hasLevels?: boolean;
  levels?: ProductLevel[];
  category: { id: string; name: string };
  recipes: {
    id: string;
    rawMaterialId: string;
    quantityNeeded: number;
    rawMaterial: { id: string; name: string; unit: string };
  }[];
}

interface LevelRowInput {
  level: number;
  name: string;
  price: string;
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
    hasLevels: false,
  });
  const [levelInputs, setLevelInputs] = useState<LevelRowInput[]>([]);
  const [genMinLevel, setGenMinLevel] = useState<number>(0);
  const [genMaxLevel, setGenMaxLevel] = useState<number>(8);
  const [genBasePrice, setGenBasePrice] = useState<string>('12000');

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
      hasLevels: false,
    });
    setLevelInputs([]);
    setGenMinLevel(0);
    setGenMaxLevel(8);
    setGenBasePrice('12000');
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
      hasLevels: Boolean(prod.hasLevels),
    });
    if (prod.hasLevels && prod.levels && prod.levels.length > 0) {
      setLevelInputs(
        prod.levels.map((l) => ({
          level: l.level,
          name: l.name,
          price: String(l.price),
        }))
      );
    } else {
      setLevelInputs([]);
    }
    setGenMinLevel(0);
    setGenMaxLevel(8);
    setGenBasePrice(String(prod.price || '12000'));
    setRecipeInputs(
      prod.recipes.map((r) => ({
        rawMaterialId: r.rawMaterialId,
        quantityNeeded: r.quantityNeeded,
      }))
    );
    setFormError('');
    setIsFormOpen(true);
  };

  // Quick generator for levels
  const handleGenerateLevels = () => {
    const min = Math.min(genMinLevel, genMaxLevel);
    const max = Math.max(genMinLevel, genMaxLevel);
    const newLevels: LevelRowInput[] = [];
    const defaultP = genBasePrice || formData.price || '12000';
    for (let i = min; i <= max; i++) {
      newLevels.push({
        level: i,
        name: i === 0 ? 'Level 0 (Original)' : `Level ${i}`,
        price: defaultP,
      });
    }
    setLevelInputs(newLevels);
  };

  const addSingleLevel = () => {
    const nextLevel =
      levelInputs.length > 0 ? Math.max(...levelInputs.map((l) => l.level)) + 1 : 1;
    setLevelInputs((prev) => [
      ...prev,
      {
        level: nextLevel,
        name: `Level ${nextLevel}`,
        price: genBasePrice || formData.price || '0',
      },
    ]);
  };

  const removeLevelRow = (index: number) => {
    setLevelInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLevelRow = (index: number, field: keyof LevelRowInput, value: any) => {
    setLevelInputs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
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
    if (!formData.categoryId) {
      setFormError('Pilih kategori menu');
      return;
    }

    if (formData.hasLevels) {
      if (levelInputs.length === 0) {
        setFormError('Sistem level aktif: Harap tambahkan minimal 1 varian level.');
        return;
      }
      for (const lvl of levelInputs) {
        const p = parseFloat(lvl.price);
        if (isNaN(p) || p <= 0) {
          setFormError(`Harga untuk ${lvl.name || `Level ${lvl.level}`} harus lebih dari 0`);
          return;
        }
      }
    } else {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setFormError('Harga jual harus lebih dari 0');
        return;
      }
    }

    try {
      setFormSubmitting(true);
      const basePrice = formData.hasLevels
        ? Math.min(...levelInputs.map((l) => parseFloat(l.price) || 0))
        : parseFloat(formData.price);

      const payload = {
        name: formData.name.trim(),
        price: basePrice,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || null,
        isActive: formData.isActive,
        hasLevels: formData.hasLevels,
        levels: formData.hasLevels
          ? levelInputs.map((l, idx) => ({
              level: Number(l.level),
              name: l.name.trim() || `Level ${l.level}`,
              price: parseFloat(l.price) || 0,
              sortOrder: idx,
            }))
          : [],
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
        if (data.data?.softDeleted) {
          alert(data.message);
        }
        fetchAllData();
      } else {
        alert(data.message || 'Gagal menghapus menu');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortName, setSortName] = useState<string>('ALL');
  const [sortPrice, setSortPrice] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, statusFilter, sortName, sortPrice]);

  // Filter & Sort products
  const filteredProducts = products
    .filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && p.isActive) ||
        (statusFilter === 'INACTIVE' && !p.isActive);
      return matchesCat && matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortName === 'ASC') return a.name.localeCompare(b.name);
      if (sortName === 'DESC') return b.name.localeCompare(a.name);
      if (sortPrice === 'ASC') return a.price - b.price;
      if (sortPrice === 'DESC') return b.price - a.price;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-blue-600" />
            Katalog Menu & Resep Bill of Materials (BoM)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data menu jualan, upload foto display POS, dan racikan resep bahan baku mentah per porsi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchAllData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Dropdown Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Dropdown Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Non-Aktif</option>
          </select>

          {/* Dropdown Urut Nama */}
          <select
            value={sortName}
            onChange={(e) => {
              setSortName(e.target.value);
              if (e.target.value !== 'ALL') setSortPrice('ALL');
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Nama</option>
            <option value="ASC">A - Z</option>
            <option value="DESC">Z - A</option>
          </select>

          {/* Dropdown Urut Harga */}
          <select
            value={sortPrice}
            onChange={(e) => {
              setSortPrice(e.target.value);
              if (e.target.value !== 'ALL') setSortName('ALL');
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Harga</option>
            <option value="ASC">Terendah</option>
            <option value="DESC">Tertinggi</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama menu..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition"
          />
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Daftar Menu Jualan & Racikan Resep</span>
          <span className="text-slate-400 font-normal">
            Total {filteredProducts.length} menu (Limit 10 per halaman)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Memuat data produk...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="font-bold text-slate-700">Belum ada data menu jualan.</p>
            <p className="text-slate-400 mt-1">
              Klik tombol &quot;Tambah Menu Baru&quot; di atas untuk mulai memasukkan menu.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">Foto & Menu</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Harga Jual</th>
                    <th className="p-3.5">Racikan Resep (BoM)</th>
                    <th className="p-3.5">Status POS</th>
                    <th className="p-3.5 pr-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-5 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Utensils className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{prod.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              ID: {prod.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                          {prod.category.name}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {prod.hasLevels && prod.levels && prod.levels.length > 0 ? (
                          <div className="space-y-1">
                            <div className="font-bold text-blue-600">
                              {(() => {
                                const prices = prod.levels.map((l) => l.price);
                                const minP = Math.min(...prices);
                                const maxP = Math.max(...prices);
                                return minP === maxP
                                  ? formatCurrency(minP)
                                  : `${formatCurrency(minP)} - ${formatCurrency(maxP)}`;
                              })()}
                            </div>
                            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              <Flame className="w-3 h-3 text-amber-500" />
                              <span>
                                {prod.levels.length} Level (Lvl{' '}
                                {Math.min(...prod.levels.map((l) => l.level))} -{' '}
                                {Math.max(...prod.levels.map((l) => l.level))})
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="font-bold text-blue-600">
                            {formatCurrency(prod.price)}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedProductView(prod)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1 transition"
                        >
                          <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                          <span>{prod.recipes?.length || 0} Bahan Baku</span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        {prod.isActive ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Non-Aktif
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                            title="Edit Menu"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                            title="Hapus Menu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-800">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                </strong>{' '}
                dari <strong className="text-slate-800">{filteredProducts.length}</strong> menu
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

      {/* Modal Detail BoM Recipe View */}
      {selectedProductView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Bill of Materials (BoM)
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedProductView.name}</h3>
                <p className="text-xs text-slate-500">
                  Harga Jual: {formatCurrency(selectedProductView.price)}
                </p>
              </div>
              <button
                onClick={() => setSelectedProductView(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProductView.hasLevels && selectedProductView.levels && selectedProductView.levels.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Daftar Level & Harga Jual:
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedProductView.levels.map((lvl) => (
                    <div
                      key={lvl.level}
                      className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                    >
                      <span className="font-bold text-slate-800">{lvl.name}</span>
                      <span className="text-blue-600 font-bold">{formatCurrency(lvl.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Komponen Bahan Baku Per Porsi:</span>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                {selectedProductView.recipes && selectedProductView.recipes.length > 0 ? (
                  selectedProductView.recipes.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/80 shadow-sm"
                    >
                      <span>{item.rawMaterial.name}</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold">
                        {item.quantityNeeded} {item.rawMaterial.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Belum ada racikan bahan baku terhubung.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedProductView(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Form Create / Edit Product */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Edit Menu Jualan' : 'Tambah Menu Jualan Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Isi informasi menu, foto display POS, dan takaran resep bahan baku (BoM).
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Menu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Misal: Cwie Mie Special Mbahkakung"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>

                {/* Kategori Menu */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Menu <span className="text-rose-500">*</span>
                  </label>
                  {!showAddCategory ? (
                    <div className="flex gap-2">
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold text-xs rounded-xl border border-slate-200 transition"
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
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-2 py-2 text-slate-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Level System Switch Toggle Card */}
                <div className="sm:col-span-2 bg-gradient-to-r from-amber-50/70 to-orange-50/40 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Sistem Level Kepedasan / Varian Level
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Aktifkan bila menu memiliki pilihan level dengan variasi harga independen (misal: Level 0 - 8).
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasLevels}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => ({ ...prev, hasLevels: checked }));
                          if (checked && levelInputs.length === 0) {
                            const min = 0;
                            const max = 8;
                            const initial: LevelRowInput[] = [];
                            const defaultP = formData.price || '12000';
                            for (let i = min; i <= max; i++) {
                              initial.push({
                                level: i,
                                name: i === 0 ? 'Level 0 (Original)' : `Level ${i}`,
                                price: defaultP,
                              });
                            }
                            setLevelInputs(initial);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>

                {/* If Level Toggle is OFF: Standard Single Price */}
                {!formData.hasLevels ? (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Harga Jual (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="25000"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      required={!formData.hasLevels}
                    />
                  </div>
                ) : (
                  /* If Level Toggle is ON: Level Configuration & Independent Pricing */
                  <div className="sm:col-span-2 space-y-3 pt-1">
                    {/* Quick Generator Bar */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                        <div>
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Quick Level Generator
                          </span>
                          <p className="text-[10px] text-amber-700">
                            Generate baris level otomatis lalu sesuaikan harga masing-masing di bawah.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateLevels}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1 self-start sm:self-auto"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Generate Baris</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Dari Level</label>
                          <input
                            type="number"
                            value={genMinLevel}
                            onChange={(e) => setGenMinLevel(parseInt(e.target.value) || 0)}
                            className="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Sampai Level</label>
                          <input
                            type="number"
                            value={genMaxLevel}
                            onChange={(e) => setGenMaxLevel(parseInt(e.target.value) || 0)}
                            className="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Harga Dasar (Rp)</label>
                          <input
                            type="number"
                            value={genBasePrice}
                            onChange={(e) => setGenBasePrice(e.target.value)}
                            placeholder="12000"
                            className="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Table of Level Rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          Daftar Level & Harga Jual Independen ({levelInputs.length} Level)
                        </label>
                        <button
                          type="button"
                          onClick={addSingleLevel}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah 1 Baris</span>
                        </button>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {levelInputs.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Belum ada baris level. Klik &quot;Generate Baris&quot; di atas atau &quot;Tambah 1 Baris&quot;.
                          </div>
                        ) : (
                          levelInputs.map((row, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 hover:border-amber-300 transition"
                            >
                              <div className="w-16">
                                <span className="block text-[9px] font-bold text-slate-400">Level</span>
                                <input
                                  type="number"
                                  value={row.level}
                                  onChange={(e) => updateLevelRow(idx, 'level', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                                />
                              </div>
                              <div className="flex-1">
                                <span className="block text-[9px] font-bold text-slate-400">Label Tampilan POS</span>
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => updateLevelRow(idx, 'name', e.target.value)}
                                  placeholder="Misal: Level 1"
                                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                                />
                              </div>
                              <div className="w-28 sm:w-32">
                                <span className="block text-[9px] font-bold text-slate-400">Harga (Rp)</span>
                                <input
                                  type="number"
                                  value={row.price}
                                  onChange={(e) => updateLevelRow(idx, 'price', e.target.value)}
                                  placeholder="12000"
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 text-right"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLevelRow(idx)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition mt-3"
                                title="Hapus Level"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Image Upload Setup */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Gambar / Foto Display Menu (POS)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 cursor-pointer flex items-center gap-1.5 transition">
                        {uploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Foto'}</span>
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
                          className="text-[11px] text-rose-600 font-semibold hover:underline"
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
                      className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800"
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
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Tampilkan menu ini secara aktif di aplikasi Kasir (POS)
                </label>
              </div>

              {/* BoM Recipe Items Setup */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Racikan Resep (BoM)</h4>
                    <p className="text-[10px] text-slate-400">
                      Stok bahan baku akan berkurang otomatis saat menu ini dipesan di POS.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addRecipeRow}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold text-xs rounded-lg border border-slate-200 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bahan Baku</span>
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                  {recipeInputs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">
                      Belum ada racikan bahan. Klik &quot;+ Bahan Baku&quot; di atas untuk memasukkan komposisi resep.
                    </p>
                  ) : (
                    recipeInputs.map((row, idx) => {
                      const selectedMaterial = rawMaterials.find((m) => m.id === row.rawMaterialId);
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                          <select
                            value={row.rawMaterialId}
                            onChange={(e) => updateRecipeRow(idx, 'rawMaterialId', e.target.value)}
                            className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
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
                              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center"
                            />
                            <span className="text-[11px] font-semibold text-slate-500 min-w-[36px]">
                              {selectedMaterial?.unit || ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeRecipeRow(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
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
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
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
