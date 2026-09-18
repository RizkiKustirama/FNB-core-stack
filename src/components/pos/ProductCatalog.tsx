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
      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu jualan..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Grid Menu Catalog */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
            Memuat katalog produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-12">
            <Utensils className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
            <p className="font-semibold text-slate-600">Tidak ada menu yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
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
                  className="bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-md border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Badge Low Stock Alert */}
                  {lowStockRecipe && (
                    <div
                      className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-lg text-[9px] font-bold shadow-sm flex items-center gap-1 z-10"
                      title={`Peringatan: Stok bahan (${lowStockRecipe.rawMaterial.name}) menipis!`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Stok Bahan Menipis</span>
                    </div>
                  )}

                  <div>
                    {/* Thumbnail placeholder or uploaded image */}
                    <div className="w-full h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-slate-400 overflow-hidden relative group-hover:bg-blue-50 transition">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : prod.category.name.toLowerCase().includes('minum') ? (
                        <Coffee className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition" />
                      ) : (
                        <Utensils className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition" />
                      )}
                    </div>

                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {prod.category.name}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 mt-0.5 leading-snug">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">
                      {formatCurrency(prod.price)}
                    </span>
                    <button className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                      <Plus className="w-4 h-4" />
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
