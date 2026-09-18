import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { CROPS, CROP_CATEGORIES } from '../config/crops';
import { formatCurrency, formatWeight } from '../utils/formatters';
import { calculateTransparentPricing } from '../services/routeOptimizer';
import {
  Search,
  Filter,
  MapPin,
  Tag,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  X,
  SlidersHorizontal,
  PlusCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Marketplace({ setCurrentView, setSelectedOrderId }) {
  const [listings, setListings] = useState(store.listings);
  const [currentUser, setCurrentUser] = useState(store.currentUser);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100);

  // Purchase Modal State
  const [purchasingListing, setPurchasingListing] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(10);
  const [buyUnit, setBuyUnit] = useState('kg'); // 'kg' or 'Quintal'
  const [destination, setDestination] = useState('Lucknow');
  const [deliveryMethod, setDeliveryMethod] = useState('Logistics Support'); // 'Self Pickup' vs 'Logistics Support'
  const [orderProcessing, setOrderProcessing] = useState(false);

  useEffect(() => {
    return store.subscribe(state => {
      setListings(state.listings);
      setCurrentUser(state.currentUser);
    });
  }, []);

  // Prevent background scrolling while modal is open and restore on close
  useEffect(() => {
    if (purchasingListing) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [purchasingListing]);

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchesSearch =
      item.produce.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || item.location === selectedLocation;
    const matchesPrice = (item.pricePerKg || 0) <= maxPrice;
    const isAvailable = (item.availableQuantity !== undefined ? item.availableQuantity : item.quantity) > 0;

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && isAvailable;
  });

  const locations = ['All', ...new Set(listings.map(l => l.location))];

  const handleOpenBuy = (listing) => {
    setPurchasingListing(listing);
    setBuyUnit('kg');
    const avail = listing.availableQuantity !== undefined ? listing.availableQuantity : listing.quantity;
    setBuyQuantity(Math.min(10, avail));
    setDestination(currentUser?.location || 'Lucknow');
    setDeliveryMethod('Logistics Support');
  };

  const handleConfirmPurchase = () => {
    if (!purchasingListing) return;
    setOrderProcessing(true);

    const avail = purchasingListing.availableQuantity !== undefined ? purchasingListing.availableQuantity : purchasingListing.quantity;
    const requestedKg = buyUnit === 'Quintal' ? (Number(buyQuantity) || 1) * 100 : (Number(buyQuantity) || 1);
    const qty = Math.min(avail, requestedKg);
    const produceVal = Math.round(qty * purchasingListing.pricePerKg);

    // Normal purchase: 35 km local transit estimate
    const pricing = calculateTransparentPricing(produceVal, qty, 35);
    const isSelfPickup = deliveryMethod === 'Self Pickup';
    const finalLogisticsCost = isSelfPickup ? 0 : pricing.logisticsCost;
    const finalTotal = produceVal + finalLogisticsCost + pricing.platformFee;

    const orderData = {
      buyerId: currentUser?.id || 'buyer_2',
      buyerName: currentUser?.name || 'Buyer / Consumer',
      produce: purchasingListing.produce,
      cropId: purchasingListing.cropId,
      category: purchasingListing.category,
      totalQuantity: qty,
      unit: buyUnit,
      displayUnit: buyUnit,
      orderType: qty >= 1000 ? 'Bulk Procurement' : 'Normal Purchase',
      destination: destination,
      deliveryMethod: deliveryMethod,
      farmerProduceValue: produceVal,
      logisticsCost: finalLogisticsCost,
      platformFee: pricing.platformFee,
      totalAmount: finalTotal,
      pricePerKg: purchasingListing.pricePerKg,
      farmerId: purchasingListing.farmerId,
      farmerName: purchasingListing.farmerName,
      fpoName: purchasingListing.fpoName,
      status: 'Confirmed',
      allocations: [
        {
          listingId: purchasingListing.id,
          farmerId: purchasingListing.farmerId,
          farmerName: purchasingListing.farmerName,
          fpoName: purchasingListing.fpoName,
          location: purchasingListing.location,
          allocatedQuantity: qty,
          pricePerKg: purchasingListing.pricePerKg,
          farmerEarnings: produceVal,
          qualityGrade: purchasingListing.qualityGrade
        }
      ]
    };

    const newOrder = store.createOrder(orderData);
    setOrderProcessing(false);
    setPurchasingListing(null);

    if (setSelectedOrderId) setSelectedOrderId(newOrder.id);
    setCurrentView('my-orders');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase">
              Spot Mandi & Farm Gate
            </span>
            <span className="text-xs text-slate-500 font-semibold">Direct Farm Listings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Agricultural Produce Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Verified agricultural produce direct from farmers and FPOs. Search, filter, and buy small or large quantities.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {currentUser?.role === 'farmer' && (
            <button
              onClick={() => setCurrentView('farmer-dashboard')}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              title="Open Farmer Dashboard to list new produce"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Product to Sell</span>
            </button>
          )}

          {/* Quick Demo Purchase Rice Shortcut */}
          <div className="bg-brand-50 border border-brand-200 p-2.5 rounded-xl flex items-center gap-3">
            <span className="text-xl">🍚</span>
            <div className="text-xs">
              <span className="font-bold text-brand-900 block">SIH Demo Shortcut:</span>
              <span className="text-slate-600">Purchase 10 kg Rice</span>
            </div>
            <button
              onClick={() => {
                const riceListing = listings.find(l => l.cropId === 'rice');
                if (riceListing) handleOpenBuy(riceListing);
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              Buy 10 kg Rice
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, farmer, or city..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Categories ({Object.keys(CROP_CATEGORIES).length})</option>
              {Object.values(CROP_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700 font-medium"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>Location: {loc}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Max Price: ₹{maxPrice}/kg</span>
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 mr-2 font-medium">Quick Category:</span>
          {['All', ...Object.values(CROP_CATEGORIES)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Produce Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map(listing => {
          const cropMeta = CROPS.find(c => c.id === listing.cropId) || {};
          const availableQty = listing.availableQuantity !== undefined ? listing.availableQuantity : listing.quantity;

          return (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {cropMeta.emoji || '🌾'}
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">{listing.produce}</h3>
                      <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {listing.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-lg font-black text-slate-900">
                    ₹{listing.pricePerKg}<span className="text-xs font-normal text-slate-500">/kg</span>
                  </span>
                </div>

                {/* Farmer / FPO Info */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-800">{listing.farmerName}</div>
                  <div className="text-slate-500 font-medium">{listing.fpoName}</div>
                  <div className="flex items-center gap-1.5 text-slate-600 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.location}, UP</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Available Supply</span>
                    <span className="font-extrabold text-emerald-700">{formatWeight(availableQty)}</span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Quality Grade</span>
                    <span className="font-bold text-slate-800">{listing.qualityGrade || 'Grade A'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Ready from: {listing.availableFrom || 'Immediate'}
                </span>

                <button
                  onClick={() => handleOpenBuy(listing)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Buy Produce
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <p className="font-bold text-base">No listings match your selected filters</p>
          <p className="text-xs mt-1">Try broadening your search query, increasing price, or selecting "All Categories".</p>
        </div>
      )}

      {/* NORMAL PURCHASE MODAL */}
      {purchasingListing && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPurchasingListing(null);
          }}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 bg-gradient-to-r from-brand-700 to-brand-800 text-white p-4 sm:p-5 flex items-center justify-between border-b border-brand-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                  Direct Order from Farmer
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Buy {purchasingListing.produce}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPurchasingListing(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Internally Scrollable) */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4 text-xs sm:text-sm"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-xs">Source Farmer / FPO</span>
                  <span className="font-bold text-slate-900">{purchasingListing.farmerName}</span>
                  <span className="text-slate-500 block text-xs">{purchasingListing.location}, UP</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-xs">Rate</span>
                  <span className="text-base font-bold text-slate-900">₹{purchasingListing.pricePerKg}/kg</span>
                </div>
              </div>

              {/* Quantity Input with Unit Toggle */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex justify-between items-center">
                  <span>Quantity to Purchase:</span>
                  <span className="text-brand-700 font-extrabold text-xs">
                    {buyUnit === 'Quintal'
                      ? `${buyQuantity} Quintal = ${(buyQuantity * 100).toLocaleString()} kg`
                      : `${buyQuantity} kg`}
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={buyUnit === 'Quintal' ? Math.floor((purchasingListing.availableQuantity || purchasingListing.quantity) / 100) || 1 : (purchasingListing.availableQuantity || purchasingListing.quantity)}
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Math.max(1, Number(e.target.value)))}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-800"
                  />
                  <select
                    value={buyUnit}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      if (newUnit === 'Quintal' && buyUnit === 'kg') {
                        setBuyQuantity(Math.max(1, Math.round(buyQuantity / 100)));
                      } else if (newUnit === 'kg' && buyUnit === 'Quintal') {
                        setBuyQuantity(buyQuantity * 100);
                      }
                      setBuyUnit(newUnit);
                    }}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="kg">KG</option>
                    <option value="Quintal">Quintal (100 kg)</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-1 flex-wrap">
                  {buyUnit === 'Quintal' ? (
                    [1, 2, 5, 10].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setBuyQuantity(qty)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        {qty} Q ({qty * 100} kg)
                      </button>
                    ))
                  ) : (
                    [5, 10, 25, 50, 100].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setBuyQuantity(qty)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        {qty} kg
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Delivery Choice (Prompt Section 4) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-xs">Delivery Method:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setDeliveryMethod('Self Pickup')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      deliveryMethod === 'Self Pickup'
                        ? 'border-brand-600 bg-brand-50/60 font-bold text-brand-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span>Self Pickup</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">₹0</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal block mt-1">Collect from farm hub</span>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod('Logistics Support')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      deliveryMethod === 'Logistics Support'
                        ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span>Logistics Support</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black">Delivery</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal block mt-1">Direct doorstep drop</span>
                  </div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {deliveryMethod === 'Self Pickup' ? 'Pickup Location:' : 'Delivery Destination City:'}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 font-medium"
                />
              </div>

              {/* Transparent Pricing Live Preview */}
              {(() => {
                const buyQuantityKg = buyUnit === 'Quintal' ? (Number(buyQuantity) || 1) * 100 : (Number(buyQuantity) || 1);
                const pVal = Math.round(buyQuantityKg * purchasingListing.pricePerKg);
                const pricing = calculateTransparentPricing(pVal, buyQuantityKg, 35);
                const isSelfPickup = deliveryMethod === 'Self Pickup';
                const finalLogisticsCost = isSelfPickup ? 0 : pricing.logisticsCost;
                const finalTotal = pVal + finalLogisticsCost + pricing.platformFee;

                return (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="font-bold text-emerald-950 border-b border-emerald-200 pb-1.5 flex items-center justify-between text-xs sm:text-sm">
                      <span>Clear Price Breakdown</span>
                      <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        Zero Hidden Costs
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-700 text-xs sm:text-sm">
                      <span>Farmer Price ({buyUnit === 'Quintal' ? `${buyQuantity} Quintal (${buyQuantityKg} kg)` : `${buyQuantity} kg`} × ₹{purchasingListing.pricePerKg}/kg):</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(pVal)}</span>
                    </div>

                    <div className="flex justify-between text-slate-700 text-xs sm:text-sm">
                      <span>Logistics Charge ({deliveryMethod}):</span>
                      <span className="font-extrabold text-slate-900">
                        {isSelfPickup ? '₹0 (Self Pickup)' : formatCurrency(finalLogisticsCost)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-700 text-xs sm:text-sm">
                      <span>Platform Service Fee:</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(pricing.platformFee)}</span>
                    </div>

                    <div className="pt-2 border-t border-emerald-300 flex justify-between font-black text-sm sm:text-base text-emerald-950">
                      <span>Total Amount to Pay:</span>
                      <span className="text-emerald-800">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions (Sticky at Bottom) */}
            <div className="shrink-0 sticky bottom-0 bg-slate-50 border-t border-slate-200 p-3.5 sm:p-4 flex items-center justify-end gap-3 z-10">
              <button
                type="button"
                onClick={() => setPurchasingListing(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-200/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={orderProcessing}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {orderProcessing ? 'Placing Order...' : 'Confirm Purchase & Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
