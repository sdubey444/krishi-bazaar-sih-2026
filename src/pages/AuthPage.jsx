import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import {
  Sprout,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  User,
  MapPin,
  Sparkles,
  Phone,
  AlertCircle,
  Building2,
  Check,
  Users,
  Truck
} from 'lucide-react';

export default function AuthPage({
  setCurrentView,
  initialMode = 'login',
  initialRole = null,
  returnAction = null,
  onAuthSuccess = null
}) {
  // Step 1: 'role-select' | Step 2: 'credentials'
  const [authStep, setAuthStep] = useState(initialRole ? 'credentials' : 'role-select');
  const [selectedRole, setSelectedRole] = useState(initialRole || 'farmer');
  const [isRegister, setIsRegister] = useState(initialMode === 'register');

  // Form fields
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [organization, setOrganization] = useState('');

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialMode) {
      setIsRegister(initialMode === 'register');
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
      setAuthStep('credentials');
    }
  }, [initialRole]);

  const roles = [
    {
      id: 'farmer',
      name: 'Farmer / FPO',
      tagline: 'Sell your agricultural products directly to buyers.',
      details: 'List your harvest at your own asking price, receive orders from buyers, and receive guaranteed transparent payouts.',
      icon: Sprout,
      color: 'emerald',
      bgActive: 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      defaultEmail: 'ramesh@gangafpo.org',
      defaultName: 'Ramesh Patel (Farmer A)'
    },
    {
      id: 'buyer',
      name: 'Buyer / Consumer',
      tagline: 'Find products, compare prices, and place orders.',
      details: 'Purchase fresh produce directly from farmers, place single-lot or aggregated bulk orders, with door-to-door delivery tracking.',
      icon: ShoppingBag,
      color: 'blue',
      bgActive: 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 text-blue-950',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      defaultEmail: 'procurement@avadhagro.in',
      defaultName: 'Avadh Agro Mills (Buyer)'
    },
    {
      id: 'logistics',
      name: 'Logistics Partner',
      tagline: 'Transport agricultural produce from farms to buyers.',
      details: 'Accept consolidated pickup orders, optimize highway transit routes, and update physical delivery checkpoints.',
      icon: Truck,
      color: 'indigo',
      bgActive: 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-700',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      defaultEmail: 'rajesh.logistics@krishibazaar.in',
      defaultName: 'Rajesh Kumar (Logistics Partner)'
    },
    {
      id: 'admin',
      name: 'Admin',
      tagline: 'Manage and monitor the Krishi Bazaar platform.',
      details: 'Monitor live marketplace trade, verify and approve logistics partner vehicles, oversee users, and audit orders.',
      icon: ShieldCheck,
      color: 'amber',
      bgActive: 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      defaultEmail: 'admin@krishibazaar.gov.in',
      defaultName: 'State Agritech Admin'
    }
  ];

  const currentRoleConfig = roles.find((r) => r.id === selectedRole) || roles[0];

  // Selecting role in Step 1
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Navigating from Step 1 (Role Selection) -> Step 2 (Credentials)
  const handleProceedToCredentials = (roleId = null) => {
    const roleToUse = roleId || selectedRole;
    setSelectedRole(roleToUse);
    setErrorMessage('');
    setSuccessMessage('');

    if (roleToUse === 'admin') {
      setIsRegister(false);
      setEmailOrPhone('admin@krishibazaar.gov.in');
    } else {
      if (emailOrPhone === 'admin@krishibazaar.gov.in') {
        setEmailOrPhone('');
      }
    }

    setAuthStep('credentials');
  };

  const handleBackToRoleSelect = () => {
    setAuthStep('role-select');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Input validations with simple English error messages
    if (isRegister && selectedRole !== 'admin') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
    }

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      const role = selectedRole;
      let user;

      if (isRegister && role !== 'admin') {
        user = store.register({
          role,
          name: name.trim(),
          organization: organization.trim() || (role === 'farmer' ? 'Kisan Member' : role === 'buyer' ? 'Individual Buyer' : role === 'logistics' ? 'Express Krishi Transport' : 'Krishi Directorate'),
          location: location.trim() || 'Prayagraj',
          email: emailOrPhone.includes('@') ? emailOrPhone.trim() : `${role}_${Date.now()}@krishibazaar.in`,
          phone: !emailOrPhone.includes('@') ? emailOrPhone.trim() : '+91 98765 43210',
          password
        });
        setSuccessMessage(`Account created successfully! Welcome, ${user.name}.`);
      } else {
        user = store.login(
          role,
          emailOrPhone.trim(),
          password
        );
        setSuccessMessage(`Login successful! Welcome back, ${user.name}.`);
      }

      if (onAuthSuccess) {
        onAuthSuccess(user, returnAction);
        return;
      }

      // Deterministic routing with return-after-login support
      setTimeout(() => {
        if (returnAction === 'marketplace') {
          setCurrentView('marketplace');
        } else if (returnAction === 'bulk-requirement') {
          setCurrentView('bulk-requirement');
        } else if (returnAction === 'voice') {
          setCurrentView(role === 'farmer' ? 'farmer-dashboard' : role === 'logistics' ? 'logistics-dashboard' : 'buyer-dashboard');
        } else if (returnAction === 'order') {
          setCurrentView('marketplace');
        } else {
          // Default role dashboard routing
          if (role === 'farmer') {
            setCurrentView('farmer-dashboard');
          } else if (role === 'buyer') {
            setCurrentView('buyer-dashboard');
          } else if (role === 'logistics') {
            setCurrentView('logistics-dashboard');
          } else if (role === 'admin') {
            setCurrentView('admin-dashboard');
          }
        }
      }, 350);
    } catch (err) {
      setErrorMessage('Login details are incorrect. Please try again.');
    }
  };

  const handleQuickDemoLogin = (userId, targetView) => {
    store.setCurrentUser(userId);
    const user = store.currentUser;
    setSuccessMessage(`Logging in as ${user?.name || 'Demo User'}...`);

    if (onAuthSuccess) {
      onAuthSuccess(user, returnAction);
      return;
    }

    setTimeout(() => {
      if (returnAction === 'marketplace') {
        setCurrentView('marketplace');
      } else if (returnAction === 'bulk-requirement') {
        setCurrentView('bulk-requirement');
      } else if (returnAction === 'voice') {
        setCurrentView(targetView);
      } else {
        setCurrentView(targetView);
      }
    }, 250);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Platform Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-600/20">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome to Krishi Bazaar
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {authStep === 'role-select'
            ? 'Please select your role to continue to login or account creation.'
            : `Please enter your details to sign in or register as ${currentRoleConfig.name}.`}
        </p>
      </div>

      {/* =========================================================================
          STEP 1: ROLE SELECTION SCREEN
          ========================================================================= */}
      {authStep === 'role-select' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-700 block">
                Step 1 of 2
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Select Your Role
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Select one role to proceed
            </span>
          </div>

          {/* 4 Distinct Role Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? role.bgActive + ' shadow-md scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-slate-900' : 'text-slate-600'}`} />
                      </div>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                          Selected
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-base text-slate-900">
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                        {role.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Immediate Card Action Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100/90">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProceedToCredentials(role.id);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Ready to Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary Action Button: "Ready to Continue" */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs text-slate-500 block">Selected Role:</span>
              <span className="font-black text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <currentRoleConfig.icon className="w-4 h-4 text-brand-600" />
                {currentRoleConfig.name}
              </span>
            </div>

            <button
              type="button"
              id="ready-to-continue-btn"
              onClick={() => handleProceedToCredentials()}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${currentRoleConfig.buttonBg}`}
            >
              <span>Ready to Continue as {currentRoleConfig.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: CREDENTIALS SCREEN (LOGIN / ACCOUNT CREATION)
          ========================================================================= */}
      {authStep === 'credentials' && (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Back to Role Selection Breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBackToRoleSelect}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Role Selection</span>
            </button>

            <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${currentRoleConfig.badgeBg}`}>
              <currentRoleConfig.icon className="w-3.5 h-3.5" />
              {currentRoleConfig.name}
            </span>
          </div>

          {/* Auth Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Toggle Login vs Register (only for farmer & buyer) */}
            {selectedRole !== 'admin' ? (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all ${
                    !isRegister
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In to Existing Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all ${
                    isRegister
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create New {selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} Account
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Administrator Console:</strong> Sign in with verified platform directorate credentials.
                </span>
              </div>
            )}

            {/* Error / Feedback Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Registration Fields */}
              {isRegister && selectedRole !== 'admin' && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Full Name: <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={
                          selectedRole === 'farmer'
                            ? 'e.g. Ramesh Patel'
                            : 'e.g. Avadh Agro Mills'
                        }
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      {selectedRole === 'farmer'
                        ? 'FPO or Cooperative Name (Optional):'
                        : 'Business or Household Name (Optional):'}
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder={
                          selectedRole === 'farmer'
                            ? 'e.g. Ganga Valley Kisan Co-op'
                            : 'e.g. Avadh Foods Ltd'
                        }
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      {selectedRole === 'farmer'
                        ? 'Your Nearest Mandi / District:'
                        : 'Your Delivery City:'}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Prayagraj, Kanpur, Lucknow"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email / Mobile Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Email Address or Mobile Number: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={
                      selectedRole === 'farmer'
                        ? 'e.g. ramesh@gangafpo.org or 9876543210'
                        : selectedRole === 'buyer'
                        ? 'e.g. procurement@avadhagro.in or 9811122334'
                        : 'admin@krishibazaar.gov.in'
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedRole === 'farmer'
                    ? 'Farmers can enter either mobile number or email.'
                    : 'Used to verify and track your agricultural trade orders.'}
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Password: <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Any password for demo</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 ${currentRoleConfig.buttonBg}`}
              >
                <span>
                  {isRegister
                    ? `Create ${currentRoleConfig.name} Account & Continue`
                    : `Log In as ${currentRoleConfig.name}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK 1-CLICK DEMO LOGINS FOR EVALUATION */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-700 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Instant 1-Click Evaluation Logins
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Click any role below to bypass manual entry and test the platform immediately:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => handleQuickDemoLogin('farmer_a', 'farmer-dashboard')}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 font-bold text-left transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-black">🌾 Farmer / FPO</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Farmer A</span>
            </div>
            <div className="text-white mt-1">Ramesh Patel (Prayagraj)</div>
            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
              3,000 kg Wheat Listing • Farmer Dashboard
            </span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('buyer_1', 'buyer-dashboard')}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-blue-500/40 font-bold text-left transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-black">🛒 Buyer / Consumer</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Buyer 1</span>
            </div>
            <div className="text-white mt-1">Avadh Agro Mills (Lucknow)</div>
            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
              Bulk & Direct Orders • Buyer Dashboard
            </span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('logistics_1', 'logistics-dashboard')}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-indigo-500/40 font-bold text-left transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-indigo-400 font-black">🚚 Logistics Partner</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Transporter</span>
            </div>
            <div className="text-white mt-1">Rajesh Kumar (UP70 AB 1234)</div>
            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
              Assigned Pickups & Transit • Logistics Dashboard
            </span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('admin_1', 'admin-dashboard')}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 font-bold text-left transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-black">⚡ Platform Admin</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Directorate</span>
            </div>
            <div className="text-white mt-1">State Agritech Directorate</div>
            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
              Users, Listings & Audits • Admin Dashboard
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
