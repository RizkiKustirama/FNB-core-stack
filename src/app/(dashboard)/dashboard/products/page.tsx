'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { UtensilsCrossed, RefreshCw, ChefHat } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  category: { name: string };
  recipes: {
    id: string;
    quantityNeeded: number;
    rawMaterial: { name: string; unit: string };
  }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-blue-600" />
            Katalog Menu & Resep Bill of Materials (BoM)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data menu jualan dan hubungan takaran resep racikan bahan baku mentah per porsi.
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700">
          Daftar Menu Jualan & Racikan Resep
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat data produk...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Nama Menu</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Harga Jual</th>
                  <th className="p-3.5">Racikan Resep (BoM)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Detail Resep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 pl-5 font-bold text-slate-900">{prod.name}</td>
                    <td className="p-3.5 text-slate-500">{prod.category.name}</td>
                    <td className="p-3.5 font-bold text-blue-600">
                      {formatCurrency(prod.price)}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {prod.recipes?.length || 0} Komponen Bahan
                      </span>
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
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Lihat Resep</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Recipe Detail */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Bill of Materials (BoM)
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-500">
                  Harga Jual: {formatCurrency(selectedProduct.price)}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">Komponen Bahan Baku Per Porsi:</span>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                {selectedProduct.recipes && selectedProduct.recipes.length > 0 ? (
                  selectedProduct.recipes.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs font-semibold text-slate-800"
                    >
                      <span>{item.rawMaterial.name}</span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-blue-700 font-bold">
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
              onClick={() => setSelectedProduct(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
