'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Utensils, LogOut, LayoutDashboard, Clock, User, ShieldCheck } from 'lucide-react';

export function PosHeader() {
  const { data: session } = useSession();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }) +
          ' ' +
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <header className="bg-[#FAF6F0] text-[#2C221E] px-4 py-3 flex items-center justify-between shadow-xs border-b border-[#2C221E]/10 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#C62828] text-white rounded-2xl shadow-md shadow-red-700/20 flex items-center justify-center shrink-0">
          <Utensils className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-serif font-bold tracking-tight text-[#2C221E] flex items-center gap-2">
            Order Terminal
            <span className="text-[10px] bg-[#C62828]/10 text-[#C62828] font-sans font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              POS
            </span>
          </h1>
          <div className="text-[11px] text-[#2C221E]/70 flex items-center gap-1 mt-0.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#2C221E]/60 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-none">{timeStr || 'Memuat...'}</span>
          </div>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-2xl border border-[#2C221E]/10 shadow-xs">
          <div className="p-1 bg-[#FAF6F0] rounded-xl text-[#C62828]">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-[#2C221E]">{session?.user?.name || 'Kasir'}</div>
            <div className="text-[10px] text-[#2C221E]/60 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-[#C62828]" />
              <span>{(session?.user as any)?.role || 'CASHIER'}</span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FAF6F0] text-[#2C221E] text-xs font-bold rounded-2xl border border-[#2C221E]/10 transition shadow-xs"
          >
            <LayoutDashboard className="w-4 h-4 text-[#C62828]" />
            <span className="hidden sm:inline">ERP Back-Office</span>
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#C62828]/10 hover:bg-[#C62828]/20 text-[#C62828] text-xs font-bold rounded-2xl border border-[#C62828]/20 transition"
          title="Keluar / Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
