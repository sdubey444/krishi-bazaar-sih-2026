import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { formatCurrency, formatWeight } from '../utils/formatters';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Navigation,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetails({ orderId, setCurrentView, setSelectedOrderId }) {
  const [orders, setOrders] = useState(store.orders);
  const [currentUser, setCurrentUser] = useState(store.currentUser);

  useEffect(() => {
    return store.subscribe(state => {
      setOrders(state.orders);
      setCurrentUser(state.currentUser);
    });
  }, []);

  const order = orders.find(o => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs mt-1">Please return to the marketplace or orders dashboard.</p>
        <button
          onClick={() => setCurrentView('my-orders')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  const isSelfPickup = Boolean(
    order.fulfillmentMethod === 'self_pickup' ||
    order.logisticsOption === 'self_pickup' ||
    order.deliveryMethod === 'Self Pickup' ||
    order.isSelfPickup ||
    order.logisticsCost === 0
  );

  // Status Progression Flows:
  // Standard Logistics: Confirmed → Logistics Assigned/Pickup Planned → In Transit → Delivered
  // Self Pickup: Confirmed → Self Pickup Scheduled → Collected
  const logisticsStatuses = [
    'Confirmed',
    'Logistics Assigned/Pickup Planned',
    'In Transit',
    'Delivered'
  ];

  const selfPickupStatuses = [
    'Confirmed',
    'Self Pickup Scheduled',
    'Collected'
  ];

  const statuses = isSelfPickup ? selfPickupStatuses : logisticsStatuses;

  const getActiveStatusIndex = () => {
    const s = order.status;
    if (isSelfPickup) {
      if (s === 'Collected' || s === 'Delivered') return 2;
      if (s === 'Self Pickup Scheduled' || s === 'Pickup Planned') return 1;
      return 0; // 'Confirmed' or 'Order Confirmed'
    } else {
      if (s === 'Delivered') return 3;
      if (s === 'In Transit') return 2;
      if (s === 'Logistics Assigned/Pickup Planned' || s === 'Logistics Assigned' || s === 'Pickup Planned') return 1;
      return 0; // 'Confirmed' or 'Order Confirmed'
    }
  };

  const currentStatusIndex = getActiveStatusIndex();

  const handleProgressStatus = (nextStatus) => {
    store.updateOrderStatus(order.id, nextStatus);
  };

  const handleBack = () => {
    if (currentUser?.role === 'farmer') {
      setCurrentView('farmer-dashboard');
    } else if (currentUser?.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('my-orders');
    }
  };

  const farmerName = order.farmerName || order.fpoName || (order.allocations?.map(a => a.farmerName || a.fpoName).join(', ')) || 'Krishi Verified Farmer';
  const priceKg = order.pricePerKg || order.allocations?.[0]?.pricePerKg || 28;
  const produceAmount = order.produceAmount || order.farmerProduceValue || (priceKg * (order.totalQuantity || order.quantity || 1));
  const charges = (order.logisticsCost || 0) + (order.platformFee || 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentUser?.role === 'farmer' ? 'Back to Received Orders' : 'Back to My Orders'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Order Reference:</span>
          <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            {order.id}
          </span>
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase">
                {isSelfPickup ? 'Self Pickup Order' : 'Logistics Delivery Order'}
              </span>
              <span className="text-xs text-slate-400">
                Order Date: <strong className="text-slate-700">{new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {order.quantityDisplay || `${order.quantity || order.totalQuantity} ${order.unit || 'KG'}`} of {order.produce}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                Farmer / FPO: <strong className="text-brand-800">{farmerName}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold">
                Price: <strong className="text-slate-900">₹{priceKg}/kg</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Destination: <strong className="text-slate-800">{order.buyerName} ({order.destination})</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Transaction Amount</span>
            <span className="text-2xl sm:text-3xl font-black text-brand-800">
              {formatCurrency(order.totalAmount)}
            </span>
            <div className="mt-1.5">
              <StatusBadge status={order.status} className="text-xs px-3.5 py-1 font-bold" />
            </div>
          </div>
        </div>

        {/* INTERACTIVE STATUS TIMELINE */}
        <div className="pt-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Order Status Progression ({isSelfPickup ? 'Self Pickup Flow' : 'Logistics Delivery Flow'})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current Stage: <strong className="text-brand-800">{order.status}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentStatusIndex < statuses.length - 1 && (
                <button
                  onClick={() => handleProgressStatus(statuses[currentStatusIndex + 1])}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5 min-h-[36px]"
                >
                  <span>Advance Status to {statuses[currentStatusIndex + 1]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isSelfPickup ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3 pt-2`}>
            {statuses.map((st, idx) => {
              const isPassed = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;

              return (
                <button
                  key={st}
                  onClick={() => handleProgressStatus(st)}
                  className={`p-4 rounded-2xl border text-left transition-all min-h-[64px] ${
                    isCurrent
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-300'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  title={`Click to set status to "${st}"`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>Step #{idx + 1}</span>
                    {isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Clock className="w-4 h-4 text-slate-400 shrink-0" />}
                  </div>
                  <div className={`font-extrabold text-xs mt-2 ${isCurrent ? 'text-white' : isPassed ? 'text-emerald-950' : 'text-slate-600'}`}>
                    {st}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 gap-2">
            <span className="font-semibold text-slate-700">ℹ️ Interactive Prototype Milestone Tracking (Click any step to simulate workflow)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
              Simulated Tracking Workflow
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transparent Pricing Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Transparent Pricing
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Zero Hidden Charges
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Farmer Produce Value</span>
                  <span className="text-[11px] text-slate-500">Paid 100% directly to farmers</span>
                </div>
                <span className="font-extrabold text-slate-900 text-base">
                  {formatCurrency(produceAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Logistics ({isSelfPickup ? 'Self Pickup' : 'Logistics Support'})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isSelfPickup ? 'Direct pickup by buyer' : 'Commercial vehicle freight'}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900 text-base">
                  {isSelfPickup ? '₹0' : formatCurrency(order.logisticsCost || 350)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Platform Service Fee</span>
                  <span className="text-[11px] text-slate-500">Quality checking and escrow security</span>
                </div>
                <span className="font-extrabold text-slate-900 text-base">
                  {formatCurrency(order.platformFee !== undefined ? order.platformFee : Math.round(produceAmount * 0.015))}
                </span>
              </div>

              <div className="pt-3 border-t-2 border-dashed border-slate-200 flex items-center justify-between text-base font-black text-brand-900">
                <span>Total Amount:</span>
                <span className="text-xl text-brand-800">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200/60 text-xs text-brand-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                Farmers receive 100% of their produce value directly with zero middleman deductions.
              </span>
            </div>

            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/80 text-[11px] text-purple-950 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-purple-900">
                  Prototype Digital Escrow Status
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                  Escrow Hold (Demo)
                </span>
              </div>
              <p className="leading-relaxed text-purple-900">
                Payment verified under prototype escrow protection. Farmer payout of {formatCurrency(produceAmount)} is guaranteed upon physical delivery confirmation. Commercial production integrates RazorpayX / NPCI UPI AutoPay.
              </p>
            </div>
          </div>

          {/* Delivery & Route Card (Self Pickup vs Logistics Partner) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <Truck className="w-4 h-4" />
                <span>Delivery Fulfillment</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                {order.deliveryMethod || (order.logisticsCost === 0 ? 'Self Pickup' : 'Logistics Support')}
              </span>
            </div>

            {order.deliveryMethod === 'Self Pickup' || order.logisticsCost === 0 ? (
              <div className="space-y-2">
                <h4 className="font-bold text-base text-white">
                  Self Pickup by Buyer
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Logistics Charge: <strong>₹0</strong>. Collect produce directly from {order.allocations?.length || 1} farm collection points.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <h4 className="font-bold text-base text-white">
                  Verified Vehicle & Route Plan
                </h4>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Vehicle:</span>
                    <strong className="text-white">
                      {order.assignedPartner?.vehicleModel || '10 Ton Commercial Truck'} ({order.assignedPartner?.capacityTons || 10} Ton)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Number Plate:</span>
                    <strong className="font-mono text-amber-300 font-bold">
                      {order.assignedPartner?.vehicleNumber || 'UP78 BT 5678'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Logistics Partner:</span>
                    <strong className="text-white">
                      {order.assignedPartner?.name || 'Vikram Singh'}
                    </strong>
                  </div>
                  {order.partnerEarning ? (
                    <div className="flex justify-between pt-1 border-t border-slate-700 text-emerald-400 font-bold">
                      <span>Partner Earning:</span>
                      <span>{formatCurrency(order.partnerEarning)}</span>
                    </div>
                  ) : null}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Optimized multi-stop pickup from {order.allocations?.length || 1} farm locations to destination {order.destination}.
                </p>

                <button
                  onClick={() => setCurrentView('logistics')}
                  className="w-full mt-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Navigation className="w-4 h-4" />
                  View Optimized Pickup Route Map
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Farmer Allocations Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Aggregated Farmer Allocations ({order.allocations?.length || 1} Farmers)
            </h3>

            <div className="space-y-3">
              {order.allocations?.map((alloc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{alloc.farmerName}</div>
                    <div className="text-slate-500">{alloc.fpoName || 'Local FPO'}</div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{alloc.location}</span>
                      <span className="mx-1 text-slate-300">•</span>
                      <span className="font-semibold text-brand-700">{alloc.qualityGrade || 'Grade A'}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs text-slate-500 block">Allocated Tonnage</span>
                    <span className="text-base font-black text-emerald-800 block">
                      {formatWeight(alloc.allocatedQuantity)}
                    </span>
                    <span className="text-xs text-slate-700 font-bold block">
                      Rate: ₹{alloc.pricePerKg}/kg
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      Payout: {formatCurrency(alloc.farmerEarnings)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
