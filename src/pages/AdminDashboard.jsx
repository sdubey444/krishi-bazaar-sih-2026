import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { formatCurrency, formatWeight } from '../utils/formatters';
import {
  ShieldAlert,
  Users,
  Store,
  Layers,
  Truck,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Package,
  Activity,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard({ setCurrentView, setSelectedOrderId }) {
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [users, setUsers] = useState(store.users);
  const [listings, setListings] = useState(store.listings);
  const [requirements, setRequirements] = useState(store.requirements);
  const [orders, setOrders] = useState(store.orders);
  const [logisticsPartners, setLogisticsPartners] = useState(store.logisticsPartners || []);

  useEffect(() => {
    return store.subscribe(state => {
      setCurrentUser(state.currentUser);
      setUsers(state.users);
      setListings(state.listings);
      setRequirements(state.requirements);
      setOrders(state.orders);
      setLogisticsPartners(state.logisticsPartners || []);
    });
  }, []);

  const totalFarmers = users.filter(u => u.role === 'farmer').length;
  const totalBuyers = users.filter(u => u.role === 'buyer').length;
  const activeListings = listings.filter(l => l.status === 'Active');

  const totalVolumeKg = listings.reduce((sum, l) => sum + Number(l.quantity || 0), 0);
  const totalOrderVolumeKg = orders.reduce((sum, o) => sum + Number(o.totalQuantity || 0), 0);
  const totalOrderValue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const pendingPartners = logisticsPartners.filter(p => p.verificationStatus === 'Pending').length;
  const approvedPartners = logisticsPartners.filter(p => p.verificationStatus === 'Approved').length;

  const handleVerifyPartner = (partnerId, status) => {
    store.verifyLogisticsPartner(partnerId, status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 uppercase">
                System Overview
              </span>
              <span className="text-xs text-slate-300">Admin Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Logged in as {currentUser?.name || 'State Agritech Directorate'} • Manage platform users, crop listings, bulk requirements, and orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                store.logout();
                setCurrentView('landing');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 backdrop-blur-sm"
              title="Log out of Admin account"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all demo listings, requirements, and orders to default state?')) {
                  store.resetSeedData();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN PLATFORM METRICS ROW (SECTION 25 REQUIREMENT) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          title="Farmers / FPOs"
          value={totalFarmers}
          subtitle="Registered producers"
          icon={Users}
          color="brand"
        />

        <MetricCard
          title="Buyers"
          value={totalBuyers}
          subtitle="Bulk & retail"
          icon={Store}
          color="blue"
        />

        <MetricCard
          title="Active Listings"
          value={activeListings.length}
          subtitle="On spot marketplace"
          icon={Package}
          color="amber"
        />

        <MetricCard
          title="Requirements"
          value={requirements.length}
          subtitle="Procurement tenders"
          icon={Layers}
          color="purple"
        />

        <MetricCard
          title="Completed Orders"
          value={orders.length}
          subtitle="Matched & transacted"
          icon={CheckCircle2}
          color="brand"
        />

        <MetricCard
          title="Platform Volume"
          value={formatWeight(totalVolumeKg)}
          subtitle="Listed crop capacity"
          icon={Activity}
          color="blue"
        />

        <MetricCard
          title="Transacted GMV"
          value={formatCurrency(totalOrderValue)}
          subtitle="Direct trade value"
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* PLATFORM USERS AUDIT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
          Registered Platform Participants ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organization / FPO</th>
                <th className="py-3 px-4">Hub Location</th>
                <th className="py-3 px-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' :
                      u.role === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.organization || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">{u.location}</td>
                  <td className="py-3 px-4 text-slate-500">{u.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOGISTICS FLEET & PARTNER VERIFICATION (PROMPT SECTION 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase">
                Fleet Verification
              </span>
              <span className="text-xs text-slate-500">Service Provider Controls</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mt-1 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Logistics Partners Verification ({logisticsPartners.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
              Pending: {pendingPartners}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Verified: {approvedPartners}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Vehicle Number Plate</th>
                <th className="py-3 px-4">Rated Capacity</th>
                <th className="py-3 px-4">Service Area</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logisticsPartners.map(partner => (
                <tr key={partner.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{partner.name}</td>
                  <td className="py-3 px-4 text-slate-600">{partner.phone}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {partner.vehicleModel} <span className="text-slate-400">({partner.vehicleType})</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {partner.vehicleNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {partner.capacityTons} Ton <span className="text-slate-400 font-normal">({partner.capacityKg?.toLocaleString()} KG)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{partner.serviceArea}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      partner.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {partner.availability}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                      partner.verificationStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      partner.verificationStatus === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {partner.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {partner.verificationStatus === 'Pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleVerifyPartner(partner.id, 'Approved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerifyPartner(partner.id, 'Rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : partner.verificationStatus === 'Approved' ? (
                      <button
                        onClick={() => handleVerifyPartner(partner.id, 'Rejected')}
                        className="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                      >
                        Revoke
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyPartner(partner.id, 'Approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
                      >
                        Re-Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE ORDERS PIPELINE AUDIT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
          Active Agricultural Procurement Orders ({orders.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Produce</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Contributing Farmers</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{order.buyerName}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">{order.produce}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{formatWeight(order.totalQuantity)}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {order.allocations?.length || 1} Farmer(s)
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (setSelectedOrderId) setSelectedOrderId(order.id);
                        setCurrentView('order-details');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
