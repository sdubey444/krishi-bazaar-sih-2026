import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { CROPS, CROP_CATEGORIES } from '../config/crops';
import { matchSupply } from '../services/matchingEngine';
import { optimizePickupRoute, calculateTransparentPricing } from '../services/routeOptimizer';
import { formatCurrency, formatWeight } from '../utils/formatters';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag,
  Scale
} from 'lucide-react';
import SupplyAggregationView from '../components/SupplyAggregationView';

export default function BulkRequirement({ setCurrentView, setSelectedOrderId }) {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [listings, setListings] = useState(store.listings);

  // Form fields
  const [selectedCropId, setSelectedCropId] = useState('wheat');
  const [requiredQuantity, setRequiredQuantity] = useState(10000);
  const [unit, setUnit] = useState('kg'); // 'kg' or 'Quintal'
  const [targetPricePerKg, setTargetPricePerKg] = useState(30);
  const [deliveryLocation, setDeliveryLocation] = useState('Lucknow');
  const [requiredByDate, setRequiredByDate] = useState('2026-10-25');
  const [qualityGrade, setQualityGrade] = useState('Grade A');

  // Match calculation state
  const [matchResult, setMatchResult] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    return store.subscribe(state => {
      setCurrentUser(state.currentUser);
      setListings(state.listings);
    });
  }, []);

  const normalizedRequiredKg = unit === 'Quintal' ? (Number(requiredQuantity) * 100) : Number(requiredQuantity);

  // Recalculate match when inputs or listings change
  useEffect(() => {
    const selectedCrop = CROPS.find(c => c.id === selectedCropId);
    const requirement = {
      cropId: selectedCropId,
      produce: selectedCrop?.name || 'Wheat',
      requiredQuantity: normalizedRequiredKg || 0,
      targetPricePerKg: Number(targetPricePerKg) || Infinity,
      deliveryLocation,
      qualityGrade
    };

    const result = matchSupply(requirement, listings);
    setMatchResult(result);
  }, [selectedCropId, normalizedRequiredKg, targetPricePerKg, deliveryLocation, qualityGrade, listings]);

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    if (newUnit === 'Quintal') {
      setRequiredQuantity(Math.max(1, Math.round(requiredQuantity / 100)));
    } else {
      setRequiredQuantity(requiredQuantity * 100);
    }
    setUnit(newUnit);
  };

  // Demo Loaders
  const loadWheatDemo = () => {
    setSelectedCropId('wheat');
    setUnit('kg');
    setRequiredQuantity(10000);
    setTargetPricePerKg(30);
    setDeliveryLocation('Lucknow');
    setRequiredByDate('2026-10-25');
    setQualityGrade('Grade A');
  };

  const loadMustardDemo = () => {
    setSelectedCropId('mustard');
    setUnit('kg');
    setRequiredQuantity(10000);
    setTargetPricePerKg(60);
    setDeliveryLocation('Lucknow');
    setRequiredByDate('2026-10-28');
    setQualityGrade('Grade A');
  };

  const handleCreateOrder = (details = {}) => {
    if (!matchResult || matchResult.matchedQuantity === 0) return;
    setIsOrdering(true);

    const selectedCrop = CROPS.find(c => c.id === selectedCropId);

    const orderData = {
      buyerId: currentUser?.id || 'buyer_1',
      buyerName: currentUser?.name || 'Avadh Agro Mills & Retail',
      produce: selectedCrop?.name || 'Wheat',
      cropId: selectedCropId,
      category: selectedCrop?.category || 'Grains',
      totalQuantity: matchResult.matchedQuantity,
      unit: unit,
      orderType: matchResult.isMultiFarmer ? 'Aggregated Supply Order' : 'Direct Farmer Order',
      destination: deliveryLocation,
      deliveryMethod: details.deliveryMethod || 'Logistics Support',
      assignedPartner: details.assignedPartner || null,
      farmerProduceValue: matchResult.totalProduceValue,
      logisticsCost: details.logisticsCost !== undefined ? details.logisticsCost : 0,
      partnerEarning: details.partnerEarning !== undefined ? details.partnerEarning : 0,
      platformFee: details.platformFee || 500,
      totalAmount: details.totalAmount || (matchResult.totalProduceValue + (details.logisticsCost || 0) + (details.platformFee || 500)),
      farmerName: matchResult.isMultiFarmer ? `${matchResult.allocations.length} Farmers (Aggregated)` : (matchResult.allocations[0]?.farmerName || 'Farmer Partner'),
      fpoName: matchResult.allocations[0]?.fpoName || 'FPO Cluster',
      pricePerKg: matchResult.allocations[0]?.pricePerKg || Math.round(matchResult.totalProduceValue / (matchResult.matchedQuantity || 1)),
      displayUnit: unit,
      status: 'Confirmed',
      allocations: matchResult.allocations,
      routeData: details.routeData || optimizePickupRoute(matchResult.allocations, deliveryLocation)
    };

    const newOrder = store.createOrder(orderData);
    setIsOrdering(false);

    if (setSelectedOrderId) setSelectedOrderId(newOrder.id);
    setCurrentView('my-orders');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 uppercase tracking-wider">
              Smart Supply Matching
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Buy Produce & Smart Supply Matching
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Enter any produce requirement in KG or Quintal. Krishi Bazaar automatically matches verified individual farmer lots or dynamically aggregates supply across smallholders for larger orders.
            </p>
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">Quick SIH Demo Presets:</span>
            <button
              onClick={loadWheatDemo}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-xs shadow transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Demo 1: Wheat 10,000 kg (100 Quintal / 4-Farmer Aggregation)
            </button>
            <button
              onClick={loadMustardDemo}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow transition-all flex items-center gap-2"
            >
              <Scale className="w-4 h-4" />
              Demo 2: Mustard 10,000 kg (70% Partial Match)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Enter Purchase Requirement
            </h3>

            {/* Produce Crop Selector */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex justify-between">
                <span>1. What crop do you need? <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-slate-400 font-normal">Select produce</span>
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-bold text-slate-900 text-xs sm:text-sm"
              >
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name} ({c.category}) — Ref Mandi Rate ~₹{c.refPrice}/kg
                  </option>
                ))}
              </select>
            </div>

            {/* Required Quantity with Unit Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex justify-between items-center">
                <span>2. Required Quantity & Unit <span className="text-rose-500">*</span></span>
                <span className="text-blue-700 font-extrabold text-xs">
                  {unit === 'Quintal'
                    ? `${requiredQuantity || 0} Quintal = ${((Number(requiredQuantity) || 0) * 100).toLocaleString()} kg`
                    : `${(Number(requiredQuantity) || 0).toLocaleString()} kg (${((Number(requiredQuantity) || 0) / 100).toFixed(0)} Quintal)`}
                </span>
              </label>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step={unit === 'Quintal' ? '1' : '500'}
                  value={requiredQuantity}
                  onChange={(e) => setRequiredQuantity(Number(e.target.value))}
                  placeholder={unit === 'Quintal' ? 'e.g. 100' : 'e.g. 10000'}
                  className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-black text-slate-900 text-xs sm:text-sm"
                />
                <select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="kg">KG</option>
                  <option value="Quintal">Quintal (100 kg)</option>
                </select>
              </div>

              {/* Quick preset chips */}
              <div className="flex gap-2 pt-1 flex-wrap">
                {unit === 'Quintal' ? (
                  [50, 100, 150, 200].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setRequiredQuantity(q)}
                      className="min-h-[32px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
                    >
                      {q} Q ({(q * 100).toLocaleString()} kg)
                    </button>
                  ))
                ) : (
                  [5000, 10000, 15000, 20000].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setRequiredQuantity(q)}
                      className="min-h-[32px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
                    >
                      {q / 1000}T ({q.toLocaleString()} kg)
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Target Price */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800">
                3. Maximum price you want to pay (₹ per kg): <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={targetPricePerKg}
                  onChange={(e) => setTargetPricePerKg(Number(e.target.value))}
                  placeholder="e.g. 30"
                  className="w-full min-h-[44px] pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-black text-slate-900 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800">
                4. Delivery Destination City: <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Lucknow, Kanpur"
                  className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-semibold text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Required By Date & Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800">5. Required By Date:</label>
                <input
                  type="date"
                  value={requiredByDate}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800">6. Quality Level:</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900"
                >
                  <option value="Grade A">Grade A (Best Quality)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Commercial">Commercial Milling</option>
                </select>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Smart matching runs dynamically against live farmer listings in the database.</span>
            </div>
          </div>
        </div>

        {/* Right Output: Supply Aggregation View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <SupplyAggregationView
            matchResult={matchResult}
            deliveryLocation={deliveryLocation}
            onCreateOrder={handleCreateOrder}
            isOrdering={isOrdering}
          />
        </div>
      </div>
    </div>
  );
}
