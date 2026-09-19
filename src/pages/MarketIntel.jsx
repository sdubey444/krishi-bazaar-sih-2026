import React, { useState, useEffect } from 'react';
import {
  getCropDemandForecast,
  getCropPriceIntelligence,
  getCropSupplyDemandAnalysis
} from '../services/forecastEngine';
import { CROPS } from '../config/crops';
import { store } from '../services/store';
import { formatCurrency, formatWeight, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  HelpCircle,
  Calendar,
  Activity,
  DollarSign,
  Info,
  Layers,
  Store,
  ArrowLeft,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import { locationService } from '../services/locationService';
import { marketDataService } from '../services/marketDataService';
import LocationSelectorModal from '../components/LocationSelectorModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

export default function MarketIntel({ setCurrentView, onOpenAiModal }) {
  const [selectedCropId, setSelectedCropId] = useState('wheat');
  const [listings, setListings] = useState(store.listings || []);
  const [locationContext, setLocationContext] = useState(() => locationService.getLocationContext());
  const [mandiPriceData, setMandiPriceData] = useState(null);
  const [nearbyMandis, setNearbyMandis] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    const unsubStore = store.subscribe(state => {
      setListings(state.listings || []);
    });
    const unsubLoc = locationService.subscribe(loc => {
      setLocationContext(loc);
    });
    return () => {
      unsubStore();
      unsubLoc();
    };
  }, []);

  useEffect(() => {
    let active = true;
    marketDataService.getCommodityMarketPrice(selectedCropId, locationContext).then(data => {
      if (active) setMandiPriceData(data);
    });
    const mandis = locationService.getNearbyMandisForContext(locationContext);
    setNearbyMandis(mandis);
    return () => { active = false; };
  }, [selectedCropId, locationContext]);

  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  const demandForecast = getCropDemandForecast(selectedCropId);
  const priceIntel = getCropPriceIntelligence(selectedCropId);
  const supplyDemand = getCropSupplyDemandAnalysis(selectedCropId, listings);

  const isDemandUp = demandForecast.percentageChange >= 0;
  const isPriceUp = priceIntel.percentageChange >= 0;

  // Quick Selectable Crops for Instant 1-Click Access
  const quickCrops = [
    { id: 'wheat', label: 'Wheat', emoji: '🌾' },
    { id: 'mustard', label: 'Mustard', emoji: '🌼' },
    { id: 'rice', label: 'Rice', emoji: '🍚' },
    { id: 'onion', label: 'Onion', emoji: '🧅' },
    { id: 'tomato', label: 'Tomato', emoji: '🍅' },
    { id: 'potato', label: 'Potato', emoji: '🥔' },
    { id: 'chickpea', label: 'Chickpea', emoji: '🧆' },
    { id: 'maize', label: 'Maize', emoji: '🌽' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Crop Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-brand-900/50 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 uppercase tracking-wider">
                Market Intelligence & Price Trends
              </span>
              <span className="text-xs text-slate-400">Grounded Agricultural Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Market Price & Demand Information
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transparent, crop-specific price intelligence and seasonal demand forecasts. Select any crop below to view supply-demand balance and regression trends.
            </p>
          </div>

          {/* Dynamic Crop Dropdown Selector */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 shadow-inner space-y-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
              <span>Select Crop / Produce:</span>
              <span className="text-brand-400 font-semibold">{selectedCrop.category}</span>
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full sm:w-64 py-2.5 px-3 rounded-xl bg-slate-900 border border-brand-500/40 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            >
              {CROPS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} ({c.category})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 block text-right">
              Updates price graphs and insights instantly
            </span>
          </div>
        </div>

        {/* Quick Crop Selector Pills */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Quick Select:</span>
          {quickCrops.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedCropId(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCropId === item.id
                  ? 'bg-brand-500 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* LOCATION CONTEXT & SELECTOR BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Active Agricultural Location
            </span>
            <span className="text-sm font-black text-slate-900">
              {locationContext.mandi ? `${locationContext.mandi}, ` : ''}{locationContext.district}, {locationContext.state}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">
              ({locationContext.source === 'gps' ? 'GPS Verified' : locationContext.isManual ? 'Selected Manually' : 'Regional Default'})
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>Change Location</span>
        </button>
      </div>

      {/* LOCATION-AWARE REAL MANDI QUOTE CARD */}
      {mandiPriceData && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mandi Benchmark Rate
                </span>
                {mandiPriceData.status === 'Verified current' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase border border-emerald-300">
                    Verified Current
                  </span>
                ) : mandiPriceData.status === 'Latest available online data' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase border border-blue-300">
                    Latest Available Online Data
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase border border-amber-300">
                    Sample Benchmark Data (Agmarknet 2026)
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <span>{selectedCrop.emoji}</span>
                <span>{selectedCrop.name}</span>
                {mandiPriceData.variety && (
                  <span className="text-xs font-normal text-slate-500">({mandiPriceData.variety})</span>
                )}
              </h2>
            </div>

            <div className="text-right">
              {mandiPriceData.pricePerKg ? (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-brand-800">
                    ₹{mandiPriceData.pricePerKg} <span className="text-sm font-semibold text-slate-600">/ kg</span>
                  </span>
                  <span className="text-xs text-slate-500 block font-semibold">
                    (₹{mandiPriceData.pricePerQuintal || (mandiPriceData.pricePerKg * 100)} / Quintal)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-amber-800">
                    ₹{priceIntel.currentPrice} <span className="text-sm font-semibold text-slate-600">/ kg</span>
                  </span>
                  <span className="text-xs text-amber-700 block font-semibold">
                    (Sample Benchmark Rate • Local Feed Pending)
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Mandi / Market Yard</span>
              <span className="font-bold text-slate-800">{mandiPriceData.mandi}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">District & State</span>
              <span className="font-bold text-slate-800">{mandiPriceData.district}, {mandiPriceData.state}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Date Recorded</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {mandiPriceData.recordedDate || 'Pending Live Verification'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Authentic Source</span>
              <span className="font-bold text-slate-800 truncate block" title={mandiPriceData.source}>
                {mandiPriceData.source}
              </span>
            </div>
          </div>

          {mandiPriceData.note && (
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              ℹ️ {mandiPriceData.note}
            </p>
          )}
        </div>
      )}

      {/* TRANSPARENT DATA SOURCE BADGE / NOTICE */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <span className="font-extrabold block text-blue-900">
              Verified Agricultural Reference & Predictive AI Modeling
            </span>
            <span className="text-blue-800/80">
              Prices and demand metrics are grounded in regional Mandi benchmark datasets and platform listings. Data is categorized as Reference / Estimated (demonstrating AI forecasting and advisory workflows for SIH evaluation).
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-blue-200/70 text-blue-900 font-extrabold text-[11px] uppercase tracking-wider">
            Sample Benchmark Data
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-200/70 text-emerald-950 font-extrabold text-[11px] uppercase tracking-wider">
            Predictive Model Demo
          </span>
        </div>
      </div>

      {/* SECTION 1: SUPPLY-DEMAND ANALYSIS & CROP RECOMMENDATION */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                {supplyDemand.recommendationBadge}
              </span>
              <span className="text-xs text-slate-500 font-semibold">Supply-Demand Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>{supplyDemand.emoji}</span>
              <span>{supplyDemand.cropName} — Supply-Demand Balance & Recommendation</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
              Reference Price: ₹{supplyDemand.referencePrice}/kg
            </span>
          </div>
        </div>

        {/* 3 Core Factors: Demand + Supply + Competition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">1. Expected Demand Level</span>
            <span className="text-lg font-black text-emerald-700 block">
              {supplyDemand.expectedDemand}
            </span>
            <span className="text-[11px] text-slate-500">Derived from 6-month Mandi trend regression</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">2. Market Supply Status</span>
            <span className="text-lg font-black text-blue-700 block">
              {supplyDemand.expectedSupply}
            </span>
            <span className="text-[11px] text-slate-500">Regional buffer stock & Mandi arrivals</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">3. Producer Competition</span>
            <span className="text-lg font-black text-amber-700 block">
              {supplyDemand.marketCompetition}
            </span>
            <span className="text-[11px] text-slate-500">
              {supplyDemand.activeFarmersCount} active listings ({formatWeight(supplyDemand.activeSupplyKg)})
            </span>
          </div>
        </div>

        {/* Advisory Recommendation Callout */}
        <div className={`p-4 rounded-2xl border ${
          selectedCropId === 'mustard'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : selectedCropId === 'wheat'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-blue-50 border-blue-300 text-blue-950'
        } space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="font-black text-sm uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Advisory Recommendation: {supplyDemand.recommendation}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/70">
              Crop Advisory
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            {supplyDemand.rationale}
          </p>
          <span className="text-[10px] opacity-75 block italic pt-1 border-t border-black/10">
            {supplyDemand.disclaimer}
          </span>
        </div>
      </div>

      {/* SECTION 2: EXPECTED DEMAND ANALYSIS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                Demand Forecasting
              </span>
              <span className="text-xs text-slate-500 font-semibold">Seasonal Volume Telemetry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>{demandForecast.emoji}</span>
              <span>{demandForecast.cropName} — Expected Market Demand</span>
            </h2>
          </div>

          <button
            onClick={() => onOpenAiModal && onOpenAiModal(selectedCropId)}
            className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200 shadow-xs transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            Ask AI Assistant About {demandForecast.cropName}
          </button>
        </div>

        {/* Demand Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Current Market Demand</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {formatWeight(demandForecast.currentDemand)}
            </span>
            <span className="text-[11px] text-slate-400">Current month volume</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-700 block font-semibold">Expected Demand (Next Cycle)</span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">
              {formatWeight(demandForecast.forecastDemand)}
            </span>
            <span className="text-[11px] text-emerald-700">Projected requirement</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-xs text-blue-700 block font-semibold">Expected Demand Trend</span>
            <div className="flex items-center gap-1 mt-1">
              {isDemandUp ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              )}
              <span className={`text-xl font-black ${isDemandUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatPercent(demandForecast.percentageChange)}
              </span>
            </div>
            <span className="text-[11px] text-blue-600">Demand is {demandForecast.trend}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Market Availability</span>
            <span className="text-base font-bold text-slate-800 mt-1 block">
              {demandForecast.supplyStatus}
            </span>
            <span className="text-[11px] text-slate-500">Regional stock buffer</span>
          </div>
        </div>

        {/* Recharts Demand Bar Chart */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">6-Month Past Demand (kg) vs. Expected Next Cycle</span>
            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded font-medium">
              Statistical Least-Squares Regression
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandForecast.chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} kg`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="demand" name="Past Months Demand (kg)" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="forecast" name="Expected Demand (kg)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Signal Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-brand-600" />
            Market Signal & Insights:
          </div>
          <p className="text-slate-600 leading-relaxed">{demandForecast.marketSignal}</p>
          <p className="text-slate-500 pt-1 border-t border-slate-200/80">
            <strong>Supply Chain Telemetry:</strong> {demandForecast.aiInsight}
          </p>
        </div>
      </div>

      {/* SECTION 3: AGRICULTURAL PRICE INFORMATION & TREND */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase">
                Price Intelligence
              </span>
              <span className="text-xs text-slate-500 font-semibold">Reference Pricing Telemetry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>{priceIntel.emoji}</span>
              <span>{priceIntel.cropName} — Reference Price & Estimated Trend</span>
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Reference Mandi Rate</span>
            <span className="text-2xl font-black text-slate-900">₹{priceIntel.currentPrice}/kg</span>
          </div>
        </div>

        {/* Price Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Reference Price (Demo Data)</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              ₹{priceIntel.currentPrice}/{priceIntel.unit}
            </span>
            <span className="text-[11px] text-slate-400">Benchmark mandi rate</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-xs text-amber-700 block font-semibold">Estimated Price (Next Cycle)</span>
            <span className="text-xl font-black text-amber-900 mt-1 block">
              ₹{priceIntel.estimatedPrice}/{priceIntel.unit}
            </span>
            <span className="text-[11px] text-amber-700">Projected trend price</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Expected Price Trend</span>
            <div className="flex items-center gap-1 mt-1">
              {isPriceUp ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              )}
              <span className={`text-xl font-black ${isPriceUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatPercent(priceIntel.percentageChange)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Price direction is {priceIntel.trend}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Data Classification</span>
            <span className="text-xs font-bold text-slate-700 mt-1 block">
              Reference Benchmark
            </span>
            <span className="text-[11px] text-slate-400">Regional platform records</span>
          </div>
        </div>

        {/* Recharts Price History & Trend Line Chart */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Mandi Price History & Estimated Trend (₹/kg)</span>
            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded font-medium">
              Reference Mandi Datasets
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceIntel.chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 3', 'dataMax + 3']} />
                <Tooltip
                  formatter={(val) => [`₹${val}/kg`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="price"
                  name="Past Mandi Reference Rate (₹/kg)"
                  stroke="#15803d"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#15803d' }}
                />
                <Line
                  type="monotone"
                  dataKey="estimatedPrice"
                  name="Estimated Market Trend (₹/kg)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  dot={{ r: 5, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION: NEARBY MANDI DISCOVERY */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                India-Wide Mandi Network
              </span>
              <span className="text-xs text-slate-500 font-semibold">APMC Discovery</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Nearby Mandis & Market Yards in {locationContext.state}</span>
            </h3>
          </div>

          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
          >
            Change Location
          </button>
        </div>

        {nearbyMandis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearbyMandis.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{m.mandiName}</h4>
                  {m.distanceKm != null && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                      ~{m.distanceKm} km
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{m.district}, {m.state}</span>
                  </div>

                  {m.majorCrops && m.majorCrops.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {m.majorCrops.map(cropName => (
                        <span key={cropName} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 capitalize">
                          {cropName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Source: State APMC Portal</span>
                  <span className="text-emerald-700 font-semibold">Verified Market</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
            <AlertCircle className="w-6 h-6 mx-auto text-slate-400 mb-1" />
            <p className="font-bold">Nearby mandi data unavailable.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Please select another district or state to view verified mandis.</p>
          </div>
        )}
      </div>

      {/* QUICK PROCUREMENT & NAVIGATION CARDS */}
      {setCurrentView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block text-sm">Need to buy {selectedCrop.name}?</span>
              <span className="text-xs text-slate-500">Order directly with smart supply matching</span>
            </div>
            <button
              onClick={() => setCurrentView('bulk-requirement')}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              Buy Produce
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block text-sm">View Active {selectedCrop.name} Listings</span>
              <span className="text-xs text-slate-500">Check current farmer lots in the marketplace</span>
            </div>
            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              Marketplace
            </button>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

    </div>
  );
}

