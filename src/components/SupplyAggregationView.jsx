import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Navigation,
  Scale
} from 'lucide-react';
import { formatCurrency, formatWeight } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import {
  matchVehicleForLoad,
  calculatePartnerLogisticsPricing,
  optimizePickupRoute,
  calculateTransparentPricing
} from '../services/routeOptimizer';
import { store } from '../services/store';

export default function SupplyAggregationView({
  matchResult,
  deliveryLocation = 'Lucknow',
  onCreateOrder,
  isOrdering = false
}) {
  if (!matchResult) return null;

  const {
    requiredQuantity,
    matchedQuantity,
    remainingQuantity,
    fulfillmentPercentage,
    farmersCount,
    isFullyMatched,
    allocations,
    averagePricePerKg,
    totalProduceValue
  } = matchResult;

  // Delivery Choice: 'Self Pickup' vs 'Logistics Support' (Prompt Section 4)
  const [deliveryChoice, setDeliveryChoice] = useState('Logistics Support');

  // Compute optimized route for the allocated pickups
  const route = optimizePickupRoute(allocations, deliveryLocation);

  // Compute smart vehicle capacity matching for the matched quantity
  const approvedPartners = store.getApprovedLogisticsPartners();
  const vehicleMatch = matchVehicleForLoad(matchedQuantity, approvedPartners);
  const recommendedPartner = vehicleMatch.recommendedPartner;

  // Compute freight breakdown
  const logisticsPricing = calculatePartnerLogisticsPricing(
    route.totalDistanceKm,
    matchedQuantity,
    recommendedPartner
  );

  // Platform nominal fee
  const platformFee = Math.round(
    matchedQuantity <= 50 ? 20 : Math.min(3000, Math.max(500, totalProduceValue * 0.008))
  );

  // Final buyer total depending on delivery choice
  const totalAmount = deliveryChoice === 'Self Pickup'
    ? totalProduceValue + platformFee
    : totalProduceValue + logisticsPricing.estimatedDeliveryCost + platformFee;

  const handleConfirmOrder = () => {
    if (!onCreateOrder) return;
    onCreateOrder({
      deliveryMethod: deliveryChoice,
      deliveryLocation,
      routeData: route,
      vehicleMatch,
      assignedPartner: deliveryChoice === 'Logistics Support' ? recommendedPartner : null,
      logisticsCost: deliveryChoice === 'Self Pickup' ? 0 : logisticsPricing.estimatedDeliveryCost,
      partnerEarning: deliveryChoice === 'Self Pickup' ? 0 : logisticsPricing.partnerEarning,
      platformFee,
      totalAmount
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-500/30 p-6 shadow-sm overflow-hidden relative space-y-6">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/40 rounded-full blur-3xl -z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
              Smart Supply Matching
            </span>
            <span className="text-xs text-slate-500 font-semibold">Dynamic Multi-Farmer Aggregation</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            Aggregated Supply Breakdown
          </h3>
        </div>

        <StatusBadge
          status={isFullyMatched ? 'Fully Matched' : 'Partially Matched'}
          className="text-sm px-3 py-1 font-bold"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs text-slate-500 block">Required Quantity</span>
          <span className="text-lg font-extrabold text-slate-900">{formatWeight(requiredQuantity)}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
          <span className="text-xs text-emerald-700 block font-semibold">Aggregated Supply</span>
          <span className="text-lg font-extrabold text-emerald-900">{formatWeight(matchedQuantity)}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80">
          <span className="text-xs text-amber-700 block font-semibold">Shortage / Balance</span>
          <span className="text-lg font-extrabold text-amber-900">{formatWeight(remainingQuantity)}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80">
          <span className="text-xs text-blue-700 block font-semibold">Farmers Matched</span>
          <span className="text-lg font-extrabold text-blue-900 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> {farmersCount} Farmer{farmersCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Fulfillment Progress Bar */}
      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-slate-600">Dynamic Matching Status:</span>
          <span className={fulfillmentPercentage === 100 ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
            {isFullyMatched ? 'Fully Matched (100%)' : `Partial Match (${fulfillmentPercentage}%)`}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              fulfillmentPercentage === 100
                ? 'bg-gradient-to-r from-brand-500 to-emerald-600'
                : 'bg-gradient-to-r from-amber-400 to-amber-500'
            }`}
            style={{ width: `${fulfillmentPercentage}%` }}
          ></div>
        </div>
        {!isFullyMatched && (
          <p className="text-xs text-amber-800 mt-2 flex items-center gap-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Partial Match:</strong> Matched {formatWeight(matchedQuantity)} across {farmersCount} farmers. Shortage of {formatWeight(remainingQuantity)} can be broadcast or accepted as partial fulfillment.
            </span>
          </p>
        )}
      </div>

      {/* Participating Farmers Table */}
      <div className="relative z-10 space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Matched Farmer Lots & Allocations ({allocations.length} Active Listings)
        </h4>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Farmer / FPO</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Allocated Qty</th>
                <th className="py-2.5 px-3">Rate (₹/kg)</th>
                <th className="py-2.5 px-3 text-right">Farmer Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((alloc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div>{alloc.farmerName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{alloc.fpoName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{alloc.location}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                      {alloc.qualityGrade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{formatWeight(alloc.allocatedQuantity)}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">₹{alloc.pricePerKg}/kg</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {formatCurrency(alloc.farmerEarnings)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan="3" className="py-2.5 px-3 text-slate-700">
                  Total Produce ({farmersCount} Farmers Matched)
                </td>
                <td className="py-2.5 px-3 text-emerald-700 font-black">{formatWeight(matchedQuantity)}</td>
                <td className="py-2.5 px-3 text-slate-700">Avg ₹{averagePricePerKg}/kg</td>
                <td className="py-2.5 px-3 text-right text-emerald-800 font-black">
                  {formatCurrency(totalProduceValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* DELIVERY CHOICE SECTION (PROMPT SECTION 4 & 7 & 8) */}
      {matchedQuantity > 0 && (
        <div className="relative z-10 pt-2 space-y-4 border-t border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Choose Delivery Option
            </span>
            <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
              Self Pickup vs. Logistics Support
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OPTION 1: SELF PICKUP */}
            <div
              onClick={() => setDeliveryChoice('Self Pickup')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                deliveryChoice === 'Self Pickup'
                  ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    deliveryChoice === 'Self Pickup' ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                  }`}>
                    {deliveryChoice === 'Self Pickup' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <strong className="text-sm text-slate-900">OPTION 1 — Self Pickup</strong>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  ₹0 Logistics Fee
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Buyer collects produce directly from farmer/FPO collection points. Zero logistics or delivery charges.
              </p>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-100/70 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-700 block">Pickup Hub Locations:</span>
                {allocations.map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span>• {a.farmerName}</span>
                    <strong className="text-slate-800">{a.location} ({formatWeight(a.allocatedQuantity)})</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* OPTION 2: LOGISTICS SUPPORT */}
            <div
              onClick={() => setDeliveryChoice('Logistics Support')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                deliveryChoice === 'Logistics Support'
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    deliveryChoice === 'Logistics Support' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    {deliveryChoice === 'Logistics Support' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <strong className="text-sm text-slate-900">OPTION 2 — Logistics Support</strong>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs">
                  Est. ₹{logisticsPricing.estimatedDeliveryCost.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Direct farm pickup and doorstep delivery to {deliveryLocation} via verified commercial logistics partner.
              </p>

              <div className="mt-3 p-2.5 rounded-xl bg-blue-100/60 text-[11px] text-blue-950 space-y-1">
                <div className="flex justify-between">
                  <span>Smart Vehicle:</span>
                  <strong>{recommendedPartner?.vehicleModel || '10 Ton Commercial Truck'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Number Plate:</span>
                  <strong className="font-mono">{recommendedPartner?.vehicleNumber || 'UP78 BT 5678'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Verified Partner:</span>
                  <strong>{recommendedPartner?.name || 'Vikram Singh'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED LOGISTICS BREAKDOWN (WHEN OPTION 2 SELECTED) */}
          {deliveryChoice === 'Logistics Support' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-200">
              {/* Vehicle Capacity Matching Analysis (Section 7) */}
              <div>
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-600" />
                    Smart Vehicle Capacity Matching
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Order Load: <strong>{formatWeight(matchedQuantity)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5">
                  {vehicleMatch.allEvaluations.map((v, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs ${
                        v.isSuitable
                          ? v.partnerId === recommendedPartner?.partnerId
                            ? 'bg-blue-100/70 border-blue-300 font-bold text-blue-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px]">
                        <span>{v.capacityTons} Ton ({v.vehicleModel})</span>
                        <span className="text-[10px] uppercase font-bold">
                          {v.isSuitable ? (v.partnerId === recommendedPartner?.partnerId ? 'Recommended' : 'Suitable') : 'Not Suitable'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono mt-1">{v.vehicleNumber}</div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-600 mt-2">
                  <strong>Recommended Vehicle:</strong> {recommendedPartner?.capacityTons} Ton Truck ({recommendedPartner?.vehicleModel}), Plate: <span className="font-mono font-bold text-slate-900">{recommendedPartner?.vehicleNumber}</span>. Partner: {recommendedPartner?.name}. <em>Reason: Vehicle capacity is suitable for the {formatWeight(matchedQuantity)} order load.</em>
                </p>
              </div>

              {/* Multi-Farmer Route Optimization (Section 10) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-brand-600" />
                    Optimized Pickup Route ({route.pickupSequence.length} Farm Stops)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total: <strong>{route.totalDistanceKm} km</strong> (~{route.estimatedHours} hrs transit)
                  </span>
                </div>

                {/* Route Sequence Chips */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs font-semibold text-slate-700">
                  {route.pickupSequence.map((stop, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 flex items-center gap-1 shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Stop {sIdx + 1}: {stop.location} ({formatWeight(stop.allocatedQuantity)})</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </React.Fragment>
                  ))}
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-blue-700" />
                    <span>Destination: {deliveryLocation}</span>
                  </span>
                </div>
              </div>

              {/* Transparent Freight Cost Breakdown (Section 8 & 9) */}
              <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Delivery Freight:</span>
                  <strong className="text-slate-900">₹{logisticsPricing.estimatedDeliveryCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-500 pl-3">
                  <span>• Logistics Partner Earning (90%):</span>
                  <span>₹{logisticsPricing.partnerEarning.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 pl-3">
                  <span>• Platform Logistics Maintenance Fee (10%):</span>
                  <span>₹{logisticsPricing.platformServiceFee.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT & DIGITAL ESCROW CHOICE (PROTOTYPE DEMO) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Payment & Digital Escrow Settlement
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                Prototype Demo Flow
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">Prototype Escrow</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">Simulated escrow lock for hackathon evaluation. No real money deducted.</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">UPI / NetBanking</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">Production</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Direct bank escrow via RazorpayX / Cashfree gateway API.</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Pay on Delivery</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Mandi Gate</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Settlement at Mandi weighbridge or farm collection gate.</p>
              </div>
            </div>
          </div>

          {/* TOTAL ORDER SUMMARY CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-brand-950 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-300 block font-medium">
                Order Total ({deliveryChoice}):
              </span>
              <div className="text-2xl font-black text-white mt-0.5">
                {formatCurrency(totalAmount)}
              </div>
              <span className="text-[11px] text-slate-400">
                Produce ({formatCurrency(totalProduceValue)}) + Logistics ({deliveryChoice === 'Self Pickup' ? '₹0' : formatCurrency(logisticsPricing.estimatedDeliveryCost)}) + Platform Fee ({formatCurrency(platformFee)})
              </span>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={isOrdering}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isOrdering ? 'Confirming Order...' : `Place Order & Lock Escrow (${deliveryChoice})`}</span>
            </button>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
            <span className="font-extrabold uppercase tracking-wider block">Payment Gateway Notice (Prototype Demonstration):</span>
            <p className="leading-relaxed">
              Digital escrow lock is demonstrated as a prototype workflow for SIH evaluation. In commercial production, fund collection is settled through licensed banking gateways (RazorpayX / NPCI UPI AutoPay). Order is created in verified "Confirmed" status.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
