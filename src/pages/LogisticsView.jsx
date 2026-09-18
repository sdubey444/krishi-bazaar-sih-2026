import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { optimizePickupRoute } from '../services/routeOptimizer';
import { getCoordinatesForLocation } from '../data/coordinates';
import {
  Truck,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import RouteMap from '../components/RouteMap';
import { formatWeight } from '../utils/formatters';

export default function LogisticsView({ setCurrentView }) {
  const [orders, setOrders] = useState(store.orders);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // The canonical SIH demo stops:
  // Farmer A (Prayagraj) -> Farmer B (Kanpur) -> Farmer C (Unnao) -> Buyer (Lucknow)
  const defaultWheatPickups = [
    {
      farmerName: 'Ramesh Patel (Farmer A)',
      location: 'Prayagraj',
      coordinates: getCoordinatesForLocation('Prayagraj'),
      allocatedQuantity: 3000,
      crop: 'Wheat'
    },
    {
      farmerName: 'Suresh Verma (Farmer B)',
      location: 'Kanpur',
      coordinates: getCoordinatesForLocation('Kanpur'),
      allocatedQuantity: 2500,
      crop: 'Wheat'
    },
    {
      farmerName: 'Mahesh Yadav (Farmer C)',
      location: 'Unnao',
      coordinates: getCoordinatesForLocation('Unnao'),
      allocatedQuantity: 4500,
      crop: 'Wheat'
    }
  ];

  const [activePickups, setActivePickups] = useState(defaultWheatPickups);
  const [destination, setDestination] = useState('Lucknow');
  const [routeResult, setRouteResult] = useState(null);

  useEffect(() => {
    return store.subscribe(state => {
      setOrders(state.orders);
    });
  }, []);

  // Recalculate route whenever pickups or destination changes
  useEffect(() => {
    const res = optimizePickupRoute(activePickups, destination);
    setRouteResult(res);
  }, [activePickups, destination]);

  const handleSelectOrder = (e) => {
    const ordId = e.target.value;
    setSelectedOrderId(ordId);
    if (!ordId) {
      // Revert to canonical 3-farmer wheat demo
      setActivePickups(defaultWheatPickups);
      setDestination('Lucknow');
      return;
    }

    const found = orders.find(o => o.id === ordId);
    if (found && found.allocations && found.allocations.length > 0) {
      setActivePickups(
        found.allocations.map(a => ({
          farmerName: a.farmerName,
          location: a.location,
          coordinates: getCoordinatesForLocation(a.location),
          allocatedQuantity: a.allocatedQuantity,
          crop: found.produce
        }))
      );
      setDestination(found.destination || 'Lucknow');
    }
  };

  const handleResetCanonicalDemo = () => {
    setSelectedOrderId('');
    setActivePickups(defaultWheatPickups);
    setDestination('Lucknow');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              Smart Delivery & Route Planning
            </span>
            <span className="text-xs text-slate-500 font-semibold">Consolidated Pickup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Delivery & Pickup Route
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Collects produce from each farmer in one single vehicle journey before delivering to the buyer, saving fuel and travel cost for everyone.
          </p>
        </div>

        {/* Demo Route Reset Button */}
        <button
          onClick={handleResetCanonicalDemo}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow flex items-center gap-2 transition-colors min-h-[44px]"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          Load Demo Route (Prayagraj → Kanpur → Unnao → Lucknow)
        </button>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-brand-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Select Order to View Route:</span>
          <select
            value={selectedOrderId}
            onChange={handleSelectOrder}
            className="text-xs font-semibold py-2 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 min-h-[40px]"
          >
            <option value="">Demo 3-Farmer Wheat Route (10,000 kg)</option>
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                {o.id} — {o.produce} ({formatWeight(o.totalQuantity)}) → {o.destination}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Stops: <strong className="text-slate-800">{activePickups.length} Farmer Pickups</strong> → 1 Buyer Delivery Hub
        </div>
      </div>

      {/* Main Route Map Component */}
      {routeResult && <RouteMap routeData={routeResult} />}

      {/* Clear Explanation of Benefits */}
      <div className="bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>How Consolidated Delivery Works</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            How One Planned Route Saves Transport Cost for Farmers & Buyers
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Normally, each farmer has to arrange their own small tractor or truck to deliver goods, which is expensive and wasteful.
            Krishi Bazaar groups nearby farm pickups into a single sequence: the truck stops at each farm along the highway, loads the produce, and delivers everything directly to the buyer's destination.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="text-emerald-300 font-bold block text-sm">1. Distance Calculation</span>
              <span className="text-slate-300 text-[11px] mt-1 block">Calculates exact road distance between farms and delivery point.</span>
            </div>
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="text-emerald-300 font-bold block text-sm">2. Sequential Pickup</span>
              <span className="text-slate-300 text-[11px] mt-1 block">Truck starts from the furthest farm and collects along the road toward the buyer.</span>
            </div>
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="text-emerald-300 font-bold block text-sm">3. Single Shared Trip</span>
              <span className="text-slate-300 text-[11px] mt-1 block">Replaces multiple separate trips with one full truckload delivery.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
