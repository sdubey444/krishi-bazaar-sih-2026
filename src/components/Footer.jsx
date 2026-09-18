import React from 'react';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ setCurrentView }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Platform Overview */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">Krishi Bazaar</span>
              <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold border border-brand-500/30">
                SIH 2026 MVP
              </span>
            </div>

            <p className="text-slate-400 max-w-lg leading-relaxed">
              <strong>Direct Farm-to-Market Platform with Smart Logistics.</strong> Krishi Bazaar connects farmers/FPOs directly with buyers, enables bulk buyers to fulfill large requirements by aggregating supply from multiple farmers, provides crop-specific market intelligence and AI demand forecasting, and plans efficient collection and delivery routes.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Smart India Hackathon 2026 Prototype • Ministry of Agriculture & Farmers Welfare</span>
            </div>
          </div>

          {/* Col 2: Core Capabilities */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Core Modules</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setCurrentView('marketplace')} className="hover:text-white transition-colors">
                  Agricultural Spot Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('bulk-requirement')} className="hover:text-white transition-colors">
                  Buy Produce (Supply Aggregation)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('market-intel')} className="hover:text-white transition-colors">
                  Crop Demand Forecasting & Advice
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('market-intel')} className="hover:text-white transition-colors">
                  Price Intelligence & Mandi Trends
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('logistics')} className="hover:text-white transition-colors">
                  Route Optimization & Logistics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech Stack & Verification */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Architecture</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Frontend: React 18 + Vite + Tailwind CSS</li>
              <li>• Optimization: Haversine & Nearest-Neighbor</li>
              <li>• AI/ML: Time-Series Regression + Gemini Layer</li>
              <li>• Database: Firebase Firestore / Local Reactive</li>
              <li>• Deployment: Vercel Ready</li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Prototype Transparency:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Estimations and routes are generated using explainable statistical models and deterministic distance matrices for demo reliability.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © 2026 Krishi Bazaar Team • SIH 2026 Innovation Challenge. Built with React & Tailwind CSS.
          </div>
          <div className="flex items-center gap-4">
            <span>Grains • Oilseeds • Pulses • Vegetables</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
