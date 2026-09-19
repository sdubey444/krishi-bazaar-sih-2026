import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { locationService } from '../services/locationService';
import { i18n } from '../services/i18nService';
import LanguageSwitcher from './LanguageSwitcher';
import SihVisionModal from './SihVisionModal';
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
  PackageCheck,
  Users,
  ShieldCheck,
  ShoppingBag,
  MapPin
} from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpenAiModal,
  onOpenLogisticsRegister,
  onOpenLocationSelector,
  onRequireAuth
}) {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [currentLocation, setCurrentLocation] = useState(() => locationService.getLocationContext());
  const [currentLang, setCurrentLang] = useState(i18n.getLanguage());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSihVisionModalOpen, setIsSihVisionModalOpen] = useState(false);

  useEffect(() => {
    const unsubStore = store.subscribe(state => setCurrentUser(state.currentUser));
    const unsubLoc = locationService.subscribe(loc => setCurrentLocation(loc));
    const unsubI18n = i18n.subscribe(lang => setCurrentLang(lang));

    return () => {
      unsubStore();
      unsubLoc();
      unsubI18n();
    };
  }, []);

  const navItems = [
    { id: 'marketplace', label: i18n.t('products'), icon: Store },
    { id: 'bulk-requirement', label: i18n.t('bulkSupply'), icon: Layers },
    { id: 'market-intel', label: i18n.t('marketPrices'), icon: TrendingUp },
    { id: 'logistics', label: i18n.t('logistics'), icon: Truck },
  ];

  // Dynamic dashboard label depending on role
  if (currentUser?.role === 'farmer') {
    navItems.push({ id: 'farmer-dashboard', label: i18n.t('farmerDashboard'), icon: LayoutDashboard });
  } else if (currentUser?.role === 'buyer') {
    navItems.push({ id: 'buyer-dashboard', label: i18n.t('buyerDashboard'), icon: LayoutDashboard });
    navItems.push({ id: 'my-orders', label: i18n.t('myOrders'), icon: PackageCheck });
  } else if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin-dashboard', label: i18n.t('adminDashboard'), icon: ShieldCheck });
  }

  const handleNav = (viewId) => {
    if (!currentUser && (viewId === 'marketplace' || viewId === 'bulk-requirement')) {
      if (onRequireAuth) {
        onRequireAuth({
          title: viewId === 'marketplace' ? 'Please Log In to Explore Marketplace' : 'Please Log In to Order Bulk Produce',
          message: 'Please create an account or log in to continue.',
          actionType: 'marketplace',
          returnAction: viewId
        });
        setMobileMenuOpen(false);
        return;
      }
    }
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'farmer':
        return {
          label: i18n.t('roleFarmer'),
          icon: Sprout,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'buyer':
        return {
          label: i18n.t('roleBuyer'),
          icon: ShoppingBag,
          bg: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'admin':
        return {
          label: i18n.t('roleAdmin'),
          icon: ShieldCheck,
          bg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      default:
        return {
          label: 'Visitor',
          icon: Users,
          bg: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">{i18n.t('appName')}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {i18n.t('tagline')}
              </p>
            </div>
          </div>

          {/* Location Badge & Selector (Center-Left) */}
          <button
            onClick={onOpenLocationSelector}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-2xs group"
            title="Change Active Location (India-Wide)"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="max-w-[140px] truncate text-left">
              {currentLocation.district || currentLocation.state}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              ({currentLocation.state})
            </span>
          </button>

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

          <div className="hidden sm:flex items-center gap-2">
            {/* 22-Language Switcher */}
            <LanguageSwitcher />

            {/* SIH Solution Vision Button (Judge-Facing) */}
            <button
              onClick={() => setIsSihVisionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black transition-all shadow-2xs group cursor-pointer"
              title="Smart India Hackathon Complete Solution Vision & Architecture"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>🏛️ SIH Vision</span>
            </button>

            {/* Become Logistics Partner Link */}
            <button
              onClick={onOpenLogisticsRegister}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-colors"
              title="Register a delivery vehicle on Krishi Bazaar"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Logistics Partner</span>
            </button>

            {/* Prominent Voice Search / Ask AI Button */}
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white text-xs font-bold shadow-sm shadow-brand-600/20 transition-all active:scale-95 group"
              title="Voice Search & AI Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Voice / Ask AI</span>
            </button>

            {/* User Profile & Role Area */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden md:block">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[130px]">
                      {currentUser.name}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.bg}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                  </div>

                  {/* Switch Role Button */}
                  <button
                    onClick={() => handleNav('auth')}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="Switch or change active login role"
                  >
                    {i18n.t('switchRole')}
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      store.logout();
                      setCurrentView('landing');
                    }}
                    title="Log out of account"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('auth')}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition-colors shadow-2xs"
                >
                  {i18n.t('login')}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher compact={true} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {/* Mobile Location Selector */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenLocationSelector) onOpenLocationSelector();
            }}
            className="w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Location: {currentLocation.district || currentLocation.state} ({currentLocation.state})</span>
            </div>
            <span className="text-[10px] text-brand-700 underline">Change</span>
          </button>

          {currentUser && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{currentUser.name}</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${roleInfo.bg}`}>
                  <RoleIcon className="w-3 h-3" />
                  {roleInfo.label}
                </span>
              </div>
              <button
                onClick={() => handleNav('auth')}
                className="text-xs text-brand-700 font-bold hover:underline"
              >
                {i18n.t('switchRole')}
              </button>
            </div>
          )}

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

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAiModal();
              }}
              className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 text-white font-bold text-xs shadow-xs"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>Voice / AI</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  store.logout();
                  setCurrentView('landing');
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow transition-colors"
              >
                {i18n.t('login')}
              </button>
            )}
          </div>

          {/* Mobile SIH Vision Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSihVisionModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-xs shadow-2xs transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>🏛️ SIH Complete Solution Vision & Architecture</span>
            </button>
          </div>
        </div>
      )}

      {/* Judge-Facing SIH Solution Vision Modal */}
      <SihVisionModal
        isOpen={isSihVisionModalOpen}
        onClose={() => setIsSihVisionModalOpen(false)}
      />
    </header>
  );
}
