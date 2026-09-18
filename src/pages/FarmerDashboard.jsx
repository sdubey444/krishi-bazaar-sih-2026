import React, { useState, useEffect, useRef } from 'react';
import { store } from '../services/store';
import { CROPS, CROP_CATEGORIES } from '../config/crops';
import { formatCurrency, formatWeight } from '../utils/formatters';
import { getCropDemandForecast, getCropPriceIntelligence } from '../services/forecastEngine';
import {
  Sprout,
  PlusCircle,
  TrendingUp,
  Package,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  EyeOff,
  Sparkles,
  Layers,
  ArrowRight,
  Edit3,
  Check,
  X,
  RotateCcw,
  Tag,
  Scale,
  FileText,
  PackageCheck,
  User,
  LogOut,
  HelpCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';

export default function FarmerDashboard({ setCurrentView, setSelectedOrderId, onOpenAiModal }) {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [listings, setListings] = useState(store.listings || []);
  const [orders, setOrders] = useState(store.orders || []);
  const [requirements, setRequirements] = useState(store.requirements || []);

  const formRef = useRef(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const defaultFormData = {
    produce: 'Wheat',
    cropId: 'wheat',
    isCustomCrop: false,
    customProduceName: '',
    category: CROP_CATEGORIES.GRAINS,
    quantity: 50,
    unit: 'Quintal',
    pricePerKg: 28,
    location: currentUser?.location || 'Prayagraj',
    availability: 'Available in Stock (Immediate)',
    availableFrom: new Date().toISOString().split('T')[0],
    qualityGrade: 'Grade A',
    description: 'Clean Sharbati milling wheat with tested moisture content below 12%.'
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    return store.subscribe(state => {
      setCurrentUser(state.currentUser);
      setListings(state.listings || []);
      setOrders(state.orders || []);
      setRequirements(state.requirements || []);
    });
  }, []);

  // Filter listings belonging to this farmer
  const farmerListings = listings.filter(l => l.farmerId === currentUser?.id);
  const activeListings = farmerListings.filter(l => l.status === 'Active');

  const totalAvailableKg = activeListings.reduce((sum, l) => {
    const qty = l.availableQuantity !== undefined ? l.availableQuantity : l.quantity;
    return sum + Number(qty);
  }, 0);

  // Orders where this farmer is allocated or direct seller
  const receivedOrders = orders.filter(o => {
    if (o.allocations?.some(a => a.farmerId === currentUser?.id)) return true;
    if (o.farmerId === currentUser?.id) return true;
    if (currentUser?.id === 'farmer_a' && (!o.farmerId || o.farmerId === 'farmer_a')) return true;
    if (currentUser?.fpoName && o.fpoName === currentUser.fpoName) return true;
    return false;
  });

  // Alias for backward compatibility to prevent any undefined variable ReferenceError
  const myAllocatedOrders = receivedOrders;

  const completedOrders = receivedOrders.filter(o => o.status === 'Delivered' || o.status === 'Collected');
  const pendingOrders = receivedOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Collected');

  const totalEarnings = receivedOrders.reduce((sum, o) => {
    const alloc = o.allocations?.find(a => a.farmerId === currentUser?.id);
    return sum + (alloc?.farmerEarnings || o.produceAmount || (Number(o.pricePerKg || 25) * Number(o.totalQuantity || o.quantity || 100)));
  }, 0);

  // Quick crop market signal for this farmer's primary crop
  const primaryCrop = farmerListings[0]?.cropId || 'wheat';
  const cropSignal = getCropDemandForecast(primaryCrop) || getCropDemandForecast('wheat');
  const priceSignal = getCropPriceIntelligence(primaryCrop) || getCropPriceIntelligence('wheat');

  // Handle standard crop vs custom crop change
  const handleCropChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM_OTHER') {
      setFormData(prev => ({
        ...prev,
        produce: 'Other Produce',
        cropId: 'other_produce',
        isCustomCrop: true,
        customProduceName: '',
        category: CROP_CATEGORIES.OTHER,
        pricePerKg: 30
      }));
    } else {
      const crop = CROPS.find(c => c.name === val);
      if (crop) {
        setFormData(prev => ({
          ...prev,
          produce: crop.name,
          cropId: crop.id,
          isCustomCrop: false,
          customProduceName: '',
          category: crop.category,
          pricePerKg: crop.refPrice
        }));
      }
    }
  };

  const openAddForm = () => {
    setEditingListingId(null);
    setValidationError('');
    setFormSuccess(false);
    setSuccessMessage('');
    setFormData({
      produce: 'Wheat',
      cropId: 'wheat',
      isCustomCrop: false,
      customProduceName: '',
      category: CROP_CATEGORIES.GRAINS,
      quantity: 50,
      unit: 'Quintal',
      pricePerKg: 28,
      location: currentUser?.location || 'Prayagraj',
      availability: 'Available in Stock (Immediate)',
      availableFrom: new Date().toISOString().split('T')[0],
      qualityGrade: 'Grade A',
      description: 'Clean Sharbati milling wheat with tested moisture content below 12%.'
    });
    setShowAddForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const openEditForm = (listing) => {
    setEditingListingId(listing.id);
    setValidationError('');
    setFormSuccess(false);
    setSuccessMessage('');

    const isQuintal = listing.unit === 'Quintal' || listing.displayUnit === 'Quintal';
    const totalQty = listing.availableQuantity !== undefined ? listing.availableQuantity : listing.quantity;
    const displayQty = isQuintal ? Math.round(totalQty / 100) : totalQty;

    const matchedCrop = CROPS.find(
      c => c.name.toLowerCase() === (listing.produce || '').toLowerCase() || c.id === listing.cropId
    );

    setFormData({
      produce: matchedCrop ? matchedCrop.name : 'Other Produce',
      cropId: matchedCrop ? matchedCrop.id : 'custom',
      isCustomCrop: !matchedCrop,
      customProduceName: matchedCrop ? '' : (listing.produce || ''),
      category: listing.category || (matchedCrop ? matchedCrop.category : CROP_CATEGORIES.GRAINS),
      quantity: displayQty || 10,
      unit: isQuintal ? 'Quintal' : 'kg',
      pricePerKg: listing.pricePerKg || 25,
      location: listing.location || currentUser?.location || 'Prayagraj',
      availability: listing.availability || 'Available in Stock (Immediate)',
      availableFrom: listing.availableFrom || new Date().toISOString().split('T')[0],
      qualityGrade: listing.qualityGrade || 'Grade A',
      description: listing.description || ''
    });

    setShowAddForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingListingId(null);
    setValidationError('');
    setFormSuccess(false);
    setSuccessMessage('');
  };

  const handleSubmitListing = (e) => {
    e.preventDefault();
    setValidationError('');

    const resolvedProduceName = formData.isCustomCrop
      ? formData.customProduceName?.trim()
      : formData.produce?.trim();

    // 1. Validation checks
    if (!resolvedProduceName) {
      setValidationError('Please enter or select a valid Produce / Crop name.');
      return;
    }

    if (!formData.category?.trim()) {
      setValidationError('Please select a Category for this crop.');
      return;
    }

    const qty = Number(formData.quantity);
    if (!qty || qty <= 0 || isNaN(qty)) {
      setValidationError('Please enter a valid Quantity greater than 0.');
      return;
    }

    const price = Number(formData.pricePerKg);
    if (!price || price <= 0 || isNaN(price)) {
      setValidationError('Please enter a valid Expected Asking Price (greater than ₹0 per kg).');
      return;
    }

    if (!formData.location?.trim()) {
      setValidationError('Please specify your farm, village, or Mandi location.');
      return;
    }

    if (!formData.availability?.trim()) {
      setValidationError('Please select crop Availability status.');
      return;
    }

    // 2. Quantity normalization: 1 Quintal = 100 KG
    const normalizedKg = formData.unit === 'Quintal' ? qty * 100 : qty;

    try {
      if (editingListingId) {
        // Edit / Update existing listing
        store.updateListing(editingListingId, {
          produce: resolvedProduceName,
          cropId: formData.cropId || resolvedProduceName.toLowerCase().replace(/\s+/g, '_'),
          category: formData.category,
          quantity: normalizedKg,
          availableQuantity: normalizedKg,
          unit: formData.unit,
          displayUnit: formData.unit,
          pricePerKg: price,
          location: formData.location.trim(),
          availability: formData.availability,
          availableFrom: formData.availableFrom || new Date().toISOString().split('T')[0],
          qualityGrade: formData.qualityGrade || 'Grade A',
          description: formData.description?.trim() || '',
          status: 'Active',
          updatedAt: new Date().toISOString()
        });

        setFormSuccess(true);
        setSuccessMessage('Produce listing updated successfully! Updated lot is now active for buyers.');
      } else {
        // Add new produce listing
        store.addListing({
          farmerId: currentUser?.id || 'farmer_a',
          farmerName: currentUser?.name || 'Local Farmer',
          fpoName: currentUser?.organization || 'Local FPO',
          produce: resolvedProduceName,
          cropId: formData.cropId || resolvedProduceName.toLowerCase().replace(/\s+/g, '_'),
          category: formData.category,
          quantity: normalizedKg,
          availableQuantity: normalizedKg,
          unit: formData.unit,
          displayUnit: formData.unit,
          pricePerKg: price,
          location: formData.location.trim(),
          availability: formData.availability,
          availableFrom: formData.availableFrom || new Date().toISOString().split('T')[0],
          qualityGrade: formData.qualityGrade || 'Grade A',
          description: formData.description?.trim() || '',
          status: 'Active'
        });

        setFormSuccess(true);
        setSuccessMessage('Produce successfully listed on marketplace! Buyers can now view and purchase this lot.');
      }

      setTimeout(() => {
        setFormSuccess(false);
        setSuccessMessage('');
        setShowAddForm(false);
        setEditingListingId(null);
        document.getElementById('my-produce-table')?.scrollIntoView({ behavior: 'smooth' });
      }, 1600);
    } catch (err) {
      console.error('Error saving produce listing:', err);
      setValidationError('Failed to save listing: ' + (err.message || 'Database error'));
    }
  };

  const handleDeactivate = (id) => {
    if (window.confirm('Deactivate this produce listing? It will no longer be visible for buyer orders.')) {
      store.deactivateListing(id);
    }
  };

  const handleReactivate = (id) => {
    store.reactivateListing(id);
  };

  // Show helpful prompt instead of blank screen if no user is signed in
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-brand-100 text-brand-700 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Sprout className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Farmer & FPO Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sign in to Access Farmer Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Please log in with your Farmer/FPO account to view your produce listings, received buyer orders, crop demand forecasts, and mandi price intelligence.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentView('auth')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" /> Go to Login / Register
          </button>
          <button
            onClick={() => {
              store.login('farmer', 'Ramesh Patel (Farmer A)');
              setCurrentView('farmer-dashboard');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Instant Demo Farmer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Farmer Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-brand-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 uppercase">
                Farmer & FPO Portal
              </span>
              <span className="text-xs text-slate-300">Location: {currentUser?.location || 'Prayagraj'}, UP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Namaste, {currentUser?.name || 'Farmer Partner'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {currentUser?.organization || 'Ganga Valley Farmers FPO'} • Sell crops directly to buyers without middlemen.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                store.logout();
                setCurrentView('landing');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 backdrop-blur-sm"
              title="Log out from Farmer account"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            <button
              onClick={() => {
                if (showAddForm && !editingListingId) {
                  setShowAddForm(false);
                } else {
                  openAddForm();
                }
              }}
              className="min-h-[44px] px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-sm shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              {showAddForm && !editingListingId ? 'Close Form' : '+ Add Product to Sell'}
            </button>
          </div>
        </div>
      </div>

      {/* "WHAT CAN I DO HERE?" - PRIMARY ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Farmer Actions
          </h2>
          <span className="text-xs text-slate-400">Choose what you want to do:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={openAddForm}
            className="p-4 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-100 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 block">Add Product to Sell</span>
            <span className="text-xs text-slate-500">List produce for buyers</span>
          </button>

          <a
            href="#my-produce-table"
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 block">My Crops</span>
            <span className="text-xs text-slate-500">{activeListings.length} lots active for sale</span>
          </a>

          <a
            href="#my-orders-section"
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 block">My Orders</span>
            <span className="text-xs text-slate-500">{pendingOrders.length} orders waiting pickup</span>
          </a>

          <button
            onClick={() => setCurrentView('market-intel')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 block">Market Price</span>
            <span className="text-xs text-slate-500">Check mandi rates & trend</span>
          </button>

          <button
            onClick={() => setCurrentView('logistics')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 block">Delivery Route</span>
            <span className="text-xs text-slate-500">View truck pickup point</span>
          </button>
        </div>
      </div>

      {/* ADD / EDIT PRODUCE FORM (STREAMLINED & FARMER-FRIENDLY) */}
      {showAddForm && (
        <div
          ref={formRef}
          id="add-product-form"
          className="bg-white rounded-3xl border-2 border-brand-500/60 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200"
        >
          {/* Header */}
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
                {editingListingId ? (
                  <Edit3 className="w-6 h-6 text-brand-600" />
                ) : (
                  <PlusCircle className="w-6 h-6 text-brand-600" />
                )}
                {editingListingId
                  ? `Edit Produce Listing: ${formData.isCustomCrop ? (formData.customProduceName || 'Produce') : formData.produce}`
                  : 'Add Product / Produce to Sell'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {editingListingId
                  ? 'Update your produce quantity, asking price, location, or crop availability notes.'
                  : 'Direct farm-gate listing for wholesale and retail buyers. Instant live matching with transparent rates.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-800 bg-brand-50 px-3 py-1 rounded-full font-bold border border-brand-200">
                {editingListingId ? 'Editing Active Listing' : 'Instant 1-Step Form'}
              </span>
              <button
                type="button"
                onClick={handleCancelForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Cancel & Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Please review the form:</span>
                <span>{validationError}</span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {formSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 text-xs sm:text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitListing} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
              {/* 1. Produce / Crop Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Crop / Produce Name <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">Select or Enter</span>
                </label>
                <select
                  value={formData.isCustomCrop ? 'CUSTOM_OTHER' : formData.produce}
                  onChange={handleCropChange}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                >
                  {CROPS.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.emoji} {c.name} ({c.category})
                    </option>
                  ))}
                  <option value="CUSTOM_OTHER">➕ Other Produce / Custom Variety</option>
                </select>

                {formData.isCustomCrop && (
                  <input
                    type="text"
                    value={formData.customProduceName}
                    onChange={(e) => setFormData({ ...formData, customProduceName: e.target.value })}
                    placeholder="Enter crop name (e.g. Garlic, Ginger, Barley)"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-brand-300 font-bold text-slate-900 bg-brand-50/40 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs sm:text-sm mt-1.5"
                    required
                  />
                )}
              </div>

              {/* 2. Category */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>2. Category <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">Classification</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  required
                >
                  <option value={CROP_CATEGORIES.GRAINS}>Grains (Wheat, Rice, Maize...)</option>
                  <option value={CROP_CATEGORIES.PULSES}>Pulses (Dal, Chickpea, Lentil...)</option>
                  <option value={CROP_CATEGORIES.OILSEEDS}>Oilseeds (Mustard, Soybean...)</option>
                  <option value={CROP_CATEGORIES.VEGETABLES}>Vegetables (Potato, Tomato, Onion...)</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Cash Crops">Cash Crops (Sugarcane, Cotton...)</option>
                  <option value={CROP_CATEGORIES.OTHER}>Other Agricultural Produce</option>
                </select>
              </div>

              {/* 3. Quantity & Unit */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>3. Quantity to Sell <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-brand-700 font-bold">
                    {formData.unit === 'Quintal'
                      ? `${formData.quantity || 0} Quintal = ${((Number(formData.quantity) || 0) * 100).toLocaleString()} KG`
                      : `${(Number(formData.quantity) || 0).toLocaleString()} KG`}
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step={formData.unit === 'Quintal' ? '1' : '10'}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    placeholder={formData.unit === 'Quintal' ? 'e.g. 50' : 'e.g. 5000'}
                    className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    required
                  />
                  <select
                    value={formData.unit || 'Quintal'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Quintal">Quintal (100 kg)</option>
                    <option value="kg">KG</option>
                  </select>
                </div>
              </div>

              {/* 4. Expected / Asking Price */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>4. Asking Price (₹ / kg) <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formData.unit === 'Quintal' ? `≈ ₹${(Number(formData.pricePerKg) || 0) * 100}/Q` : 'Farmer Rate'}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                    placeholder="e.g. 28"
                    className="w-full min-h-[44px] pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* 5. Location */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>5. Farm / Mandi Location <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">District or Mandi</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Prayagraj, Kanpur, Unnao, Varanasi"
                    className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* 6. Availability */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>6. Availability Status <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">Stock readiness</span>
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  required
                >
                  <option value="Available in Stock (Immediate)">Available in Stock (Immediate Dispatch)</option>
                  <option value="Ready for Harvest (Within 7 Days)">Ready for Harvest (Within 7 Days)</option>
                  <option value="Harvested & In Storage">Harvested & In Storage</option>
                  <option value="Available on Specified Date">Available on Specified Date</option>
                </select>
              </div>

              {/* 7. Available From Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>7. Ready from Date <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">Dispatch date</span>
                </label>
                <input
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  required
                />
              </div>

              {/* 8. Crop Quality Grade */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>8. Quality Grade</span>
                  <span className="text-[11px] text-slate-400 font-normal">Produce tier</span>
                </label>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                >
                  <option value="Grade A">Grade A (Premium - Clean, Sorted, Moisture &lt; 12%)</option>
                  <option value="Grade B">Grade B (Standard Market Mandi Quality)</option>
                  <option value="Commercial">Commercial (Processing & Dal / Flour Milling)</option>
                </select>
              </div>

              {/* 9. Reference Market Guide */}
              <div className="space-y-1.5 bg-brand-50/60 p-3 rounded-xl border border-brand-200/80 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-brand-900 block">
                  💡 Mandi Reference Guidance:
                </span>
                <span className="text-xs text-brand-800 mt-0.5">
                  Reference Mandi Rate: <strong>₹{CROPS.find(c => c.name === formData.produce)?.refPrice || 28}/kg</strong>. Farmers keep 100% of the produce value.
                </span>
              </div>
            </div>

            {/* Optional Description */}
            <div className="space-y-1.5 text-xs sm:text-sm">
              <label className="font-bold text-slate-800 block">
                Short Notes about this Crop (Variety, Moisture, Organic, Packaging):
              </label>
              <textarea
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Clean Sharbati wheat, sorted, moisture tested below 12%, packed safely in 50 kg gunny bags."
                className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Buyers will see this produce lot in the marketplace and can order small or bulk quantities.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingListingId ? 'Update Produce Listing' : 'Add / List Produce'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Crops for Sale"
          value={activeListings.length}
          subtitle={`${farmerListings.length} total lots`}
          icon={Package}
          color="brand"
        />

        <MetricCard
          title="Available Quantity"
          value={formatWeight(totalAvailableKg)}
          subtitle="Ready at farm gate"
          icon={Sprout}
          color="blue"
        />

        <MetricCard
          title="Orders from Buyers"
          value={receivedOrders.length}
          subtitle={`${pendingOrders.length} pending pickup`}
          icon={CheckCircle2}
          color="amber"
        />

        <MetricCard
          title="Farmer Earnings"
          value={formatCurrency(totalEarnings)}
          subtitle="Direct payment value"
          icon={DollarSign}
          color="rose"
        />
      </div>

      {/* CROP ADVISOR & AI ASSISTANT SECTION */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/80 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Crop Advisor & AI Assistant
              </span>
              <h3 className="text-xl font-black text-white">
                Krishi AI Assistant & Crop Advisory
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAiModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              Ask AI Assistant (Voice / Chat)
            </button>
            <button
              onClick={() => setCurrentView('market-intel')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Open Market Price & Demand
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-emerald-400 font-bold block text-sm flex items-center gap-1.5">
              <span>🌾 Crop Advisory for {cropSignal.cropName}</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              {cropSignal.marketSignal}
            </p>
            <p className="text-slate-400 text-[11px]">
              Tip: Diversify across pulses and oilseeds during peak harvesting months to hedge against mandi saturation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-amber-400 font-bold block text-sm flex items-center gap-1.5">
              <span>📈 Demand Forecast & Price Intelligence</span>
            </span>
            <div className="flex justify-between text-slate-300">
              <span>Projected Regional Demand:</span>
              <strong className="text-white">{formatWeight(cropSignal.forecastDemand)} ({cropSignal.trend})</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Estimated Next Mandi Rate:</span>
              <strong className="text-emerald-400">₹{priceSignal.estimatedPrice}/kg ({priceSignal.percentageChange > 0 ? '+' : ''}{priceSignal.percentageChange}%)</strong>
            </div>
            <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10 text-[11px]">
              <span className="text-slate-400">Data Source:</span>
              <span className="text-slate-300 font-mono">Statistical Regression • Reference/Demo Mandi Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* FARMER MARKET SIGNAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Today's Market Information for {cropSignal.cropName}
              </h3>
              <span className="text-xs text-slate-500">
                Current reference rate and market demand
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('market-intel')}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            Check Other Crops <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs block">Current Mandi Price:</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              ₹{priceSignal.currentPrice} / kg
            </span>
            <span className="text-emerald-700 font-semibold text-xs mt-1 block">
              Expected Trend: ₹{priceSignal.estimatedPrice}/kg ({priceSignal.percentageChange > 0 ? '+' : ''}{priceSignal.percentageChange}%)
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs block">Buyer Demand:</span>
            <span className="text-xl font-black text-emerald-800 mt-1 block">
              {cropSignal.trend} ({cropSignal.percentageChange > 0 ? '+' : ''}{cropSignal.percentageChange}%)
            </span>
            <span className="text-slate-600 text-xs mt-1 block">
              Market needs: {formatWeight(cropSignal.forecastDemand)}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs block">Helpful Advice for Farmers:</span>
            <p className="font-bold text-slate-800 mt-1 text-xs sm:text-sm leading-snug">
              {cropSignal.marketSignal}
            </p>
          </div>
        </div>
      </div>

      {/* MY ACTIVE LISTINGS TABLE */}
      <div id="my-produce-table" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              My Produce for Sale ({farmerListings.length} Lots)
            </h3>
            <span className="text-xs text-slate-500">
              Active crop listings registered under your farmer account
            </span>
          </div>

          <button
            onClick={openAddForm}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Produce Listing
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Produce</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available / Total Qty</th>
                <th className="py-3 px-4">Asking Price</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Quality Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {farmerListings.map(listing => {
                const avail = listing.availableQuantity !== undefined ? listing.availableQuantity : listing.quantity;
                return (
                  <tr key={listing.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{listing.produce}</td>
                    <td className="py-3 px-4 text-slate-600">{listing.category}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">
                      {formatWeight(avail)} <span className="text-slate-400 font-normal">/ {listing.quantity} kg</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">₹{listing.pricePerKg}/kg</td>
                    <td className="py-3 px-4 text-slate-600">{listing.location}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="block font-medium">{listing.availability || 'Available in Stock'}</span>
                      {listing.availableFrom && (
                        <span className="text-[10px] text-slate-400">From {listing.availableFrom}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{listing.qualityGrade || 'Grade A'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(listing)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                          title="Edit Price, Quantity, or Details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-brand-700" /> Edit
                        </button>

                        {listing.status === 'Active' ? (
                          <button
                            onClick={() => handleDeactivate(listing.id)}
                            className="px-2 py-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                            title="Deactivate listing"
                          >
                            <EyeOff className="w-3.5 h-3.5" /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(listing.id)}
                            className="px-2 py-1 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                            title="Reactivate listing"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {farmerListings.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-xs">
            You have no listings registered. Click "Add Product to Sell" above to publish your first lot.
          </div>
        )}
      </div>

      {/* ORDERS / RECEIVED ORDERS (FARMER FULFILLMENT) */}
      <div id="my-orders-section" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-700" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Orders / Received Orders ({receivedOrders.length})
              </h3>
              <span className="text-xs text-slate-500">
                Purchased produce lots, buyer consignments, and payout tracking
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {receivedOrders.map(order => {
            const myAlloc = order.allocations?.find(a => a.farmerId === currentUser?.id);
            const qtyStr = order.quantityDisplay || `${order.quantity || order.totalQuantity || myAlloc?.allocatedQuantity || 100} ${order.unit || 'KG'}`;
            const farmerPayout = myAlloc?.farmerEarnings || order.produceAmount || (Number(order.pricePerKg || 25) * Number(order.totalQuantity || order.quantity || 100));
            const isPickup = Boolean(
              order.fulfillmentMethod === 'self_pickup' ||
              order.logisticsOption === 'self_pickup' ||
              order.deliveryMethod === 'Self Pickup' ||
              order.isSelfPickup ||
              order.logisticsCost === 0
            );
            const methodText = isPickup ? 'Self Pickup' : 'Logistics Support';

            return (
              <div
                key={order.id}
                onClick={() => {
                  if (setSelectedOrderId) setSelectedOrderId(order.id);
                  setCurrentView('order-details');
                }}
                className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-400 hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 bg-slate-200 px-2.5 py-0.5 rounded border border-slate-300">
                      {order.id}
                    </span>
                    <StatusBadge status={order.status} />
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">
                      Date: {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isPickup ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}>
                    {methodText}
                  </span>
                </div>

                {/* Grid with Buyer, Produce, Quantity, Order Amount, Method, Status */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[11px] font-semibold">Buyer</span>
                    <strong className="text-slate-900 text-sm block truncate">
                      {order.buyerName || 'Avadh Agro Mills (Buyer)'}
                    </strong>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {order.destination || 'Industrial Area, Prayagraj'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[11px] font-semibold">Produce</span>
                    <strong className="text-slate-900 text-sm block">
                      {order.produce}
                    </strong>
                    <span className="text-[10px] text-brand-700 font-bold uppercase">
                      {order.qualityGrade || 'Grade A'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[11px] font-semibold">Quantity</span>
                    <strong className="text-slate-900 text-sm block">
                      {qtyStr}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      ({formatWeight(myAlloc?.allocatedQuantity || order.totalQuantity || order.quantity)})
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[11px] font-semibold">Pickup / Delivery</span>
                    <strong className={`text-xs font-bold block ${isPickup ? 'text-amber-800' : 'text-blue-800'}`}>
                      {methodText}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      {isPickup ? 'Buyer collects from farm' : 'Assigned freight carrier'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[11px] font-semibold">Order Amount (Payout)</span>
                    <strong className="text-emerald-800 text-base font-black block">
                      {formatCurrency(farmerPayout)}
                    </strong>
                    <span className="text-[10px] text-slate-500">Guaranteed farm-gate</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Collection Point: {myAlloc?.location || order.pickupLocation || currentUser?.location || 'Prayagraj, UP'}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setSelectedOrderId) setSelectedOrderId(order.id);
                      setCurrentView('order-details');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5 min-h-[38px]"
                  >
                    <span>View Order Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {receivedOrders.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs space-y-2">
              <PackageCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No received orders yet</p>
              <p className="text-slate-500">
                When buyers order produce from your listings, orders will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
