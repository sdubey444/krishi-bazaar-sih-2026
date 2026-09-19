import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { formatCurrency, formatWeight } from '../utils/formatters';
import {
  ShoppingBag,
  Layers,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  PackageCheck,
  PlusCircle,
  AlertCircle,
  LogOut,
  Mic,
  Bot
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';

export default function BuyerDashboard({ setCurrentView, setSelectedOrderId, onOpenAiModal, initialTab = 'overview' }) {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [orders, setOrders] = useState(store.orders);
  const [requirements, setRequirements] = useState(store.requirements);
  const [activeTab, setActiveTab] = useState(initialTab === 'orders' ? 'orders' : 'overview');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    return store.subscribe(state => {
      setCurrentUser(state.currentUser);
      setOrders(state.orders);
      setRequirements(state.requirements);
    });
  }, []);

  // Filter orders created by this buyer
  const buyerOrders = orders.filter(o => o.buyerId === currentUser?.id || !currentUser || currentUser.role === 'buyer');

  const totalProcuredKg = buyerOrders.reduce((sum, o) => sum + (o.totalQuantity || 0), 0);
  const totalSpend = buyerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const filteredOrders = buyerOrders.filter(order => {
    if (statusFilter === 'all') return true;
    const isPickup = Boolean(
      order.fulfillmentMethod === 'self_pickup' ||
      order.logisticsOption === 'self_pickup' ||
      order.deliveryMethod === 'Self Pickup' ||
      order.isSelfPickup ||
      order.logisticsCost === 0
    );
    if (statusFilter === 'pickup') return isPickup;
    if (statusFilter === 'logistics') return !isPickup;
    if (statusFilter === 'completed') return order.status === 'Delivered' || order.status === 'Collected';
    if (statusFilter === 'active') return order.status !== 'Delivered' && order.status !== 'Collected';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Buyer Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 uppercase">
                Buyer & Consumer Hub
              </span>
              <span className="text-xs text-slate-300">
                {currentUser?.buyerType || 'Procurement & Consumer'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome, {currentUser?.name || 'Buyer Partner'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Find fresh farm produce, place direct or bulk orders, and track your deliveries.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAiModal}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 active:scale-95 border border-white/20"
              title="Open खरीदार सहायक (Buyer Assistant)"
            >
              <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>खरीदार सहायक (AI)</span>
            </button>

            <button
              onClick={() => {
                store.logout();
                setCurrentView('landing');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 backdrop-blur-sm"
              title="Log out of Buyer account"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs shadow-md transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <ShoppingBag className="w-4 h-4" />
              Buy Produce Now
            </button>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION: Overview vs My Orders */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Dashboard Overview
          </button>

          <button
            id="my-orders-tab"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            My Orders
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {buyerOrders.length}
            </span>
          </button>
        </div>

        {activeTab === 'orders' && (
          <button
            onClick={() => setCurrentView('marketplace')}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Buy More Produce
          </button>
        )}
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* UNIFIED BUYER ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ACTION A: BUY PRODUCE */}
            <div className="bg-white rounded-3xl border-2 border-brand-500/30 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                    Direct Procurement
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Buy Produce (Any Quantity)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Order produce directly in KG or Quintal. Enter your required quantity and the platform will automatically fulfill from individual farmer listings or dynamically aggregate supply across smallholders.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentView('bulk-requirement')}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow transition-colors flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Buy Produce (Enter Requirement)
                </button>
              </div>
            </div>

            {/* ACTION B: BROWSE MARKETPLACE */}
            <div className="bg-white rounded-3xl border-2 border-blue-500/30 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    Farmer Listings
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Browse Marketplace
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Explore active farmer and FPO crop listings with verified moisture reports, quality grades, and farm-gate pricing across Prayagraj, Kanpur, Unnao, and Varanasi.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Marketplace Listings
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Orders"
              value={buyerOrders.length}
              subtitle="Orders in progress or delivered"
              icon={PackageCheck}
              color="blue"
            />

            <MetricCard
              title="Total Volume Bought"
              value={formatWeight(totalProcuredKg)}
              subtitle="Direct from farmer lots"
              icon={Truck}
              color="brand"
            />

            <MetricCard
              title="Total Amount Paid"
              value={formatCurrency(totalSpend)}
              subtitle="Transparent farmer pricing"
              icon={TrendingUp}
              color="amber"
            />

            <MetricCard
              title="Active Requirements"
              value={requirements.length}
              subtitle="Multi-farmer matching"
              icon={Layers}
              color="purple"
            />
          </div>

          {/* BUYER INTELLIGENCE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Buyer Procurement Intelligence & Market Signals
                </h3>
                <p className="text-xs text-slate-500">
                  Telemetry on active bulk supply, average farm prices, and freight corridors.
                </p>
              </div>

              <button
                onClick={() => setCurrentView('market-intel')}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                Open Market Intelligence AI <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Wheat Supply Signal (Central UP)</span>
                <span className="text-base font-extrabold text-slate-900 block">10,000 kg Available</span>
                <p className="text-slate-600 text-[11px]">
                  Sourced across 3 verified FPOs in Prayagraj, Kanpur, and Unnao at average ₹27.50/kg.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Mustard Supply Signal</span>
                <span className="text-base font-extrabold text-amber-900 block">7,000 kg (Partial Liquidity)</span>
                <p className="text-slate-600 text-[11px]">
                  Crushing demand is elevated. 2 FPOs active in Prayagraj and Kanpur at ₹57.80/kg.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Logistics Consolidation</span>
                <span className="text-base font-extrabold text-emerald-900 block">34% Freight Reduction</span>
                <p className="text-slate-600 text-[11px]">
                  Nearest-Neighbor route planning eliminates empty truck-km across the NH-19 corridor.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* MY ORDERS SECTION (Rendered prominently or on active tab) */}
      <div id="my-orders-section" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-brand-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">
                My Orders ({buyerOrders.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status, farmer details, transparent charges, and delivery tracking.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({buyerOrders.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                statusFilter === 'active' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                statusFilter === 'completed' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Delivered / Collected
            </button>
            <button
              onClick={() => setStatusFilter('pickup')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                statusFilter === 'pickup' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Self Pickup
            </button>
            <button
              onClick={() => setStatusFilter('logistics')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                statusFilter === 'logistics' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Logistics
            </button>
          </div>
        </div>

        {/* ORDER CARDS: Complete 11-field specification */}
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isPickup = Boolean(
              order.fulfillmentMethod === 'self_pickup' ||
              order.logisticsOption === 'self_pickup' ||
              order.deliveryMethod === 'Self Pickup' ||
              order.isSelfPickup ||
              order.logisticsCost === 0
            );

            const farmerFpoName = order.farmerName || order.fpoName || (order.allocations?.map(a => a.farmerName || a.fpoName).join(', ')) || 'Krishi Verified Farmer';
            const pricePerKg = order.pricePerKg || order.allocations?.[0]?.pricePerKg || 28;
            const produceAmount = order.produceAmount || order.farmerProduceValue || (pricePerKg * (order.totalQuantity || order.quantity || 1));
            const charges = (order.logisticsCost || 0) + (order.platformFee || 0);
            const formattedDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={order.id}
                onClick={() => {
                  if (setSelectedOrderId) setSelectedOrderId(order.id);
                  setCurrentView('order-details');
                }}
                className="p-5 sm:p-6 rounded-2xl border-2 border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-brand-400 hover:shadow-md transition-all cursor-pointer space-y-4"
              >
                {/* Top Row: Order ID, Status, Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 bg-slate-200 px-2.5 py-1 rounded-lg text-xs tracking-wider border border-slate-300">
                      {order.id}
                    </span>
                    <StatusBadge status={order.status} className="text-xs px-3 py-0.5 font-bold" />
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-500">
                      {isPickup ? 'Self Pickup Order' : 'Logistics Delivery Order'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Order Date: <strong className="text-slate-800">{formattedDate}</strong></span>
                  </div>
                </div>

                {/* Middle Grid: All Required Order Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  {/* 1. Produce / Crop */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Produce / Crop</span>
                    <strong className="text-slate-900 text-sm block truncate">{order.produce}</strong>
                    <span className="text-[10px] text-brand-700 font-bold uppercase">{order.qualityGrade || 'Grade A'}</span>
                  </div>

                  {/* 2. Quantity + Unit */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Quantity</span>
                    <strong className="text-slate-900 text-sm block">
                      {order.quantityDisplay || `${order.quantity || order.totalQuantity} ${order.unit || 'KG'}`}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">({formatWeight(order.totalQuantity || order.quantity)})</span>
                  </div>

                  {/* 3. Farmer / FPO */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Farmer / FPO</span>
                    <strong className="text-slate-900 text-xs block truncate" title={farmerFpoName}>
                      {farmerFpoName}
                    </strong>
                    <span className="text-[10px] text-slate-500">{order.allocations?.length || 1} Farm Location(s)</span>
                  </div>

                  {/* 4. Price per KG */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Price per KG</span>
                    <strong className="text-slate-900 text-sm block">
                      ₹{pricePerKg}/kg
                    </strong>
                    <span className="text-[10px] text-slate-500">Farm-gate rate</span>
                  </div>

                  {/* 5. Produce Amount */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Produce Amount</span>
                    <strong className="text-emerald-800 text-sm font-black block">
                      {formatCurrency(produceAmount)}
                    </strong>
                    <span className="text-[10px] text-slate-500">100% to farmer</span>
                  </div>

                  {/* 6. Logistics / Self Pickup & Charges */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Method & Charges</span>
                    <div className="flex items-center gap-1">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isPickup ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isPickup ? 'Self Pickup' : 'Logistics'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-700 font-bold block">
                      Charges: {formatCurrency(charges)}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Total Amount & Action CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Total Order Amount</span>
                      <span className="text-xl font-black text-brand-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs hidden sm:block">
                      (Produce: {formatCurrency(produceAmount)} + Freight & Platform: {formatCurrency(charges)})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (setSelectedOrderId) setSelectedOrderId(order.id);
                        setCurrentView('order-details');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
                    >
                      <span>View Order Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs space-y-3">
              <PackageCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No orders found under this filter</p>
              <p className="text-slate-500 text-xs">
                Browse our marketplace to purchase farm-direct produce with guaranteed farmer pricing.
              </p>
              <button
                onClick={() => setCurrentView('marketplace')}
                className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Marketplace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
