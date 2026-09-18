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
  Search,
  Bell,
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

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-[#e2beba]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b22222] text-white rounded-2xl shadow-md shadow-[#b22222]/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1e1b13] tracking-tight">F&B ERP Admin</h2>
              <span className="text-[10px] text-[#b22222] bg-[#b22222]/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Mbahkakung Stack
              </span>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-[#5a403e] hover:text-[#1e1b13] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-extrabold text-[#5a403e]/70 uppercase tracking-widest">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#b22222] text-white shadow-md shadow-[#b22222]/20'
                    : 'text-[#5a403e] hover:bg-[#efe7d9] hover:text-[#1e1b13]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5a403e]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Controls & POS Quick Action */}
      <div className="p-3.5 border-t border-[#e2beba]/30 space-y-2.5 bg-[#f5edde]">
        <Link
          href="/pos"
          onClick={() => setMobileMenuOpen(false)}
          className="w-full py-3 bg-[#b22222] hover:bg-[#8f000d] text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99]"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buka Order Terminal (POS)</span>
        </Link>

        <div className="p-3 bg-[#fff8ef] rounded-2xl border border-[#e2beba]/40 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 bg-[#f5edde] rounded-xl text-[#b22222] shrink-0 font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div className="truncate text-xs">
              <div className="font-bold text-[#1e1b13] truncate">{session?.user?.name || 'Admin'}</div>
              <div className="text-[10px] text-[#5a403e] truncate font-medium">{session?.user?.email}</div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-[#5a403e] hover:text-[#b22222] hover:bg-[#efe7d9] rounded-xl transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbf3e4] font-sans">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#f5edde] text-[#1e1b13] px-4 py-3 flex items-center justify-between border-b border-[#e2beba]/40 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-[#fff8ef] hover:bg-[#efe7d9] rounded-xl text-[#1e1b13] border border-[#e2beba]/40 transition"
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#b22222] text-white rounded-lg">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1e1b13]">F&B ERP Admin</span>
          </div>
        </div>

        <Link
          href="/pos"
          className="px-3 py-1.5 bg-[#b22222] text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>POS</span>
        </Link>
      </header>

      {/* Mobile Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#1e1b13]/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Drawer Navigation */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#f5edde] text-[#1e1b13] z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar Navigation (Style matching Order Terminal / Inventory design) */}
      <aside className="hidden lg:flex w-64 bg-[#f5edde] text-[#1e1b13] flex-col shrink-0 border-r border-[#e2beba]/30 sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#fbf3e4]">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}

