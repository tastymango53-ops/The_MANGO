import React, { useState } from 'react';
import {
  ShoppingBag, Package, Settings, Menu, X, LogOut, Zap,
} from 'lucide-react';

export type AdminSection = 'orders' | 'inventory' | 'settings';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onClose?: () => void;
}

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

export function AdminLayout({ children, activeSection, onSectionChange, onClose }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavItem = ({ item }: { item: typeof NAV_ITEMS[number] }) => {
    const Icon = item.icon;
    const active = activeSection === item.id;
    return (
      <button
        onClick={() => { onSectionChange(item.id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group relative ${
          active
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
        <span>{item.label}</span>
        {item.badge != null && item.badge > 0 && (
          <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-300 rounded-r-full" />
        )}
      </button>
    );
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`${
        mobile
          ? 'fixed inset-y-0 left-0 z-50 w-64 flex flex-col'
          : 'hidden lg:flex flex-col w-64 flex-shrink-0'
      } bg-gradient-to-b from-[#1a0a00] to-[#2d1200] border-r border-white/5`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
          <span className="text-lg">🥭</span>
        </div>
        <div>
          <p className="text-white font-black text-sm leading-none">RED ROSE MANGO</p>
          <p className="text-amber-400/70 text-xs font-medium mt-0.5">Admin Console</p>
        </div>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Live indicator */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-green-400 text-xs font-semibold">Live — Realtime Active</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <p className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest">Navigation</p>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-white/5 pt-4">
        {onClose && (
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Exit Admin</span>
          </button>
        )}
        <div className="mt-3 flex items-center gap-2 px-4">
          <Zap className="w-3.5 h-3.5 text-amber-400/60" />
          <span className="text-xs text-slate-600 font-medium">Powered by Supabase Realtime</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-['Inter',_sans-serif] overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar mobile />
        </>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#1a0a00] border-b border-white/5 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base">🥭</span>
            <span className="text-white font-black text-sm">RED ROSE MANGO Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
