import React from 'react';
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
  Mic
} from 'lucide-react';
import { CROPS, CROP_CATEGORIES } from '../config/crops';
import { store } from '../services/store';

export default function LandingPage({ setCurrentView, onOpenAiModal }) {
  const categories = [
    {
      name: CROP_CATEGORIES.GRAINS,
      emoji: '🌾',
      crops: 'Wheat, Rice, Maize',
      desc: 'Milling grade, food grain & feed crops direct from grower clusters.'
    },
    {
      name: CROP_CATEGORIES.OILSEEDS,
      emoji: '🌼',
      crops: 'Mustard, Soybean, Groundnut',
      desc: 'High oil-recovery seeds for processing mills & solvent extraction.'
    },
    {
      name: CROP_CATEGORIES.PULSES,
      emoji: '🧆',
      crops: 'Chickpea, Lentil, Pigeon Pea',
      desc: 'High-protein whole pulses sourced directly from certified FPOs.'
    },
    {
      name: CROP_CATEGORIES.VEGETABLES,
      emoji: '🥔',
      crops: 'Potato, Tomato, Onion',
      desc: 'Farm-fresh perishable harvest with temperature-optimized transit.'
    },
    {
      name: CROP_CATEGORIES.OTHER,
      emoji: '🍯',
      crops: 'Custom Produce & Jaggery',
      desc: 'Extensible architecture supporting regional and specialty harvests.'
    }
  ];

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
            <span>Smart India Hackathon 2026 – Prototype</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            KRISHI BAZAAR
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-brand-700 mt-3">
            Direct Farm-to-Market Platform with Smart Logistics
          </p>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-4 leading-relaxed">
            Connecting farmers and buyers through direct agricultural trade, bulk supply aggregation, market intelligence, demand forecasting, and efficient logistics planning.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Explore Marketplace
            </button>

            <button
              onClick={() => {
                store.setCurrentUser('buyer_2');
                setCurrentView('marketplace');
              }}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center gap-2"
            >
              🛒 Buy Produce (Normal)
            </button>

            <button
              onClick={() => {
                store.setCurrentUser('buyer_1');
                setCurrentView('bulk-requirement');
              }}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Post Bulk Requirement
            </button>

            <button
              onClick={onOpenAiModal}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-brand-600 to-emerald-700 hover:from-emerald-500 hover:to-brand-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
              Voice Search / Ask AI
            </button>

            <button
              onClick={() => {
                store.setCurrentUser('farmer_a');
                setCurrentView('farmer-dashboard');
              }}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Sprout className="w-4 h-4" />
              Join as Farmer / FPO
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 pt-10 border-t border-slate-200/60 text-left">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-brand-700">100%</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Supply Aggregation</span>
              <span className="text-[11px] text-slate-500">Multiple farmers $\rightarrow$ 1 order</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-blue-600">Multi-Crop</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">5 Agricultural Sectors</span>
              <span className="text-[11px] text-slate-500">Grains, oilseeds, pulses & veg</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-emerald-600">AI Demand</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Predictive Intelligence</span>
              <span className="text-[11px] text-slate-500">Explainable trend regression</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-purple-600">Smart Routes</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Nearest-Neighbor</span>
              <span className="text-[11px] text-slate-500">Haversine route optimization</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE USP CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-brand-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-brand-800/60 relative overflow-hidden">
          <div className="max-w-3xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 uppercase tracking-wider">
              The Platform USP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              "Krishi Bazaar is more than an agricultural marketplace."
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              It connects farmers/FPOs directly with buyers, enables bulk buyers to fulfill large requirements by aggregating supply from multiple farmers, provides market intelligence and demand forecasting, and helps plan efficient collection and delivery routes.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  store.setCurrentUser('buyer_1');
                  setCurrentView('bulk-requirement');
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow transition-colors flex items-center gap-1.5"
              >
                Experience 10,000 kg Wheat Aggregation Demo
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAiModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Ask Gemini Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-CATEGORY AGRICULTURAL PRODUCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Not Vegetable-Only
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Comprehensive Multi-Category Agricultural Coverage
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Krishi Bazaar is architected to handle staple grains, high-value oilseeds, pulses, and vegetables with crop-specific dynamic pricing and forecasting.
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

      {/* HOW IT WORKS (SECTION 44 REQUIREMENT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Technology Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How Krishi Bazaar Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A transparent, 6-stage workflow bridging farm gates to consumer centers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 font-black text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Market Data Ingestion</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Historical prices, seasonal consumption patterns, and mandi arrival data are indexed across crop varieties.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">AI Demand Forecasting (Core AI)</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Data-driven linear trend regression and seasonality factors estimate monthly regional requirements.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Smart Supply Matching</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              When a buyer requests bulk produce, the algorithm queries active listings for compatible quality, price, and crop.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Supply Aggregation (USP)</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Multiple farmer lots (e.g. 3,000 + 2,500 + 4,500 kg) are aggregated into a unified fulfillment order with transparent payout.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center mb-3">
              5
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Distance-Based Route Optimization</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Nearest-Neighbor heuristic plans the pickup order from Prayagraj to Kanpur to Unnao ending at Lucknow.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center mb-3">
              6
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Transparent Pricing & Delivery</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Every rupee is itemized across farmer produce value, logistics freight, and platform fee with step-by-step transit tracking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
