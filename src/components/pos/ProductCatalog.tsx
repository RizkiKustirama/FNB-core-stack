'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Utensils, Coffee, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
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

  const addItem = useCartStore((state) => state.addItem);

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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top Section Header & Filter Controls */}
      <div className="p-4 lg:p-6 pb-2 shrink-0 space-y-4 bg-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Menu
            </h1>
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

              return (
                <div
                  key={prod.id}
                  onClick={() =>
                    addItem({
                      id: prod.id,
                      name: prod.name,
                      price: prod.price,
                      imageUrl: prod.imageUrl,
                    })
                  }
                  className="bg-white rounded-2xl p-4 shadow-xs hover:shadow-md border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Image & Floating Price Badge */}
                  <div className="h-40 sm:h-44 w-full rounded-xl bg-slate-100 overflow-hidden relative mb-3 flex items-center justify-center border border-slate-100">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                      />
                    ) : prod.category.name.toLowerCase().includes('minum') ? (
                      <Coffee className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition" />
                    ) : (
                      <Utensils className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition" />
                    )}

                    {/* Floating Price Badge in top-right corner */}
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-white/10">
                      <span className="font-bold text-white text-xs">
                        {formatCurrency(prod.price)}
                      </span>
                    </div>

                    {/* Low stock alert badge overlay */}
                    {lowStockRecipe && (
                      <div
                        className="absolute bottom-2.5 left-2.5 bg-amber-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[9px] font-bold shadow-xs flex items-center gap-1"
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
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {prod.category.name}
                      </span>
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-snug">
                        {prod.name}
                      </h3>
                    </div>

                    {/* Bottom Row: Add Button (+) */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-bold">
                        {formatCurrency(prod.price)}
                      </span>
                      <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
