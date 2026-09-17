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
    <header className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-md border-b border-slate-800 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 sm:p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center shrink-0">
          <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
        </div>
        <div>
          <h1 className="text-xs sm:text-base font-bold tracking-wide flex items-center gap-1.5">
            Kasir POS
            <span className="text-[9px] sm:text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              WEB
            </span>
          </h1>
          <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none">{timeStr || 'Memuat...'}</span>
          </div>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div className="p-1 bg-slate-700 rounded-lg text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-200">{session?.user?.name || 'Kasir'}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{(session?.user as any)?.role || 'CASHIER'}</span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">ERP Back-Office</span>
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/30 transition"
          title="Keluar / Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
