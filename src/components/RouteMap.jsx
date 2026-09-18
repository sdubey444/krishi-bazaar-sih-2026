import React, { useState } from 'react';
import { MapPin, Navigation, Truck, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatWeight } from '../utils/formatters';

export default function RouteMap({ routeData }) {
  const [activeStop, setActiveStop] = useState(null);

  if (!routeData || !routeData.pickupSequence || routeData.pickupSequence.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
        <Navigation className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="font-medium">No pickup route calculated yet</p>
        <p className="text-xs text-slate-400">Add farmer allocations to generate the optimized multi-stop route.</p>
      </div>
    );
  }

  const { pickupSequence, destination, totalDistanceKm, estimatedHours, legs } = routeData;

  // Normalized coordinate projection for the Uttar Pradesh logistics corridor
  // Latitude ~25.0 to 27.2, Longitude ~79.8 to 83.2
  const minLat = 25.0, maxLat = 27.2;
  const minLng = 79.8, maxLng = 83.2;

  const projectCoord = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Invert y because SVG y goes downwards
    const y = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  const points = [
    ...pickupSequence.map((p, idx) => ({
      ...p,
      type: 'pickup',
      step: idx + 1,
      name: `${p.farmerName} (${p.location})`,
      proj: projectCoord(p.coordinates.lat, p.coordinates.lng)
    })),
    {
      type: 'destination',
      step: pickupSequence.length + 1,
      farmerName: 'Buyer Delivery Hub',
      location: destination.location,
      coordinates: destination.coordinates,
      allocatedQuantity: pickupSequence.reduce((s, p) => s + (p.allocatedQuantity || 0), 0),
      name: `Destination: ${destination.location}`,
      proj: projectCoord(destination.coordinates.lat, destination.coordinates.lng)
    }
  ];

  // Build SVG path
  const svgPoints = points.map(p => `${p.proj.x},${p.proj.y}`).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Planned Delivery Route
            </span>
            <span className="text-xs text-slate-400">Shortest Highway Sequence</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Farm Pickup Stops & Delivery Map</h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">Total Route Distance</span>
            <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" /> {totalDistanceKm} km
            </span>
          </div>

          <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">Estimated Driving Time</span>
            <span className="text-base font-bold text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~{estimatedHours} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Map Canvas */}
      <div className="relative bg-slate-950 p-6 select-none overflow-hidden" style={{ minHeight: '340px' }}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Map Watermark / Regional Badge */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Central UP Agritech Logistics Corridor (NH-19 / NH-27)</span>
        </div>

        {/* SVG Route Topology */}
        <svg className="w-full h-72 sm:h-80 relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Connecting highway lines */}
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.8"
            strokeDasharray="3 2"
            points={svgPoints}
            className="opacity-70 animate-pulse"
          />
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="1.2"
            points={svgPoints}
            className="opacity-90"
          />
        </svg>

        {/* Render interactive coordinate nodes */}
        {points.map((pt, i) => {
          const isDest = pt.type === 'destination';
          const isSelected = activeStop === i;

          return (
            <div
              key={i}
              onClick={() => setActiveStop(isSelected ? null : i)}
              style={{ left: `${pt.proj.x}%`, top: `${pt.proj.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              {/* Pulsing ring */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform ${
                  isDest
                    ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 group-hover:scale-110'
                    : 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 group-hover:scale-110'
                }`}
              >
                {isDest ? '🏁' : pt.step}
              </div>

              {/* Node Card Tooltip */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-slate-900/95 backdrop-blur-md border ${
                  isDest ? 'border-rose-500/50' : 'border-emerald-500/50'
                } text-white px-3 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none transition-all ${
                  isSelected ? 'opacity-100 scale-100 z-30' : 'opacity-90 group-hover:opacity-100'
                }`}
              >
                <div className="font-semibold flex items-center gap-1">
                  <span>{pt.location}</span>
                  <span className="text-[10px] text-slate-400">({isDest ? 'Delivery' : `Stop #${pt.step}`})</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {isDest ? 'Consolidated Dropoff' : `${formatWeight(pt.allocatedQuantity)}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sequenced Route Waypoints Checklist */}
      <div className="p-5 bg-slate-50 border-t border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Planned Route: Pickups → Final Delivery
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {legs.map((leg, index) => {
            const isDelivery = leg.type === 'delivery';
            return (
              <div
                key={index}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  isDelivery
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                    isDelivery ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isDelivery ? 'Final Delivery' : `Pickup Stop #${leg.stepNumber}`}
                  </span>
                  <span className="text-slate-500 font-semibold">{leg.distanceKm} km</span>
                </div>

                <div className="mt-2 font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{leg.to}</span>
                </div>

                <div className="mt-1 text-slate-500 text-[11px] truncate">
                  {isDelivery ? 'Buyer Location' : leg.farmerName}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{isDelivery ? 'Total Load:' : 'Quantity to Load:'}</span>
                  <span className="font-bold text-slate-700">{formatWeight(leg.quantityKg)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
