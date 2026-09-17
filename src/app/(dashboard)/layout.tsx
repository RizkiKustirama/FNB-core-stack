'use client';

import React from 'react';
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

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Brand Logo Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-amber-300 rounded-xl shadow-lg shadow-blue-500/30">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">F&B ERP Admin</h2>
              <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-400/20 font-medium">
                Back-Office v2.1
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Menu Utamanya
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Controls & POS Quick Action */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          {/* Quick POS Button */}
          <Link
            href="/pos"
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buka Web POS (Kasir)</span>
          </Link>

          {/* User Profile Footer */}
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1.5 bg-slate-700 rounded-lg text-slate-300 shrink-0">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="truncate text-xs">
                <div className="font-bold text-slate-200 truncate">{session?.user?.name || 'Admin'}</div>
                <div className="text-[10px] text-slate-400 truncate">{session?.user?.email}</div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
