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
          fetch('/api/v1/products'),
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
    <div className="flex-1 flex flex-col h-full bg-[#fbf3e4] overflow-hidden">
      {/* Filter & Search Bar */}
      <div className="p-4 bg-[#fff8ef] border-b border-[#e2beba]/30 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
        {/* Category Pills (Matching Order Terminal design) */}
        <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#b22222] text-white shadow-md shadow-[#b22222]/20'
                : 'bg-[#f5edde] text-[#1e1b13] hover:bg-[#efe7d9] border border-[#e2beba]/30'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#b22222] text-white shadow-md shadow-[#b22222]/20'
                  : 'bg-[#f5edde] text-[#1e1b13] hover:bg-[#efe7d9] border border-[#e2beba]/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input (Pill style matching design system) */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5a403e] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu items..."
            className="w-full pl-10 pr-4 py-2 bg-[#f5edde] border border-[#e2beba]/40 rounded-full text-xs text-[#1e1b13] placeholder-[#5a403e]/60 focus:outline-none focus:ring-2 focus:ring-[#b22222] transition"
          />
        </div>
      </div>

      {/* Grid Menu Catalog (Order Terminal Card Layout) */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[#5a403e] text-xs font-medium">
            Memuat katalog produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#5a403e] text-xs py-12">
            <Utensils className="w-12 h-12 text-[#e2beba] mb-2 stroke-1" />
            <p className="font-semibold text-[#1e1b13]">Tidak ada menu yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                  className="bg-[#fff8ef] rounded-3xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#e2beba]/30 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Thumbnail & Price Overlay Badge */}
                  <div className="h-44 w-full rounded-2xl bg-[#f5edde] overflow-hidden relative mb-3 flex items-center justify-center">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                      />
                    ) : prod.category.name.toLowerCase().includes('minum') ? (
                      <Coffee className="w-12 h-12 text-[#8e706d] group-hover:text-[#b22222] transition" />
                    ) : (
                      <Utensils className="w-12 h-12 text-[#8e706d] group-hover:text-[#b22222] transition" />
                    )}

                    {/* Floating Price Tag */}
                    <div className="absolute top-2.5 right-2.5 bg-[#fff8ef]/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-sm border border-[#e2beba]/40">
                      <span className="font-bold text-[#1e1b13] text-xs">
                        {formatCurrency(prod.price)}
                      </span>
                    </div>

                    {/* Low stock alert badge overlay */}
                    {lowStockRecipe && (
                      <div
                        className="absolute bottom-2.5 left-2.5 bg-[#cca72f]/90 backdrop-blur-md text-[#1e1b13] px-2 py-0.5 rounded-lg text-[9px] font-extrabold shadow-sm flex items-center gap-1"
                        title={`Stok bahan (${lowStockRecipe.rawMaterial.name}) menipis`}
                      >
                        <AlertTriangle className="w-3 h-3 text-[#735c00]" />
                        <span>STOK NIPIS</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Category Info */}
                  <div>
                    <span className="text-[10px] font-extrabold text-[#cca72f] bg-[#cca72f]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {prod.category.name}
                    </span>
                    <h3 className="text-sm font-bold text-[#1e1b13] mt-1.5 line-clamp-2 leading-tight">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Card Bottom: Add Action */}
                  <div className="mt-4 pt-3 border-t border-[#e2beba]/20 flex items-center justify-between">
                    <span className="text-xs text-[#5a403e] font-semibold">Tambah</span>
                    <button className="w-9 h-9 rounded-full bg-[#b22222]/10 text-[#b22222] flex items-center justify-center group-hover:bg-[#b22222] group-hover:text-white transition-colors shadow-sm">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
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

