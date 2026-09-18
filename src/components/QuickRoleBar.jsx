import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { Users, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';

export default function QuickRoleBar({ onRoleChange }) {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    return store.subscribe((state) => {
      setCurrentUser(state.currentUser);
    });
  }, []);

  const handleSwitch = (userId) => {
    store.setCurrentUser(userId);
    if (onRoleChange) onRoleChange(userId);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo listings, requirements, and orders to default SIH seed state?')) {
      store.resetSeedData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
            <Sparkles className="w-3 h-3" /> SIH 2026 Judge Demo Mode
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline">
            Active: <strong className="text-white">{currentUser?.name || 'Visitor'}</strong> ({currentUser?.role?.toUpperCase() || 'GUEST'})
          </span>
        </div>

        {/* Center: 1-Click Role Switchers */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-400 hidden lg:inline mr-1">Switch Role:</span>

          <button
            onClick={() => handleSwitch('farmer_a')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              currentUser?.role === 'farmer'
                ? 'bg-brand-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Role 1: Farmer / FPO"
          >
            🌾 Farmer / FPO (Demo)
          </button>

          <button
            onClick={() => handleSwitch('buyer_1')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              currentUser?.role === 'buyer'
                ? 'bg-brand-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Role 2: Buyer / Consumer"
          >
            🛒 Buyer / Consumer
          </button>

          <button
            onClick={() => handleSwitch('admin_1')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              currentUser?.role === 'admin'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Role 3: State Administrator"
          >
            ⚡ Admin
          </button>
        </div>

        {/* Right: Reset Seed Data */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-all border border-slate-700"
            title="Reset store to default initial seed data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
          {resetSuccess && (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" /> Reset!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
