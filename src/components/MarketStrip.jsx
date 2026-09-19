import React, { useState, useEffect } from 'react';
import { marketDataService } from '../services/marketDataService';
import { locationService } from '../services/locationService';
import { TrendingUp, ShieldCheck, Clock, MapPin } from 'lucide-react';

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
          <span className="text-[9px] font-bold text-emerald-300">
            [Verified]
          </span>
        );
      case 'Latest available online data':
        return (
          <span className="text-[9px] font-bold text-blue-300">
            [Latest Online]
          </span>
        );
      case 'Sample Benchmark Data':
      case 'Prototype Demo':
      default:
        return (
          <span className="text-[9px] font-bold text-amber-300">
            [Sample Data]
          </span>
        );
    }
  };

  // Duplicate the list so the horizontal marquee loops smoothly without gap
  const marqueeItems = [...stripPrices, ...stripPrices];

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-slate-800/80 h-9 flex items-center overflow-hidden text-xs select-none shadow-inner">
      {/* Fixed Left Header Badge */}
      <div className="flex items-center gap-1.5 px-3 sm:px-4 bg-slate-900 border-r border-slate-800 z-10 h-full shrink-0 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="font-black text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-300 flex items-center gap-1 shrink-0">
          <TrendingUp className="w-3 h-3 text-amber-400" />
          <span>Mandi Ticker:</span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-slate-400 pl-1 border-l border-slate-700/60 shrink-0">
          <MapPin className="w-2.5 h-2.5 text-slate-400" />
          {locationContext.district || locationContext.state}
        </span>
      </div>

      {/* Smooth Continuous Marquee Ticker */}
      <div className="overflow-hidden whitespace-nowrap flex-1 relative flex items-center h-full">
        <div className="animate-ticker flex items-center gap-5 py-0.5 pl-3">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.cropId}_${idx}`}
              onClick={() => onOpenMarketIntel && onOpenMarketIntel(item.cropId)}
              className="inline-flex items-center gap-1.5 text-xs hover:text-white cursor-pointer transition-colors shrink-0"
              title={`Source: ${item.source} (${item.recordedDate || 'Benchmark Record'})`}
            >
              <span className="font-bold text-slate-300 text-[11px]">{item.name}</span>
              {item.pricePerKg ? (
                <span className="font-black text-emerald-400 text-[11px]">₹{item.pricePerKg}/kg</span>
              ) : (
                <span className="text-slate-400 text-[11px] italic">Rate Unverified</span>
              )}
              {getStatusBadge(item.status)}
              <span className="text-slate-600 text-[10px]">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Right Source Indicator */}
      <div className="hidden lg:flex items-center px-3 text-[10px] text-slate-400 bg-slate-900 border-l border-slate-800 z-10 h-full shrink-0">
        Source: <strong className="text-slate-300 ml-1">Agmarknet / APMC</strong>
      </div>
    </div>
  );
}
