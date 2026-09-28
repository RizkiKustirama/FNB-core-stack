'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  Receipt,
  Eye,
  Printer,
  X,
  Loader2,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

interface OrderItem {
  id: string;
  qty: number;
  price: number;
  subtotal: number;
  note?: string | null;
  product?: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  cashReceived?: number | null;
  changeAmount?: number | null;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  cashier?: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
}

interface OrderSummary {
  totalOrders: number;
  totalSales: number;
  cashCount: number;
  qrisCount: number;
  transferCount: number;
  averageOrderValue: number;
}

export default function OrdersRecapPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalSales: 0,
    cashCount: 0,
    qrisCount: 0,
    transferCount: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Pagination
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('DATE_DESC');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Selected Order for Detail Modal & Thermal Receipt Reprint
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, paymentFilter, statusFilter, sortOption, searchQuery]);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);

      // Helper for local YYYY-MM-DD date string
      const toLocalDateStr = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      let startDateStr: string | undefined;
      let endDateStr: string | undefined;

      const now = new Date();
      if (dateFilter === 'TODAY') {
        startDateStr = toLocalDateStr(now);
        endDateStr = toLocalDateStr(now);
      } else if (dateFilter === 'WEEK') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        startDateStr = toLocalDateStr(weekAgo);
        endDateStr = toLocalDateStr(now);
      } else if (dateFilter === 'MONTH') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        startDateStr = toLocalDateStr(monthAgo);
        endDateStr = toLocalDateStr(now);
      }

      const params = new URLSearchParams();
      if (startDateStr) params.set('startDate', startDateStr);
      if (endDateStr) params.set('endDate', endDateStr);
      if (paymentFilter !== 'ALL') params.set('paymentMethod', paymentFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/v1/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setOrders(data.data.orders || []);
        setSummary(
          data.data.summary || {
            totalOrders: 0,
            totalSales: 0,
            cashCount: 0,
            qrisCount: 0,
            transferCount: 0,
            averageOrderValue: 0,
          }
        );
      }
    } catch (err) {
      console.error('Gagal memuat rekap pesanan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [dateFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrdersData();
  };

  // Filter & Sort Orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === 'DATE_DESC') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOption === 'DATE_ASC') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOption === 'TOTAL_DESC') return b.totalAmount - a.totalAmount;
      if (sortOption === 'TOTAL_ASC') return a.totalAmount - b.totalAmount;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            Rekap & Riwayat Pesanan Kasir
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau transaksi penjualan masuk, ringkasan pembayaran, dan cetak ulang struk konsumen.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchOrdersData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Omzet Masuk
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {formatCurrency(summary.totalSales)}
            </div>
          </div>
        </div>

        {/* Card 2: Total Pesanan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Pesanan (Order)
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {summary.totalOrders} <span className="text-xs font-normal text-slate-500">Transaksi</span>
            </div>
          </div>
        </div>

        {/* Card 3: Rata-Rata Per Order */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Rata-Rata Order (AOV)
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {formatCurrency(summary.averageOrderValue)}
            </div>
          </div>
        </div>

        {/* Card 4: Metode Bayar Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Distribusi Pembayaran
          </span>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              Tunai
            </span>
            <span className="font-bold text-slate-900">{summary.cashCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              QRIS
            </span>
            <span className="font-bold text-slate-900">{summary.qrisCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Transfer
            </span>
            <span className="font-bold text-slate-900">{summary.transferCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-3">
        {/* Quick Date Range Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Waktu:
          </span>
          {[
            { id: 'TODAY', label: 'Hari Ini' },
            { id: 'WEEK', label: '7 Hari Terakhir' },
            { id: 'MONTH', label: '30 Hari Terakhir' },
            { id: 'ALL', label: 'Semua Waktu' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                dateFilter === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Payment, Status & Search Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Pembayaran</option>
            <option value="CASH">Tunai (Cash)</option>
            <option value="QRIS">QRIS</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="PAID">Status: Lunas</option>
            <option value="CANCELLED">Status: Dibatalkan</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DATE_DESC">Waktu: Terbaru</option>
            <option value="DATE_ASC">Waktu: Terlama</option>
            <option value="TOTAL_DESC">Total: Terbesar</option>
            <option value="TOTAL_ASC">Total: Terkecil</option>
          </select>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="No. Struk / Kasir..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </form>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Daftar Transaksi Pesanan</span>
          <span className="text-slate-400 font-normal">
            Total {filteredOrders.length} transaksi (Limit 10 per halaman)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Memuat data rekap pesanan...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="font-bold text-slate-700">Tidak ada riwayat pesanan ditemukan.</p>
            <p className="text-slate-400 mt-1">
              Coba sesuaikan filter waktu atau kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">No. Struk</th>
                    <th className="p-3.5">Waktu Transaksi</th>
                    <th className="p-3.5">Kasir</th>
                    <th className="p-3.5">Metode Bayar</th>
                    <th className="p-3.5">Total Item</th>
                    <th className="p-3.5">Total Tagihan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.map((order) => {
                    const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
                    const orderDate = new Date(order.createdAt);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-5 font-mono font-bold text-blue-600">
                          {order.orderNumber}
                        </td>
                        <td className="p-3.5 text-slate-700">
                          <div>
                            {orderDate.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {orderDate.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WIB
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.cashier?.name || 'Kasir POS'}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {order.paymentMethod === 'CASH' && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              Tunai
                            </span>
                          )}
                          {order.paymentMethod === 'QRIS' && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1">
                              <QrCode className="w-3 h-3" />
                              QRIS
                            </span>
                          )}
                          {order.paymentMethod === 'TRANSFER' && (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              Transfer
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{itemCount} item</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="p-3.5">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Lunas
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl inline-flex items-center gap-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <strong className="text-slate-800">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-800">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                </strong>{' '}
                dari <strong className="text-slate-800">{filteredOrders.length}</strong> transaksi
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

      {/* Modal Detail Order Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Rincian Transaksi POS
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Items List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Daftar Item Menu Dipesan:</span>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 max-h-60 overflow-y-auto">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>{item.product?.name || 'Menu'}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>
                        {item.qty} x {formatCurrency(item.price)}
                      </span>
                    </div>
                    {item.note && (
                      <div className="text-[10px] text-slate-500 italic bg-amber-50 text-amber-800 p-1 rounded border border-amber-200/60">
                        Catatan: {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Kasir Pelayan:</span>
                <span className="font-semibold text-slate-800">
                  {selectedOrder.cashier?.name || 'Kasir POS'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-blue-600">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="text-blue-600">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>

              {selectedOrder.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Uang Diterima:</span>
                    <span>{formatCurrency(selectedOrder.cashReceived || 0)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                    <span>Kembalian:</span>
                    <span>{formatCurrency(selectedOrder.changeAmount || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsReceiptOpen(true)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak Ulang Struk</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal for Reprinting */}
      {selectedOrder && (
        <ThermalReceiptModal
          order={selectedOrder}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </div>
  );
}
