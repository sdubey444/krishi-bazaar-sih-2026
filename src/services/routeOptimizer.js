// Distance-Based Route Optimization & Logistics Planning Engine
// Implements Haversine Formula distance calculation and Nearest-Neighbor heuristic

import { getCoordinatesForLocation } from '../data/coordinates.js';
import { SEED_LOGISTICS_PARTNERS } from '../data/seedData.js';

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using the Haversine formula
 */
export const calculateHaversineDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
    Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Road factor adjustment (approx 1.25x straight-line for actual road topology in UP)
  return Math.round(distance * 1.25);
};

/**
 * Optimizes the multi-stop pickup sequence from farmers to buyer destination
 * using Nearest-Neighbor heuristic.
 * 
 * @param {Array} pickups - List of farmer pickup objects [{ farmerName, location, coordinates, allocatedQuantity, ... }]
 * @param {String|Object} buyerDestination - Delivery destination name or coordinate
 * @returns {Object} Optimized route sequence, distances per leg, total distance, and travel time
 */
export const optimizePickupRoute = (pickups, buyerDestination) => {
  if (!pickups || pickups.length === 0) {
    return {
      pickupSequence: [],
      destination: buyerDestination,
      totalDistanceKm: 0,
      estimatedHours: 0,
      legs: []
    };
  }

  const destCoords = typeof buyerDestination === 'string'
    ? getCoordinatesForLocation(buyerDestination)
    : buyerDestination || getCoordinatesForLocation('Lucknow');

  // Normalize pickups with valid coordinates
  const pool = pickups.map((p, idx) => ({
    ...p,
    stopId: `stop_${idx}`,
    coordinates: p.coordinates || getCoordinatesForLocation(p.location)
  }));

  // Nearest-Neighbor algorithm:
  // We want to sequence pickups efficiently before ending at the destination.
  // Start from the pickup farthest from destination (to sweep towards buyer)
  pool.sort((a, b) => {
    const distA = calculateHaversineDistanceKm(a.coordinates, destCoords);
    const distB = calculateHaversineDistanceKm(b.coordinates, destCoords);
    return distB - distA; // Farthest first
  });

  const sequence = [];
  const remaining = [...pool];

  // Pick the start point
  let current = remaining.shift();
  sequence.push(current);

  // Greedily pick nearest next unvisited pickup
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateHaversineDistanceKm(current.coordinates, remaining[i].coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    current = remaining.splice(nearestIndex, 1)[0];
    sequence.push(current);
  }

  // Calculate detailed route legs
  const legs = [];
  let totalDistanceKm = 0;

  for (let i = 0; i < sequence.length; i++) {
    const isFirst = i === 0;
    const fromPoint = isFirst ? null : sequence[i - 1];
    const toPoint = sequence[i];

    const legDist = isFirst ? 0 : calculateHaversineDistanceKm(fromPoint.coordinates, toPoint.coordinates);
    totalDistanceKm += legDist;

    legs.push({
      type: 'pickup',
      stepNumber: i + 1,
      from: isFirst ? 'Fleet Depot' : fromPoint.location,
      to: toPoint.location,
      farmerName: toPoint.farmerName,
      quantityKg: toPoint.allocatedQuantity,
      distanceKm: legDist,
      coordinates: toPoint.coordinates
    });
  }

  // Final leg: Last pickup to Buyer Destination
  const lastPickup = sequence[sequence.length - 1];
  const finalLegDist = calculateHaversineDistanceKm(lastPickup.coordinates, destCoords);
  totalDistanceKm += finalLegDist;

  legs.push({
    type: 'delivery',
    stepNumber: sequence.length + 1,
    from: lastPickup.location,
    to: typeof buyerDestination === 'string' ? buyerDestination : 'Buyer Hub',
    farmerName: 'Buyer Delivery Point',
    quantityKg: sequence.reduce((sum, p) => sum + (p.allocatedQuantity || 0), 0),
    distanceKm: finalLegDist,
    coordinates: destCoords
  });

  // Estimated travel time assuming commercial agritech freight truck average speed of 45 km/h + 45 min per farm loading
  const drivingHours = totalDistanceKm / 45;
  const loadingHours = sequence.length * 0.75;
  const totalHours = Math.round((drivingHours + loadingHours) * 10) / 10;

  return {
    method: 'Distance-Based Route Optimization (Haversine + Nearest Neighbor)',
    pickupSequence: sequence,
    destination: {
      location: typeof buyerDestination === 'string' ? buyerDestination : 'Lucknow',
      coordinates: destCoords
    },
    totalDistanceKm,
    estimatedHours: totalHours,
    legs
  };
};

/**
 * Calculates transparent pricing components based on produce value, distance, and total weight
 */
export const calculateTransparentPricing = (produceValue, totalQuantityKg, distanceKm) => {
  const tons = Math.max(0.01, totalQuantityKg / 1000);
  
  // Logistics formula: Base loading ₹1,500 + ₹3.50 per ton-km (with min threshold ₹500)
  const logisticsEstimate = Math.round(
    totalQuantityKg <= 50 
      ? 60 // Normal retail purchase small delivery
      : Math.max(2500, 1500 + (distanceKm * tons * 3.2))
  );

  // Platform fee: transparent nominal fee (1% or min ₹50, capped at ₹3,000 for demo)
  const platformFee = Math.round(
    totalQuantityKg <= 50 
      ? 20 
      : Math.min(3000, Math.max(500, produceValue * 0.008))
  );

  const totalAmount = produceValue + logisticsEstimate + platformFee;

  return {
    farmerProduceValue: produceValue,
    logisticsCost: logisticsEstimate,
    platformFee: platformFee,
    totalAmount: totalAmount,
    breakdownNote: 'Calculated transparently: Farmer Produce Value + Distance/Tonnage Logistics + Nominal Platform Maintenance Fee.'
  };
};

/**
 * Smart Vehicle Capacity Matching
 * Evaluates candidate verified logistics partners against the required order load.
 * 
 * @param {Number} loadKg - Total order quantity/load in KG (e.g. 10,000 kg)
 * @param {Array} candidatePartners - List of logistics partner objects
 * @returns {Object} Matching result with suitability per vehicle and recommended partner
 */
export const matchVehicleForLoad = (loadKg = 10000, candidatePartners = null) => {
  const partners = candidatePartners && candidatePartners.length > 0
    ? candidatePartners
    : SEED_LOGISTICS_PARTNERS;

  // Only consider verified/approved and currently available logistics partners
  const eligiblePartners = partners.filter(
    p => p.verificationStatus === 'Approved' && p.availability === 'Available'
  );

  const evaluations = eligiblePartners.map(partner => {
    const isSuitable = partner.capacityKg >= loadKg;
    const reason = isSuitable
      ? `Vehicle capacity (${partner.capacityTons} Ton / ${partner.capacityKg.toLocaleString()} KG) is suitable for the order load (${loadKg.toLocaleString()} KG).`
      : `Vehicle capacity (${partner.capacityTons} Ton / ${partner.capacityKg.toLocaleString()} KG) is insufficient for order load (${loadKg.toLocaleString()} KG).`;

    return {
      partnerId: partner.id,
      name: partner.name,
      phone: partner.phone,
      vehicleType: partner.vehicleType,
      vehicleModel: partner.vehicleModel,
      capacityTons: partner.capacityTons,
      capacityKg: partner.capacityKg,
      vehicleNumber: partner.vehicleNumber,
      serviceArea: partner.serviceArea,
      perKmRate: partner.perKmRate,
      isSuitable,
      reason
    };
  });

  // Filter suitable vehicles and sort ascending by capacity (closest fit to minimize empty haulage)
  const suitable = evaluations.filter(e => e.isSuitable);
  suitable.sort((a, b) => a.capacityKg - b.capacityKg);

  const recommended = suitable.length > 0 ? suitable[0] : null;

  return {
    algorithmLabel: 'Smart Vehicle Matching',
    requiredLoadKg: loadKg,
    requiredLoadTons: Number((loadKg / 1000).toFixed(2)),
    allEvaluations: evaluations,
    suitableVehiclesCount: suitable.length,
    hasSuitableVehicle: suitable.length > 0,
    recommendedPartner: recommended,
    recommendationSummary: recommended
      ? {
          name: recommended.name,
          vehicleType: recommended.vehicleType,
          vehicleModel: recommended.vehicleModel,
          capacityTons: recommended.capacityTons,
          capacityKg: recommended.capacityKg,
          vehicleNumber: recommended.vehicleNumber,
          serviceArea: recommended.serviceArea,
          reason: 'Vehicle capacity is suitable for the order load.'
        }
      : {
          name: 'No Suitable Vehicle Available',
          vehicleType: 'N/A',
          vehicleNumber: 'N/A',
          reason: `No verified partner has sufficient capacity for ${loadKg.toLocaleString()} KG.`
        }
  };
};

/**
 * Transparent Logistics Freight Breakdown
 * Calculates estimated delivery charge, partner earnings (90%), and platform service fee (10%).
 * 
 * @param {Number} distanceKm - Estimated trip distance in kilometers
 * @param {Number} loadKg - Total weight of produce
 * @param {Object} partner - Assigned verified partner
 * @returns {Object} Transparent cost breakdown
 */
export const calculatePartnerLogisticsPricing = (distanceKm = 0, loadKg = 10, partner = null) => {
  const rate = partner?.perKmRate || (loadKg >= 10000 ? 32 : loadKg >= 3000 ? 24 : 20);

  let deliveryCost = 0;
  if (loadKg <= 50) {
    // Normal retail purchase
    deliveryCost = 60;
  } else {
    // Commercial freight: Base loading fee ₹1,500 + distance × per-km vehicle rate
    const distanceCost = Math.round(distanceKm * rate);
    deliveryCost = Math.max(2500, 1500 + distanceCost);
  }

  // 90% goes directly to logistics partner / driver
  const partnerEarning = Math.round(deliveryCost * 0.90);
  // 10% nominal platform maintenance fee
  const platformFee = deliveryCost - partnerEarning;

  return {
    distanceKm,
    loadKg,
    ratePerKm: rate,
    estimatedDeliveryCost: deliveryCost,
    partnerEarning,
    platformServiceFee: platformFee,
    buyerPays: deliveryCost,
    breakdownDisplay: {
      estimatedDeliveryCost: `₹${deliveryCost.toLocaleString()}`,
      partnerEarning: `₹${partnerEarning.toLocaleString()}`,
      platformServiceFee: `₹${platformFee.toLocaleString()}`,
      buyerPays: `₹${deliveryCost.toLocaleString()}`
    },
    note: 'Estimated freight calculation based on route distance and vehicle rate. Driver receives transparent 90% payout.'
  };
};

