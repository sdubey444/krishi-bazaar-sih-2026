import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import {
  Sprout,
  Store,
  Layers,
  Truck,
  TrendingUp,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  Menu,
  X,
  LogOut,
  UserCheck,
  Mic,
  PackageCheck
} from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpenAiModal,
  onOpenLogisticsRegister
}) {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return store.subscribe(state => {
      setCurrentUser(state.currentUser);
    });
  }, []);

  const navItems = [
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'bulk-requirement', label: 'Buy Produce', icon: Layers },
    { id: 'market-intel', label: 'Market Price & Demand', icon: TrendingUp },
    { id: 'logistics', label: 'Delivery & Route', icon: Truck },
  ];

  // Dynamic dashboard label depending on role
  if (currentUser?.role === 'farmer') {
    navItems.push({ id: 'farmer-dashboard', label: 'Farmer Dashboard', icon: LayoutDashboard });
  } else if (currentUser?.role === 'buyer') {
    navItems.push({ id: 'buyer-dashboard', label: 'Buyer Dashboard', icon: LayoutDashboard });
    navItems.push({ id: 'my-orders', label: 'My Orders', icon: PackageCheck });
  } else if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin-dashboard', label: 'Admin Console', icon: ShieldAlert });
  }

  const handleNav = (viewId) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Krishi Bazaar</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Direct Farm-to-Market Platform with Smart Logistics
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Become Logistics Partner Link */}
            <button
              onClick={onOpenLogisticsRegister}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-colors"
              title="Register suitable vehicle to deliver produce"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Logistics Partner</span>
            </button>

            {/* Prominent Voice Search / Ask AI Button (Prompt Section 17) */}
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white text-xs font-bold shadow-sm shadow-brand-600/20 transition-all active:scale-95 group"
              title="Voice Search & AI Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Voice Search / Ask AI</span>
            </button>

            {/* Current User Badge & Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                  {currentUser?.name || 'Guest'}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  {currentUser?.role || 'Visitor'}
                </span>
              </div>

              {currentUser ? (
                <button
                  onClick={() => {
                    store.logout();
                    setCurrentView('landing');
                  }}
                  title="Log out / Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleNav('auth')}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
                >
                  Login / Join
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <button
            onClick={() => handleNav('landing')}
            className={`w-full min-h-[44px] flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              currentView === 'landing' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            Home
          </button>

          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === item.id ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5 text-slate-500 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenLogisticsRegister) onOpenLogisticsRegister();
            }}
            className="w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-900 bg-blue-50/70 border border-blue-200"
          >
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Become a Logistics Partner</span>
          </button>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAiModal();
              }}
              className="min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 text-white font-bold text-xs shadow-xs"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>🎤 Voice Search / Ask AI</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  store.logout();
                  setCurrentView('landing');
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="px-3 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow transition-colors"
              >
                Login / Join
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
