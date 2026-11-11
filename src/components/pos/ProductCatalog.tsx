'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Minus, Check, Utensils, Coffee, AlertTriangle, Flame, X } from 'lucide-react';

interface ProductLevel {
  id: string;
  level: number;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  hasLevels?: boolean;
  levels?: ProductLevel[];
  categoryId: string;
  category: { id: string; name: string };
  recipes?: {
    rawMaterial: {
      name: string;
      currentStock: number;
      minStock: number;
      unit: string;
    };
    quantityNeeded: number;
  }[];
}

interface Category {
  id: string;
  name: string;
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Level Modal State
  const [levelSelectProduct, setLevelSelectProduct] = useState<Product | null>(null);
  const [modalLevelQtys, setModalLevelQtys] = useState<Record<string, number>>({});

  const { items, addItem, updateQty, setItemQty } = useCartStore();

  const handleOpenLevelModal = (prod: Product) => {
    // Initialize quantities from current cart
    const initialQtys: Record<string, number> = {};
    prod.levels?.forEach((lvl) => {
      const cartItem = items.find((ci) => ci.cartItemId === `${prod.id}_${lvl.id}`);
      initialQtys[lvl.id] = cartItem ? cartItem.qty : 0;
    });
    setModalLevelQtys(initialQtys);
    setLevelSelectProduct(prod);
  };

  const handleSaveLevelModal = () => {
    if (!levelSelectProduct || !levelSelectProduct.levels) return;

    // Sync all level quantities to cart
    levelSelectProduct.levels.forEach((lvl) => {
      const qty = modalLevelQtys[lvl.id] || 0;
      setItemQty(
        {
          id: levelSelectProduct.id,
          name: levelSelectProduct.name,
          price: lvl.price,
          imageUrl: levelSelectProduct.imageUrl,
          productLevelId: lvl.id,
          levelName: lvl.name,
        },
        qty
      );
    });

    setLevelSelectProduct(null);
  };

  const handleProductCardClick = (prod: Product) => {
    if (prod.hasLevels && prod.levels && prod.levels.length > 0) {
      handleOpenLevelModal(prod);
    } else {
      addItem({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        imageUrl: prod.imageUrl,
      });
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/v1/products?activeOnly=true'),
          fetch('/api/v1/categories'),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.data);
        if (catData.success) setCategories(catData.data);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'ALL' || prod.categoryId === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate modal total items and price
  const modalTotalQty = Object.values(modalLevelQtys).reduce((sum, q) => sum + q, 0);
  const modalTotalAmount = levelSelectProduct?.levels?.reduce((sum, lvl) => {
    const qty = modalLevelQtys[lvl.id] || 0;
    return sum + qty * lvl.price;
  }, 0) || 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top Section Header & Filter Controls */}
      <div className="p-4 lg:p-6 pb-2 shrink-0 space-y-4 bg-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Menu</h1>
            <p className="text-xs text-slate-500 font-medium">
              Pilih item menu untuk ditambahkan ke pesanan
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari item menu..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Menu Catalog */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
            Memuat katalog menu...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-12">
            <Utensils className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
            <p className="font-bold text-slate-700">Tidak ada menu yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((prod) => {
              // Check if any recipe item is low in stock
              const lowStockRecipe = prod.recipes?.find(
                (r) => r.rawMaterial.currentStock <= r.rawMaterial.minStock
              );

              const hasLevels = Boolean(prod.hasLevels && prod.levels && prod.levels.length > 0);
              const minPrice = hasLevels
                ? Math.min(...prod.levels!.map((l) => l.price))
                : prod.price;

              // Items of this product in cart
              const cartItemsForProduct = items.filter((ci) => ci.productId === prod.id);
              const totalQtyInCart = cartItemsForProduct.reduce((sum, ci) => sum + ci.qty, 0);

              return (
                <div
                  key={prod.id}
                  onClick={() => handleProductCardClick(prod)}
                  className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    totalQtyInCart > 0
                      ? 'border-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200/80 hover:border-blue-300'
                  }`}
                >
                  {/* Image Container */}
                  <div className="h-36 sm:h-40 w-full rounded-xl bg-slate-100 overflow-hidden relative mb-2.5 flex items-center justify-center border border-slate-100">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                      />
                    ) : prod.category.name.toLowerCase().includes('minum') ? (
                      <Coffee className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 group-hover:text-blue-500 transition" />
                    ) : (
                      <Utensils className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 group-hover:text-blue-500 transition" />
                    )}

                    {/* Prominent Cart Badge if in Cart */}
                    {totalQtyInCart > 0 ? (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 font-black text-[11px] z-10 animate-in fade-in zoom-in-90">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{totalQtyInCart}</span>
                      </div>
                    ) : hasLevels ? (
                      /* Compact Level Badge on Photo */
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-md border border-white/10 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-white text-[10px]">
                          {prod.levels?.length} Level
                        </span>
                      </div>
                    ) : (
                      /* Regular Price Badge */
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-md border border-white/10">
                        <span className="font-bold text-white text-[11px]">
                          {formatCurrency(prod.price)}
                        </span>
                      </div>
                    )}

                    {/* Low stock alert badge overlay */}
                    {lowStockRecipe && (
                      <div
                        className="absolute bottom-2 left-2 bg-amber-500/90 backdrop-blur-md text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-xs flex items-center gap-1"
                        title={`Stok bahan (${lowStockRecipe.rawMaterial.name}) menipis`}
                      >
                        <AlertTriangle className="w-3 h-3 text-white" />
                        <span>STOK NIPIS</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {prod.category.name}
                        </span>
                        {hasLevels && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            <span>Pilihan Level</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 line-clamp-2 leading-tight">
                        {prod.name}
                      </h3>
                    </div>

                    {/* Bottom Row: Price & Quick Action Stepper */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      {/* Price Label (Single line, compact) */}
                      <div className="min-w-0 flex-1">
                        {hasLevels ? (
                          <span className="text-[11px] sm:text-xs text-blue-700 font-extrabold truncate block">
                            Mulai {formatCurrency(minPrice)}
                          </span>
                        ) : (
                          <span className="text-[11px] sm:text-xs text-blue-700 font-extrabold truncate block">
                            {formatCurrency(prod.price)}
                          </span>
                        )}
                      </div>

                      {/* Action Controls */}
                      {hasLevels ? (
                        /* Level Product Button */
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLevelModal(prod);
                          }}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-xs ${
                            totalQtyInCart > 0
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 border border-amber-200'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{totalQtyInCart > 0 ? `Atur (${totalQtyInCart})` : 'Pilih'}</span>
                        </button>
                      ) : totalQtyInCart > 0 ? (
                        /* Non-Level Product Stepper on Card */
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-xs"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(
                                cartItemsForProduct[0].cartItemId,
                                cartItemsForProduct[0].qty - 1
                              )
                            }
                            className="w-6 h-6 rounded-md bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition shadow-xs active:scale-95"
                            title="Kurangi"
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="text-xs font-black text-slate-900 px-1 min-w-[18px] text-center">
                            {totalQtyInCart}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              addItem({
                                id: prod.id,
                                name: prod.name,
                                price: prod.price,
                                imageUrl: prod.imageUrl,
                              })
                            }
                            className="w-6 h-6 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition shadow-xs active:scale-95"
                            title="Tambah"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        /* Initial Add Button */
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductCardClick(prod);
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-xs"
                          title="Tambah ke Pesanan"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Stepper Level Selection Modal */}
      {levelSelectProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {levelSelectProduct.imageUrl ? (
                    <img
                      src={levelSelectProduct.imageUrl}
                      alt={levelSelectProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Pilihan Level
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight mt-0.5 line-clamp-1">
                    {levelSelectProduct.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setLevelSelectProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Level Rows List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-[11px] text-slate-500 font-medium mb-1">
                Atur jumlah porsi untuk setiap level kepedasan:
              </p>

              {levelSelectProduct.levels?.map((lvl) => {
                const qty = modalLevelQtys[lvl.id] || 0;
                return (
                  <div
                    key={lvl.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      qty > 0
                        ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          qty > 0
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {lvl.level}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                          {lvl.name}
                        </div>
                        <div className="text-xs font-black text-blue-700 mt-0.5">
                          {formatCurrency(lvl.price)}
                        </div>
                      </div>
                    </div>

                    {/* Stepper for this Level */}
                    <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-slate-200 shadow-xs shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setModalLevelQtys((prev) => ({
                            ...prev,
                            [lvl.id]: Math.max(0, (prev[lvl.id] || 0) - 1),
                          }))
                        }
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <span className="text-xs font-black text-slate-900 min-w-[20px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setModalLevelQtys((prev) => ({
                            ...prev,
                            [lvl.id]: (prev[lvl.id] || 0) + 1,
                          }))
                        }
                        className="w-7 h-7 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Dipilih
                </span>
                <span className="text-sm font-black text-slate-900">
                  {modalTotalQty} Porsi{' '}
                  <span className="text-blue-600 font-bold">
                    ({formatCurrency(modalTotalAmount)})
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLevelSelectProduct(null)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveLevelModal}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
                >
                  Simpan ke Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
