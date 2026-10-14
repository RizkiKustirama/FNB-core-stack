# Recap Order: Checkout Items Metric Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menambahkan metrik dan kartu ringkasan total item checkout/terjual pada fitur Rekap & Riwayat Pesanan Kasir (Orders Recap), terintegrasi dari layer database Prisma, backend service, API endpoint, hingga responsive card UI dashboard.

**Architecture:**
- **Backend Service Layer (`src/services/order.service.ts`)**: Agregasi `totalItems` dari `order.items[].qty` dalam `formattedOrders` pada summary calculation.
- **Frontend Dashboard Layer (`src/app/(dashboard)/dashboard/orders/page.tsx`)**: Menambahkan field `totalItems` pada interface `OrderSummary`, menyinkronkan status filter ke query API, dan menambahkan kartu metrik baru "Total Item Checkout" dengan styling visual modern berdasar pedoman UI/UX Pro Max.

**Tech Stack:** Next.js App Router (TypeScript), Prisma ORM (PostgreSQL Neon), Tailwind CSS v4, Lucide React Icons.

---

### Task 1: Update Backend Order Service Layer

**Files:**
- Modify: `src/services/order.service.ts:90-110`

**Step 1: Implementasi kalkulasi `totalItems` di summary order**
Hitung total item terjual/checkout dengan mengakumulasikan `item.qty` dari setiap item pada pesanan yang terfilter.

```typescript
// src/services/order.service.ts
const totalOrders = formattedOrders.length;
const totalSales = formattedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
const totalItems = formattedOrders.reduce(
  (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.qty, 0),
  0
);
const cashCount = formattedOrders.filter((o) => o.paymentMethod === 'CASH').length;
const qrisCount = formattedOrders.filter((o) => o.paymentMethod === 'QRIS').length;
const transferCount = formattedOrders.filter((o) => o.paymentMethod === 'TRANSFER').length;
const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

return {
  summary: {
    totalOrders,
    totalSales,
    totalItems,
    cashCount,
    qrisCount,
    transferCount,
    averageOrderValue,
  },
  orders: formattedOrders,
};
```

**Step 2: Verifikasi Type Safety**
Jalankan pemeriksaan TypeScript:
`npx tsc --noEmit`
Expected: Exit code 0

---

### Task 2: Update Frontend State & Query Synchronization

**Files:**
- Modify: `src/app/(dashboard)/dashboard/orders/page.tsx:60-78`
- Modify: `src/app/(dashboard)/dashboard/orders/page.tsx:130-165`

**Step 1: Perbarui interface `OrderSummary` & initial state**
```typescript
interface OrderSummary {
  totalOrders: number;
  totalSales: number;
  totalItems: number;
  cashCount: number;
  qrisCount: number;
  transferCount: number;
  averageOrderValue: number;
}
```
Inisialisasi `totalItems: 0` pada default state `summary`.

**Step 2: Sinkronisasi `statusFilter` pada parameter `fetchOrdersData`**
Tambahkan `statusFilter` ke query parameters:
```typescript
if (statusFilter !== 'ALL') params.set('status', statusFilter);
```
Tambahkan `statusFilter` ke dependency array `useEffect`:
```typescript
useEffect(() => {
  fetchOrdersData();
}, [dateFilter, paymentFilter, statusFilter]);
```

---

### Task 3: Implementasi Kartu Metrik "Total Item Checkout" di UI

**Files:**
- Modify: `src/app/(dashboard)/dashboard/orders/page.tsx:210-290`

**Step 1: Import icon dari `lucide-react`**
Import `UtensilsCrossed` atau `PackageCheck` untuk visualisasi item produk checkout.

**Step 2: Perbarui Grid Container Responsif**
Ubah container grid menjadi:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
```

**Step 3: Render Kartu Metrik Baru**
Tambahkan kartu metrik ke-3 (di antara Total Pesanan dan Rata-Rata Order):
```tsx
{/* Card: Total Item Checkout */}
<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
    <UtensilsCrossed className="w-6 h-6" />
  </div>
  <div>
    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
      Total Item Checkout
    </span>
    <div className="text-xl font-black text-slate-900 mt-0.5">
      {summary.totalItems}{' '}
      <span className="text-xs font-normal text-slate-500">Porsi / Item</span>
    </div>
  </div>
</div>
```

---

### Task 4: Verifikasi & Kompilasi

**Step 1: Validasi TypeScript**
Run: `npx tsc --noEmit`
Expected: 0 errors, exit code 0.

**Step 2: Verifikasi Fungsionalitas Data**
Pastikan perhitungan:
- Order dengan beberapa item menjumlahkan masing-masing `item.qty`.
- Filter tanggal (`Hari Ini`, `7 Hari`, dsb) dan status (`Lunas`, `Dibatalkan`) langsung mengupdate angka total item yang terhitung.

---

### Task 5: Git Commit Per Layer

**Step 1: Stage file yang dimodifikasi**
`git add src/services/order.service.ts src/app/(dashboard)/dashboard/orders/page.tsx docs/plans/2026-10-14-recap-order-checkout-items.md`

**Step 2: Commit**
`git commit -m "feat(orders): add total checkout items metric card to order recap dashboard"`
