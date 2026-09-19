import React, { useState, useEffect } from 'react';
import { marketDataService } from '../services/marketDataService';
import { locationService } from '../services/locationService';
import { TrendingUp, ShieldCheck, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function MarketStrip({ onOpenMarketIntel = null }) {
  const [locationContext, setLocationContext] = useState(() => locationService.getLocationContext());
  const [stripPrices, setStripPrices] = useState(() =>
    marketDataService.getTodayMarketStripPrices(locationService.getLocationContext())
  );

  useEffect(() => {
    return locationService.subscribe(loc => {
      setLocationContext(loc);
      setStripPrices(marketDataService.getTodayMarketStripPrices(loc));
    });
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified current':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-2.5 h-2.5" />
            Verified Current
          </span>
        );
      case 'Latest available online data':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-2.5 h-2.5" />
            Latest Online
          </span>
        );
      case 'Sample Benchmark Data':
      case 'Prototype Demo':
      default:
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-2.5 h-2.5" />
            Sample Data
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 py-2 px-3 sm:px-6 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left Ticker Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Today's Mandi Market Rates
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-400 pl-2 border-l border-slate-700">
            <MapPin className="w-3 h-3 text-slate-500" />
            {locationContext.district || locationContext.state}
          </span>
        </div>

        {/* Scrolling / Flex Items with Truthful Status */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {stripPrices.map((item) => (
            <div
              key={item.cropId}
              onClick={() => onOpenMarketIntel && onOpenMarketIntel(item.cropId)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 transition-colors shrink-0 cursor-pointer"
              title={`Source: ${item.source} (${item.recordedDate || 'Pending Live API'})`}
            >
              <span className="font-bold text-slate-200 text-xs">{item.name}</span>
              {item.pricePerKg ? (
                <span className="font-black text-emerald-400 text-xs">₹{item.pricePerKg}/kg</span>
              ) : (
                <span className="text-slate-400 text-xs italic">Rate Unverified</span>
              )}
              {getStatusBadge(item.status)}
            </div>
          ))}
        </div>

        {/* Right Source Transparency Tag */}
        <div className="hidden xl:block text-[10px] text-slate-400 shrink-0">
          Source: <strong className="text-slate-300">Agmarknet / State APMC Benchmark Records</strong>
        </div>

      </div>
    </div>
  );
}
