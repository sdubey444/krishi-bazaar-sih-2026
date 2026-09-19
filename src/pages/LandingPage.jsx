import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Store,
  Layers,
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  Sparkles,
  ChevronRight,
  Mic,
  ShoppingBag,
  CheckCircle2,
  Check
} from 'lucide-react';
import { CROPS, CROP_CATEGORIES } from '../config/crops';
import { store } from '../services/store';
import { i18n } from '../services/i18nService';

export default function LandingPage({ setCurrentView, onOpenAiModal, currentUser, onRequireAuth, onSelectRole }) {
  const [currentLang, setCurrentLang] = useState(i18n.getLanguage());
  const [selectedRole, setSelectedRole] = useState('logistics');

  useEffect(() => {
    return i18n.subscribe(lang => setCurrentLang(lang));
  }, []);

  const handleRoleContinue = (role) => {
    if (onSelectRole) {
      onSelectRole(role);
    } else if (onRequireAuth) {
      onRequireAuth({ initialRole: role, actionType: 'role_select' });
    } else {
      setCurrentView('auth');
    }
  };
  const categories = [
    {
      name: CROP_CATEGORIES.GRAINS,
      emoji: '🌾',
      crops: 'Wheat, Rice, Maize',
      desc: 'Quality food grains and staple crops direct from grower clusters.'
    },
    {
      name: CROP_CATEGORIES.OILSEEDS,
      emoji: '🌼',
      crops: 'Mustard, Soybean, Groundnut',
      desc: 'High oil-yield seeds direct from certified regional farmers.'
    },
    {
      name: CROP_CATEGORIES.PULSES,
      emoji: '🧆',
      crops: 'Chickpea, Lentil, Pigeon Pea',
      desc: 'Protein-rich whole pulses sourced directly from local farmer cooperatives.'
    },
    {
      name: CROP_CATEGORIES.VEGETABLES,
      emoji: '🥔',
      crops: 'Potato, Tomato, Onion',
      desc: 'Fresh harvests from local farms with scheduled delivery.'
    },
    {
      name: CROP_CATEGORIES.OTHER,
      emoji: '🍯',
      crops: 'Custom Produce & Jaggery',
      desc: 'Traditional and regional farm harvests direct from cultivators.'
    }
  ];

  const handleExploreMarketplace = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth({
          title: 'Please Log In to Explore Marketplace',
          message: 'Please create an account or log in to continue.',
          actionType: 'marketplace',
          returnAction: 'marketplace'
        });
        return;
      }
      setCurrentView('auth');
      return;
    }
    setCurrentView('marketplace');
  };

  const handleOrderBulkProduce = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth({
          title: 'Please Log In to Order Bulk Produce',
          message: 'Please create an account or log in to continue.',
          actionType: 'marketplace',
          returnAction: 'bulk-requirement'
        });
        return;
      }
      setCurrentView('auth');
      return;
    }
    setCurrentView('bulk-requirement');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200/60">
        {/* Soft background glow circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-200/30 to-brand-300/30 blur-3xl rounded-full -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* SIH 2026 Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-300/60 text-brand-800 text-xs font-bold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Smart India Hackathon 2026 – Direct Farm-to-Market</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            KRISHI BAZAAR
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-brand-700 mt-3">
            Direct Farm-to-Market Platform with Smart Logistics
          </p>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-4 leading-relaxed">
            Connecting farmers and buyers through direct agricultural trade, multi-farmer supply aggregation, fair market prices, and planned delivery.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={handleExploreMarketplace}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              {i18n.t('exploreMarketplace')}
            </button>

            <button
              onClick={handleOrderBulkProduce}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              {i18n.t('orderBulkProduce')}
            </button>

            <button
              onClick={onOpenAiModal}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-brand-600 to-emerald-700 hover:from-emerald-500 hover:to-brand-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
              Krishi AI / कृषि AI
            </button>

            <button
              onClick={() => setCurrentView('auth')}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Choose Role & Login
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 pt-10 border-t border-slate-200/60 text-left">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-brand-700">100%</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Supply Aggregation</span>
              <span className="text-[11px] text-slate-500">Multiple farmers → 1 order</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-blue-600">Multi-Crop</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">5 Agricultural Sectors</span>
              <span className="text-[11px] text-slate-500">Grains, oilseeds, pulses & veg</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-emerald-600">Fair Pricing</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Marketplace Intel</span>
              <span className="text-[11px] text-slate-500">Real-time mandi benchmark rates</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-purple-600">Smart Routes</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Planned Pickups</span>
              <span className="text-[11px] text-slate-500">Nearest-farm route coordination</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 CLEAR ROLE STARTING GUIDE (PROMPT SECTION 2 & 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-extrabold text-brand-700 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200/60">
            Get Started in Seconds
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Choose How You Want to Use Krishi Bazaar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Select your role to enter your dedicated dashboard with all relevant tools and features.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Role 1: Farmer / FPO */}
          <div
            onClick={() => setSelectedRole('farmer')}
            className={`bg-white rounded-3xl border-2 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
              selectedRole === 'farmer'
                ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                : 'border-emerald-500/30 hover:border-emerald-500'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                {selectedRole === 'farmer' && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {i18n.t('roleFarmer') || 'Farmer / FPO'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Farmer / FPO</h3>
                <p className="text-xs font-semibold text-emerald-800 mt-1">
                  Sell your agricultural products directly to buyers.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>List harvest at your asking price</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Receive orders from genuine buyers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Mandi benchmark price intelligence</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleContinue('farmer');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue as Farmer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  store.setCurrentUser('farmer_a');
                  setCurrentView('farmer-dashboard');
                }}
                className="w-full py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors"
                title="Instant evaluation login"
              >
                Instant Demo Entry →
              </button>
            </div>
          </div>

          {/* Role 2: Buyer / Consumer */}
          <div
            onClick={() => setSelectedRole('buyer')}
            className={`bg-white rounded-3xl border-2 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
              selectedRole === 'buyer'
                ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                : 'border-blue-500/30 hover:border-blue-500'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                {selectedRole === 'buyer' && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {i18n.t('roleBuyer') || 'Buyer / Consumer'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Buyer / Consumer</h3>
                <p className="text-xs font-semibold text-blue-800 mt-1">
                  Find products, compare prices, and place orders.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Direct farm purchase without middlemen</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Bulk aggregated multi-farmer supply</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Live delivery tracking to your door</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleContinue('buyer');
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue as Buyer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  store.setCurrentUser('buyer_1');
                  setCurrentView('buyer-dashboard');
                }}
                className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition-colors"
                title="Instant evaluation login"
              >
                Instant Demo Entry →
              </button>
            </div>
          </div>

          {/* Role 3: Logistics Partner */}
          <div
            onClick={() => setSelectedRole('logistics')}
            className={`bg-white rounded-3xl border-2 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
              selectedRole === 'logistics'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                : 'border-indigo-500/30 hover:border-indigo-500'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                {selectedRole === 'logistics' && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-300">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {i18n.t('roleLogistics') || 'Logistics Partner'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Logistics Partner</h3>
                <p className="text-xs font-semibold text-indigo-800 mt-1">
                  Transport agricultural produce from farms to buyers.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Accept assigned pickup orders</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Live tracking & highway transit route</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Guaranteed 90% direct freight payout</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                id="continue-logistics-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleContinue('logistics');
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue as Logistics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  store.setCurrentUser('logistics_1');
                  setCurrentView('logistics-dashboard');
                }}
                className="w-full py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[11px] transition-colors"
                title="Instant evaluation login"
              >
                Instant Demo Entry →
              </button>
            </div>
          </div>

          {/* Role 4: Admin */}
          <div
            onClick={() => setSelectedRole('admin')}
            className={`bg-white rounded-3xl border-2 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
              selectedRole === 'admin'
                ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/20'
                : 'border-amber-500/30 hover:border-amber-500'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                {selectedRole === 'admin' && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {i18n.t('roleAdmin') || 'Admin'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Admin</h3>
                <p className="text-xs font-semibold text-amber-800 mt-1">
                  Manage and monitor the Krishi Bazaar platform.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Monitor platform trade volume & audit</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Verify logistics partners & vehicles</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Manage marketplace listings & users</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleContinue('admin');
                }}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue as Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  store.setCurrentUser('admin_1');
                  setCurrentView('admin-dashboard');
                }}
                className="w-full py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition-colors"
                title="Instant evaluation login"
              >
                Instant Demo Entry →
              </button>
            </div>
          </div>
        </div>

        {/* Global Role Continue Bar (Section 1 Flow: Select Role -> Continue -> Auth) */}
        <div className="mt-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-black">
              {selectedRole === 'farmer' ? '🌾' : selectedRole === 'buyer' ? '🛒' : selectedRole === 'logistics' ? '🚚' : '⚡'}
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Selected Role:</span>
              <span className="font-black text-slate-900 text-sm capitalize">
                {selectedRole === 'farmer' ? 'Farmer / FPO' : selectedRole === 'buyer' ? 'Buyer / Consumer' : selectedRole === 'logistics' ? 'Logistics Partner' : 'Platform Admin'}
              </span>
            </div>
          </div>

          <button
            type="button"
            id="home-role-continue-btn"
            onClick={() => handleRoleContinue(selectedRole)}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to {selectedRole === 'farmer' ? 'Farmer' : selectedRole === 'buyer' ? 'Buyer' : selectedRole === 'logistics' ? 'Logistics Partner' : 'Admin'} Authentication</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* CORE USP CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-brand-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-brand-800/60 relative overflow-hidden">
          <div className="max-w-3xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 uppercase tracking-wider">
              The Platform Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              Direct Agricultural Trade with Smart Supply Aggregation
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Krishi Bazaar connects farmers directly with buyers. When a buyer needs large quantities, the platform automatically combines supply across multiple local farmers, coordinates pickup routes, and ensures fair, transparent pricing for everyone.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  store.setCurrentUser('buyer_1');
                  setCurrentView('bulk-requirement');
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow transition-colors flex items-center gap-1.5"
              >
                Try Multi-Farmer Bulk Order Demo
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAiModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Krishi AI से पूछें
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-CATEGORY AGRICULTURAL PRODUCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            All Farming Sectors Covered
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Produce Categories on Krishi Bazaar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Trade staple food grains, oilseeds, pulses, and vegetables with fair market rates and transparent logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">
                {cat.emoji}
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">{cat.name}</h3>
              <div className="text-xs font-semibold text-brand-700 mt-1">{cat.crops}</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Simple 6-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How Krishi Bazaar Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A simple, fair journey from the farmer's field to the buyer's doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 font-black text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Market Prices & Arrivals</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Real-time Mandi benchmark prices and arrival volumes help farmers and buyers know the fair market value.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Market Demand Forecast</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Smart forecasts help farmers know which crops have strong future demand and advise on the best time to sell.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Direct Crop Listings</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Farmers post available crops with quantity, asking price, and location. Buyers search and filter easily.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Multi-Farmer Supply Aggregation</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              When a buyer needs a large order, the system combines crops from several nearby farmers to fill it completely.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center mb-3">
              5
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Smart Route & Delivery Planning</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Pickups are ordered starting from the nearest farm along the route to reduce travel time and transport cost.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center mb-3">
              6
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Transparent Pricing & Tracking</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Every rupee is clearly listed for produce, delivery, and service with step-by-step delivery tracking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
