// Smart Supply Matching & Aggregation Engine
// Computes genuine multi-farmer allocations, fulfillment percentage, and cost metrics

import { getCoordinatesForLocation } from '../data/coordinates.js';
import { normalizeToKg, classifyProcurement } from '../config/procurementConfig.js';

/**
 * Matches a buyer requirement against active farmer listings
 * @param {Object} requirement - { cropId, produce, requiredQuantity, unit, targetPricePerKg, deliveryLocation, qualityGrade }
 * @param {Array} listings - Current active listings from store
 * @returns {Object} Full matching result with allocations, fulfillment %, and pricing
 */
export const matchSupply = (requirement, listings) => {
  if (!requirement || !listings || listings.length === 0) {
    const rawQty = Number(requirement?.requiredQuantity ?? requirement?.quantity) || 0;
    const unit = requirement?.unit || 'kg';
    const normalized = normalizeToKg(rawQty, unit);
    return {
      requiredQuantity: normalized,
      originalQuantity: rawQty,
      originalUnit: unit,
      matchedQuantity: 0,
      remainingQuantity: normalized,
      fulfillmentPercentage: 0,
      farmersCount: 0,
      isFullyMatched: false,
      isMultiFarmer: false,
      classification: classifyProcurement(normalized).type,
      allocations: [],
      averagePricePerKg: 0,
      totalProduceValue: 0
    };
  }

  const reqCrop = (requirement.cropId || requirement.produce || '').toLowerCase();
  const rawQty = Number(requirement.requiredQuantity ?? requirement.quantity) || 0;
  const unit = requirement.unit || 'kg';
  // Standard internal normalization: 1 Quintal = 100 KG, 1 Ton = 1000 KG
  const reqQty = normalizeToKg(rawQty, unit);
  const targetPrice = Number(requirement.targetPricePerKg) || Infinity;

  // 1. Filter candidate listings: Same crop, active status, available quantity > 0
  const candidates = listings.filter(l => {
    const listCrop = (l.cropId || l.produce || '').toLowerCase();
    const isCropMatch = listCrop === reqCrop;
    const isActive = l.status === 'Active';
    const hasQty = (l.availableQuantity !== undefined ? l.availableQuantity : l.quantity) > 0;
    return isCropMatch && isActive && hasQty;
  });

  // 2. Sort candidates prioritizing: price <= targetPrice first, then proximity/quality
  candidates.sort((a, b) => {
    // Sort ascending by price
    const priceDiff = (a.pricePerKg || 0) - (b.pricePerKg || 0);
    if (priceDiff !== 0) return priceDiff;
    // Secondary: larger available quantity
    return (b.availableQuantity || b.quantity) - (a.availableQuantity || a.quantity);
  });

  // 3. Aggregate allocations until requirement is fulfilled or candidates exhausted
  let currentAllocated = 0;
  const allocations = [];
  let totalProduceValue = 0;

  for (const listing of candidates) {
    if (currentAllocated >= reqQty) break;

    const available = listing.availableQuantity !== undefined ? listing.availableQuantity : listing.quantity;
    const needed = reqQty - currentAllocated;
    const allocateQty = Math.min(available, needed);

    if (allocateQty > 0) {
      currentAllocated += allocateQty;
      const subtotal = allocateQty * (listing.pricePerKg || 0);
      totalProduceValue += subtotal;

      allocations.push({
        listingId: listing.id,
        farmerId: listing.farmerId,
        farmerName: listing.farmerName,
        fpoName: listing.fpoName,
        location: listing.location,
        coordinates: getCoordinatesForLocation(listing.location),
        allocatedQuantity: allocateQty,
        pricePerKg: listing.pricePerKg,
        farmerEarnings: subtotal,
        qualityGrade: listing.qualityGrade || 'Grade A',
        moistureContent: listing.moistureContent || 'Optimal'
      });
    }
  }

  const remaining = Math.max(0, reqQty - currentAllocated);
  const fulfillmentPercentage = reqQty > 0 ? Math.min(100, Math.round((currentAllocated / reqQty) * 100)) : 0;
  const isFullyMatched = currentAllocated >= reqQty && reqQty > 0;
  const averagePricePerKg = currentAllocated > 0 ? (totalProduceValue / currentAllocated) : 0;
  const classification = classifyProcurement(reqQty);

  return {
    requiredQuantity: reqQty,
    originalQuantity: rawQty,
    originalUnit: unit,
    matchedQuantity: currentAllocated,
    remainingQuantity: remaining,
    fulfillmentPercentage,
    farmersCount: allocations.length,
    isFullyMatched,
    isMultiFarmer: allocations.length > 1,
    classification: classification.type,
    classificationDetails: classification,
    allocations,
    averagePricePerKg: Number(averagePricePerKg.toFixed(2)),
    totalProduceValue: Math.round(totalProduceValue)
  };
};
