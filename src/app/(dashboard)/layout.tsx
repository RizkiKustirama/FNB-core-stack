'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Boxes,
  UtensilsCrossed,
  Receipt,
  TrendingUp,
  ShoppingBag,
  LogOut,
  Shield,
  Utensils,
  Menu,
  X,
  User,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Ringkasan ERP', icon: LayoutDashboard },
  { href: '/dashboard/inventory', label: 'Bahan Baku & Stok', icon: Boxes },
  { href: '/dashboard/products', label: 'Katalog & Resep BoM', icon: UtensilsCrossed },
  { href: '/dashboard/cashflow', label: 'Arus Kas & Pengeluaran', icon: Receipt },
  { href: '/dashboard/reports', label: 'Laporan Laba Rugi', icon: TrendingUp },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop Narrow Icon Bar (Narrow vertical icon bar ~80px w-20/w-24)
  const DesktopSidebar = () => (
    <div className="flex flex-col h-full items-center justify-between py-6 px-3">
      {/* Top Section: App/Brand Logo */}
      <div className="flex flex-col items-center gap-6 w-full">
        <Link
          href="/dashboard"
          className="w-12 h-12 rounded-2xl bg-[#C62828] text-white flex items-center justify-center shadow-md shadow-red-700/20 hover:scale-105 transition-transform"
          title="F&B ERP Admin"
        >
          <Utensils className="w-6 h-6" />
        </Link>

        {/* Center Vertical Navigation Icons */}
        <nav className="flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#C62828] text-white shadow-md shadow-red-700/20'
                    : 'text-[#555555] hover:bg-[#EBE3D5] hover:text-[#2C221E]'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: POS Action & User Profile Avatar/Logout */}
      <div className="flex flex-col items-center gap-4 w-full pt-4 border-t border-[#EBE3D5]">
        <Link
          href="/pos"
          className="w-12 h-12 rounded-2xl bg-white border border-[#EBE3D5] text-[#C62828] flex items-center justify-center hover:bg-[#FAF6F0] transition shadow-xs"
          title="Buka Web POS (Kasir)"
        >
          <ShoppingBag className="w-5 h-5" />
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-12 h-12 rounded-2xl text-[#555555] hover:text-[#C62828] hover:bg-[#EBE3D5] flex items-center justify-center transition"
          title={`Keluar (${session?.user?.name || 'User'})`}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Mobile Drawer (Wider drawer for mobile navigation)
  const MobileNavDrawer = () => (
    <div className="flex flex-col h-full justify-between p-5">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE3D5]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C62828] text-white rounded-2xl shadow-md">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2C221E]">F&B ERP Admin</h2>
              <span className="text-[10px] text-[#C62828] bg-[#C62828]/10 px-2 py-0.5 rounded-full font-bold">
                Mbahkakung Stack
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-[#555555] hover:text-[#2C221E] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#C62828] text-white shadow-md'
                    : 'text-[#555555] hover:bg-[#EBE3D5] hover:text-[#2C221E]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-[#EBE3D5]">
        <Link
          href="/pos"
          onClick={() => setMobileMenuOpen(false)}
          className="w-full py-3 bg-[#C62828] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buka Web POS (Kasir)</span>
        </Link>

        <div className="p-3 bg-white rounded-2xl border border-[#EBE3D5] flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-2 bg-[#FAF6F0] rounded-xl text-[#C62828]">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate text-xs">
              <div className="font-bold text-[#2C221E] truncate">{session?.user?.name || 'Admin'}</div>
              <div className="text-[10px] text-[#555555] truncate">{session?.user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-[#555555] hover:text-[#C62828]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F0] font-sans">
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden bg-[#F5EFE6] text-[#2C221E] px-4 py-3 flex items-center justify-between border-b border-[#EBE3D5] sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-white hover:bg-[#FAF6F0] rounded-xl text-[#2C221E] border border-[#EBE3D5] transition"
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#C62828] text-white rounded-lg">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#2C221E]">F&B ERP Admin</span>
          </div>
        </div>

        <Link
          href="/pos"
          className="px-3 py-1.5 bg-[#C62828] text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>POS</span>
        </Link>
      </header>

      {/* Mobile Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#2C221E]/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#F5EFE6] text-[#2C221E] z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl border-r border-[#EBE3D5] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <MobileNavDrawer />
      </aside>

      {/* Desktop Narrow Vertical Icon Bar (Narrow 80px w-20 / w-24 per Stitch design spec) */}
      <aside className="hidden lg:flex w-20 xl:w-24 bg-[#F5EFE6] flex-col shrink-0 border-r border-[#EBE3D5] sticky top-0 h-screen z-20">
        <DesktopSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#FAF6F0]">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
