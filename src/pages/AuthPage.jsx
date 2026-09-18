import React, { useState } from 'react';
import { store } from '../services/store';
import {
  Sprout,
  Store,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function AuthPage({ setCurrentView }) {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState('buyer'); // 'farmer' or 'buyer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Lucknow');
  const [organization, setOrganization] = useState('');

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const role = selectedRole;
    let user;
    if (isRegister) {
      user = store.register({
        role,
        name: name.trim() || (role === 'farmer' ? 'Kisan Member' : 'Buyer Member'),
        organization: organization.trim(),
        location: location.trim(),
        email: email.trim(),
        password
      });
    } else {
      user = store.login(role, name.trim() || (role === 'farmer' ? 'Kisan Member' : 'Buyer Member'), email.trim());
    }
    
    if (role === 'farmer') {
      setCurrentView('farmer-dashboard');
    } else if (role === 'buyer') {
      setCurrentView('buyer-dashboard');
    } else {
      setCurrentView('admin-dashboard');
    }
  };

  const handleQuickDemoLogin = (userId, targetView) => {
    store.setCurrentUser(userId);
    setCurrentView(targetView);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Sprout className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Sign In to Krishi Bazaar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Access your agricultural listings, smart aggregation orders, or logistics planning console.
        </p>
      </div>

      {/* QUICK SIH JUDGE LOGIN SHORTCUTS */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-700 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            SIH 2026 1-Click Instant Evaluation Logins
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Click any role below to bypass manual entry and test the core workflow immediately:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <button
            onClick={() => handleQuickDemoLogin('farmer_a', 'farmer-dashboard')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-left transition-all"
          >
            <span className="text-brand-400 block font-black">🌾 Farmer A (Prayagraj)</span>
            <span className="text-[11px] text-slate-400 font-normal">3,000 kg Wheat Listing</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('farmer_b', 'farmer-dashboard')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-left transition-all"
          >
            <span className="text-brand-400 block font-black">🌾 Farmer B (Kanpur)</span>
            <span className="text-[11px] text-slate-400 font-normal">2,500 kg Wheat Listing</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('farmer_c', 'farmer-dashboard')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-left transition-all"
          >
            <span className="text-brand-400 block font-black">🌾 Farmer C (Unnao)</span>
            <span className="text-[11px] text-slate-400 font-normal">4,500 kg Wheat Listing</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('buyer_1', 'buyer-dashboard')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-left transition-all"
          >
            <span className="text-blue-400 block font-black">🛒 Buyer / Consumer</span>
            <span className="text-[11px] text-slate-400 font-normal">Avadh Agro Foods — Purchase Any Quantity</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('admin_1', 'admin-dashboard')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-left transition-all"
          >
            <span className="text-amber-400 block font-black">⚡ State Admin</span>
            <span className="text-[11px] text-slate-400 font-normal">Platform Volume & Audits</span>
          </button>
        </div>
      </div>

      {/* Auth Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-lg mx-auto space-y-6">
        {/* Toggle Login vs Register */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register New Account
          </button>
        </div>

        {/* Role Selection (Section 2 & 27: ONLY FARMER OR BUYER REGISTRATION) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Select Your Role:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('farmer')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedRole === 'farmer'
                  ? 'border-brand-500 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sprout className="w-5 h-5 text-brand-600 mb-1" />
              <div className="font-extrabold text-xs">FARMER / FPO</div>
              <div className="text-[10px] text-slate-500">List crops & receive orders</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('buyer')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedRole === 'buyer'
                  ? 'border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Store className="w-5 h-5 text-blue-600 mb-1" />
              <div className="font-extrabold text-xs">BUYER / CONSUMER</div>
              <div className="text-[10px] text-slate-500">Purchase any quantity directly</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs sm:text-sm">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name / Primary Contact:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel or Avadh Foods Ltd"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Organization / FPO Name (Optional):</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Ganga Valley Kisan Co-op"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Primary Hub City / Mandi:</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Prayagraj, Kanpur, Lucknow"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@krishibazaar.in"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {isRegister ? 'Create Account & Enter' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
