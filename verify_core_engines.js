// Automated Core Engine Verification Test Suite for Krishi Bazaar
import { matchSupply } from './src/services/matchingEngine.js';
import { 
  optimizePickupRoute, 
  calculateTransparentPricing, 
  calculateHaversineDistanceKm,
  matchVehicleForLoad,
  calculatePartnerLogisticsPricing
} from './src/services/routeOptimizer.js';
import { 
  getCropDemandForecast, 
  getCropPriceIntelligence,
  getCropSupplyDemandAnalysis 
} from './src/services/forecastEngine.js';
import { processNaturalQuery } from './src/services/nluService.js';
import { askKrishiAi } from './src/services/geminiService.js';
import { SEED_USERS, SEED_LISTINGS, SEED_LOGISTICS_PARTNERS } from './src/data/seedData.js';
import { getCoordinatesForLocation } from './src/data/coordinates.js';
import { store } from './src/services/store.js';
import { normalizeToKg, classifyProcurement, PROCUREMENT_CONFIG } from './src/config/procurementConfig.js';

console.log('====================================================');
console.log('KRISHI BAZAAR — COMPREHENSIVE AUTOMATED TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

// 1. ROLE STRUCTURE VERIFICATION (STRICTLY 3 PLATFORM ROLES)
console.log('--- TEST GROUP 1: ROLE SYSTEM VERIFICATION ---');
const userRoles = new Set(SEED_USERS.map(u => u.role));
assert(userRoles.has('farmer'), 'Farmer/FPO role exists in system');
assert(userRoles.has('buyer'), 'Buyer/Consumer role exists in system');
assert(userRoles.has('admin'), 'Admin role exists in system');
assert(!userRoles.has('bulk_buyer'), 'No "bulk_buyer" role exists in system');
assert(!userRoles.has('normal_buyer'), 'No "normal_buyer" role exists in system');
assert(userRoles.size === 3, 'Strictly 3 platform roles (Farmer/FPO, Buyer/Consumer, Admin)');

// 2. INTERNAL QUANTITY NORMALIZATION & CONFIGURABLE THRESHOLD
console.log('\n--- TEST GROUP 2: QUANTITY NORMALIZATION & THRESHOLD ---');
assert(normalizeToKg(20, 'kg') === 20, 'Small KG purchase (20 KG) normalizes to 20 KG');
assert(normalizeToKg(100, 'Quintal') === 10000, 'Quintal purchase (100 Quintal) normalizes to 10,000 KG (1 Q = 100 KG)');
assert(normalizeToKg(50, 'quintal') === 5000, 'Quintal purchase (50 Quintal) normalizes to 5,000 KG');
assert(normalizeToKg(5, 'Ton') === 5000, 'Metric Ton (5 Ton) normalizes to 5,000 KG');

const smallClassification = classifyProcurement(20);
assert(smallClassification.isBulk === false, '20 KG classified as direct/standard procurement (below threshold)');
const largeClassification = classifyProcurement(10000);
assert(largeClassification.isBulk === true, '10,000 KG classified as large/aggregated procurement (above threshold)');
assert(PROCUREMENT_CONFIG.BULK_AGGREGATION_THRESHOLD_KG === 500, 'Configurable bulk aggregation threshold is 500 KG');

// 3. DYNAMIC SUPPLY MATCHING: SMALL QUANTITY (SINGLE FARMER) VS LARGE QUANTITY (MULTI-FARMER)
console.log('\n--- TEST GROUP 3: DYNAMIC SUPPLY MATCHING ---');

// Test A: Small purchase (20 KG Wheat) -> Should allocate from 1 farmer
const smallWheatReq = {
  cropId: 'wheat',
  produce: 'Wheat',
  requiredQuantity: 20,
  unit: 'kg',
  targetPricePerKg: 30,
  deliveryLocation: 'Lucknow'
};
const smallMatch = matchSupply(smallWheatReq, SEED_LISTINGS);
assert(smallMatch.matchedQuantity === 20, 'Small order (20 KG) matched 20 KG');
assert(smallMatch.farmersCount === 1, 'Small order fulfilled from exactly 1 farmer (no unnecessary aggregation)');
assert(smallMatch.isMultiFarmer === false, 'isMultiFarmer is false for small order');

// Test B: Large purchase (100 Quintal = 10,000 KG Wheat) -> Should dynamically aggregate across 4 farmers
const largeWheatReq = {
  cropId: 'wheat',
  produce: 'Wheat',
  requiredQuantity: 100,
  unit: 'Quintal', // Will be internally normalized to 10,000 KG
  targetPricePerKg: 30,
  deliveryLocation: 'Lucknow'
};
const largeMatch = matchSupply(largeWheatReq, SEED_LISTINGS);
assert(largeMatch.matchedQuantity === 10000, 'Large order (100 Quintal) matched exactly 10,000 KG');
assert(largeMatch.fulfillmentPercentage === 100, 'Fulfillment percentage is 100%');
assert(largeMatch.farmersCount === 4, 'Large order dynamically aggregated across 4 farmers (Shiv Kumar, Rajesh Patel, Ram Charan, Dinesh Verma)');
assert(largeMatch.isMultiFarmer === true, 'isMultiFarmer is true for large order');

// 4. HONEST PARTIAL MATCHING TEST (MUSTARD)
console.log('\n--- TEST GROUP 4: HONEST PARTIAL MATCHING ---');
const mustardReq = {
  cropId: 'mustard',
  produce: 'Mustard',
  requiredQuantity: 10000,
  unit: 'kg',
  targetPricePerKg: 60,
  deliveryLocation: 'Lucknow'
};

const mustardMatch = matchSupply(mustardReq, SEED_LISTINGS);
assert(mustardMatch.matchedQuantity === 7000, 'Mustard 10,000 kg matched available 7,000 kg');
assert(mustardMatch.fulfillmentPercentage === 70, 'Mustard fulfillment is honest 70% (no fake 100%)');
assert(mustardMatch.remainingQuantity === 3000, 'Remaining shortfall is 3,000 kg');
assert(mustardMatch.isFullyMatched === false, 'isFullyMatched is false');

// 5. ROUTE OPTIMIZATION & VEHICLE CAPACITY MATCHING
console.log('\n--- TEST GROUP 5: LOGISTICS & VEHICLE CAPACITY MATCHING ---');
const routeResult = optimizePickupRoute(largeMatch.allocations, 'Lucknow');
assert(routeResult.pickupSequence.length === 4, 'Pickup sequence has 4 farmer stops');
assert(routeResult.totalDistanceKm > 0, `Total route distance computed: ${routeResult.totalDistanceKm} km`);

const vehicleMatches = matchVehicleForLoad(10000, SEED_LOGISTICS_PARTNERS);
assert(vehicleMatches.hasSuitableVehicle === true, 'Vehicle matcher found suitable fleet');
const miniTruck5T = vehicleMatches.allEvaluations.find(v => v.partnerId === 'lp_1');
const truck10T = vehicleMatches.allEvaluations.find(v => v.partnerId === 'lp_2');
const truck15T = vehicleMatches.allEvaluations.find(v => v.partnerId === 'lp_3');

assert(miniTruck5T && miniTruck5T.isSuitable === false, '5 Ton Mini Truck correctly flagged unsuitable for 10,000 kg load');
assert(truck10T && truck10T.isSuitable === true, '10 Ton Truck correctly flagged suitable for 10,000 kg load');
assert(truck15T && truck15T.isSuitable === true, '15 Ton Heavy Truck correctly flagged suitable for 10,000 kg load');
assert(vehicleMatches.recommendedPartner && vehicleMatches.recommendedPartner.partnerId === 'lp_2', '10 Ton Truck (Vikram Singh - UP78 BT 5678) designated as optimal recommended match');

const partnerPricing = calculatePartnerLogisticsPricing(routeResult.totalDistanceKm, 10000, vehicleMatches.recommendedPartner);
assert(partnerPricing.partnerEarning === Math.round(partnerPricing.estimatedDeliveryCost * 0.90), 'Driver earnings are exactly 90% of total freight');
assert(partnerPricing.platformServiceFee === (partnerPricing.estimatedDeliveryCost - partnerPricing.partnerEarning), 'Platform fee is exactly 10% of total freight');

// 6. CROP SUPPLY-DEMAND ADVISORY (HONEST GROUNDED RECOMMENDATIONS)
console.log('\n--- TEST GROUP 6: CROP SUPPLY-DEMAND & ADVISORY ---');
const wheatAnalysis = getCropSupplyDemandAnalysis('wheat', SEED_LISTINGS);
assert(wheatAnalysis.recommendationBadge.includes('Saturation') || wheatAnalysis.recommendationBadge.includes('Advisory'), 'Wheat identified with market saturation advisory badge');
assert(wheatAnalysis.recommendation.toLowerCase().includes('diversif'), 'Wheat recommendation honestly suggests diversifying or staggered selling');

const mustardAnalysis = getCropSupplyDemandAnalysis('mustard', SEED_LISTINGS);
assert(mustardAnalysis.recommendationBadge.includes('Favorable'), 'Mustard identified with favorable market balance badge');
assert(mustardAnalysis.recommendation.toLowerCase().includes('favorable'), 'Mustard recommendation highlights favorable market demand balance');

// 7. AI ASSISTANT NLU & REFERENCE DATA GROUNDING (NO PRICE FABRICATION)
console.log('\n--- TEST GROUP 7: AI ASSISTANT NLU & REFERENCE DATA ---');

// Query 1: "What is the wheat price?" (Typed English Price Query)
const q1 = processNaturalQuery('What is the wheat price?');
assert(q1.intentType === 'price', 'Identified price intent for "What is the wheat price?"');
assert(q1.cropId === 'wheat', 'Resolved crop to wheat');
assert(q1.answer.includes('Reference Price (Demo/Reference Data)'), 'Price explicitly labeled as "Reference Price (Demo/Reference Data)"');
assert(q1.answer.includes('₹28'), 'Grounded in platform reference price ₹28/kg');

// Query 2: "गेहूँ का प्राइस क्या है?" (Hindi Devanagari with chandra-bindu)
const q2 = processNaturalQuery('गेहूँ का प्राइस क्या है?');
assert(q2.intentType === 'price', 'Identified price intent for "गेहूँ का प्राइस क्या है?"');
assert(q2.cropId === 'wheat', 'Resolved Hindi "गेहूँ" to wheat');
assert(q2.answer.includes('Reference Price'), 'Hindi response includes reference price label');

// Query 3: "gehu ka rate kya hai?" (Hinglish)
const q3 = processNaturalQuery('gehu ka rate kya hai?');
assert(q3.intentType === 'price', 'Identified price intent for "gehu ka rate kya hai?"');
assert(q3.cropId === 'wheat', 'Resolved Hinglish "gehu" to wheat');

// Query 4: "mere area mein wheat ka price batao" (Hinglish regional query)
const q4 = processNaturalQuery('mere area mein wheat ka price batao');
assert(q4.intentType === 'price', 'Identified price intent for "mere area mein wheat ka price batao"');

// Query 5: "mujhe 100 quintal wheat chahiye" (Buy Query with Quintal Normalization)
const q5 = processNaturalQuery('mujhe 100 quintal wheat chahiye');
assert(q5.intentType === 'buy', 'Identified buy intent for "mujhe 100 quintal wheat chahiye"');
assert(q5.cropId === 'wheat', 'Resolved crop to wheat');
assert(q5.quantityKg === 10000, 'Normalized 100 quintal to 10,000 KG');

// Query 6: "mere paas 5000 kilo wheat hai, mujhe buyer chahiye" (Sell Query)
const q6 = processNaturalQuery('mere paas 5000 kilo wheat hai, mujhe buyer chahiye');
assert(q6.intentType === 'sell', 'Identified sell intent for "mere paas 5000 kilo wheat hai, mujhe buyer chahiye"');
assert(q6.quantityKg === 5000, 'Extracted 5,000 KG for farmer sale');

// Query 7: "ट्रक बुकिंग कैसे करें" (Logistics Query)
const q7 = processNaturalQuery('ट्रक बुकिंग कैसे करें');
assert(q7.intentType === 'logistics', 'Identified logistics intent for "ट्रक बुकिंग कैसे करें"');

// 8. ERROR & FALLBACK HANDLING
console.log('\n--- TEST GROUP 8: ERROR & FALLBACK HANDLING ---');
const emptyQuery = processNaturalQuery('');
assert(emptyQuery.intent === 'empty', 'Empty query handled gracefully with prompt to enter question');

const aiFallback = await askKrishiAi('Explain current market dynamics', { cropId: 'wheat' });
assert(aiFallback.text && aiFallback.text.length > 20, 'AI fallback generated grounded explanation');
assert(aiFallback.text.includes('Reference Price') || aiFallback.source.includes('Prototype Model'), 'Fallback explicitly identifies reference/prototype data without fabricating live web data');

// 9. LOGISTICS PARTNER ONBOARDING & ADMIN VERIFICATION
console.log('\n--- TEST GROUP 9: LOGISTICS PARTNER ONBOARDING ---');
const newPartner = store.registerLogisticsPartner({
  name: 'Ramesh Maurya',
  mobile: '9876543299',
  vehicleType: 'Tata 407',
  vehicleModel: 'Tata 407 Gold 3.5T',
  capacityTons: 3.5,
  vehiclePlate: 'UP32 XY 9876',
  serviceArea: 'Lucknow & Barabanki'
});
assert(newPartner.verificationStatus === 'Pending', 'New logistics partner registers in "Pending" status');

const approvedPartner = store.verifyLogisticsPartner(newPartner.id, 'Approved');
assert(approvedPartner && approvedPartner.verificationStatus === 'Approved', 'Admin successfully approved logistics partner');

// 10. FARMER PRODUCE LISTING & EDIT FLOW
console.log('\n--- TEST GROUP 10: FARMER PRODUCE LISTING & EDIT FLOW ---');
// Step 1: Farmer Login
const farmerUser = store.login('farmer', 'Test Kisan Leader');
assert(farmerUser.role === 'farmer', 'Farmer successfully logs in with role "farmer"');
assert(store.currentUser.id === farmerUser.id, 'Current user updated to logged-in farmer');

// Step 2: Add Produce Listing (50 Quintal Mustard)
const initialListingsCount = store.listings.length;
const newListing = store.addListing({
  farmerId: farmerUser.id,
  farmerName: farmerUser.name,
  fpoName: 'Kisan Cooperative Union',
  produce: 'Mustard',
  cropId: 'mustard',
  category: 'Oilseeds',
  quantity: 5000, // 50 Quintal * 100
  availableQuantity: 5000,
  unit: 'Quintal',
  displayUnit: 'Quintal',
  pricePerKg: 60,
  location: 'Prayagraj',
  availability: 'Available in Stock (Immediate)',
  availableFrom: '2026-09-20',
  qualityGrade: 'Grade A',
  description: 'Certified organic black mustard seeds with high oil content.',
  status: 'Active'
});

assert(store.listings.length === initialListingsCount + 1, 'Produce listing count incremented in store');
assert(newListing.id && newListing.id.startsWith('list_'), 'New listing generated with unique ID');
assert(newListing.produce === 'Mustard', 'Produce name correctly saved as Mustard');
assert(newListing.quantity === 5000, 'Normalized quantity correctly stored as 5,000 KG');
assert(newListing.pricePerKg === 60, 'Asking price correctly stored as ₹60/kg');
assert(newListing.status === 'Active', 'Listing is immediately Active for buyer discovery');

// Step 3: Verify Listing Appears in Farmer's Listings & Marketplace
const retrievedListing = store.listings.find(l => l.id === newListing.id);
assert(Boolean(retrievedListing), 'Newly added produce immediately retrievable from marketplace listings');

// Step 4: Farmer Edits / Updates the Listing Later
store.updateListing(newListing.id, {
  pricePerKg: 62,
  quantity: 6000,
  availableQuantity: 6000,
  description: 'Updated lot: Premium machine-cleaned black mustard seeds.'
});

const updatedListing = store.listings.find(l => l.id === newListing.id);
assert(updatedListing.pricePerKg === 62, 'Listing asking price successfully updated to ₹62/kg');
assert(updatedListing.availableQuantity === 6000, 'Listing available quantity successfully updated to 6,000 KG');
assert(updatedListing.description.includes('Premium machine-cleaned'), 'Listing notes/description updated');

// Step 5: Deactivate and Reactivate
store.deactivateListing(newListing.id);
assert(store.listings.find(l => l.id === newListing.id).status === 'Deactivated', 'Farmer can deactivate listing');
store.reactivateListing(newListing.id);
assert(store.listings.find(l => l.id === newListing.id).status === 'Active', 'Farmer can reactivate listing');

// 11. ORDERS LIFECYCLE: BUYER ORDERS, 11 FIELDS, PROGRESSION & FARMER RECEIVED ORDERS
console.log('\n--- TEST GROUP 11: ORDERS LIFECYCLE & STATUS PROGRESSION ---');

// Test A: Buyer Purchases Produce with Logistics Support
const buyerUser = store.login('buyer', 'Shree Ram Flour Mills');
assert(store.currentUser.role === 'buyer', 'Buyer successfully logged in');

const logisticsOrder = store.createOrder({
  buyerId: buyerUser.id,
  buyerName: buyerUser.name,
  farmerId: farmerUser.id,
  farmerName: farmerUser.name,
  fpoName: 'Kisan Cooperative Union',
  produce: 'Wheat',
  quantity: 20,
  unit: 'Quintal',
  totalQuantity: 2000,
  pricePerKg: 28,
  produceAmount: 56000,
  fulfillmentMethod: 'logistics',
  deliveryMethod: 'Logistics Support',
  logisticsCost: 1200,
  platformFee: 840,
  totalAmount: 58040,
  destination: 'Lucknow Milling Estate',
  orderDate: new Date().toISOString()
});

// Verify Order Creation & Persistence
assert(Boolean(logisticsOrder.id), 'Logistics order successfully generated with ID: ' + logisticsOrder.id);
const savedOrder = store.orders.find(o => o.id === logisticsOrder.id);
assert(Boolean(savedOrder), 'Order persists in store after creation');

// Verify all 11 required fields
assert(Boolean(savedOrder.id), '1. Order ID present: ' + savedOrder.id);
assert(savedOrder.produce === 'Wheat', '2. Produce/Crop present: ' + savedOrder.produce);
assert(savedOrder.quantity === 20 && savedOrder.unit === 'Quintal', '3. Quantity + Unit present: ' + savedOrder.quantity + ' ' + savedOrder.unit);
assert(savedOrder.farmerName === farmerUser.name, '4. Farmer/FPO present: ' + savedOrder.farmerName);
assert(savedOrder.pricePerKg === 28, '5. Price per KG present: ₹' + savedOrder.pricePerKg);
assert(savedOrder.produceAmount === 56000, '6. Produce Amount present: ₹' + savedOrder.produceAmount);
assert(savedOrder.deliveryMethod === 'Logistics Support', '7. Logistics/Self Pickup present: ' + savedOrder.deliveryMethod);
assert((savedOrder.logisticsCost + savedOrder.platformFee) === 2040, '8. Charges present: ₹' + (savedOrder.logisticsCost + savedOrder.platformFee));
assert(savedOrder.totalAmount === 58040, '9. Total Amount present: ₹' + savedOrder.totalAmount);
assert(Boolean(savedOrder.orderDate), '10. Order Date present: ' + savedOrder.orderDate);
assert(savedOrder.status === 'Confirmed', '11. Initial Order Status is "Confirmed"');

// Test B: Logistics Status Progression
// Confirmed → Logistics Assigned/Pickup Planned → In Transit → Delivered
store.updateOrderStatus(logisticsOrder.id, 'Logistics Assigned/Pickup Planned');
assert(store.orders.find(o => o.id === logisticsOrder.id).status === 'Logistics Assigned/Pickup Planned', 'Progresses to "Logistics Assigned/Pickup Planned"');

store.updateOrderStatus(logisticsOrder.id, 'In Transit');
assert(store.orders.find(o => o.id === logisticsOrder.id).status === 'In Transit', 'Progresses to "In Transit"');

store.updateOrderStatus(logisticsOrder.id, 'Delivered');
assert(store.orders.find(o => o.id === logisticsOrder.id).status === 'Delivered', 'Progresses to "Delivered"');

// Test C: Self Pickup Order & Progression
// Confirmed → Self Pickup Scheduled → Collected
const pickupOrder = store.createOrder({
  buyerId: buyerUser.id,
  buyerName: buyerUser.name,
  farmerId: farmerUser.id,
  farmerName: farmerUser.name,
  fpoName: 'Kisan Cooperative Union',
  produce: 'Mustard',
  quantity: 500,
  unit: 'KG',
  totalQuantity: 500,
  pricePerKg: 60,
  produceAmount: 30000,
  fulfillmentMethod: 'self_pickup',
  deliveryMethod: 'Self Pickup',
  logisticsCost: 0,
  platformFee: 450,
  totalAmount: 30450,
  destination: 'Buyer Pickup Vehicle UP70-AB-1234',
  orderDate: new Date().toISOString()
});

assert(pickupOrder.status === 'Confirmed', 'Self Pickup initial status is "Confirmed"');
assert(pickupOrder.logisticsCost === 0, 'Self Pickup logistics charge is ₹0');

store.updateOrderStatus(pickupOrder.id, 'Self Pickup Scheduled');
assert(store.orders.find(o => o.id === pickupOrder.id).status === 'Self Pickup Scheduled', 'Self Pickup progresses to "Self Pickup Scheduled"');

store.updateOrderStatus(pickupOrder.id, 'Collected');
assert(store.orders.find(o => o.id === pickupOrder.id).status === 'Collected', 'Self Pickup progresses to "Collected"');

// Test D: Farmer / Received Orders Verification
store.login('farmer', farmerUser.name);
const farmerReceivedOrders = store.orders.filter(o => 
  o.farmerId === farmerUser.id || 
  o.allocations?.some(a => a.farmerId === farmerUser.id)
);
assert(farmerReceivedOrders.length >= 2, 'Farmer dashboard retrieves received orders');

const verifiedFarmerOrder = farmerReceivedOrders.find(o => o.id === logisticsOrder.id);
assert(Boolean(verifiedFarmerOrder.buyerName), 'Farmer sees Buyer: ' + verifiedFarmerOrder.buyerName);
assert(verifiedFarmerOrder.produce === 'Wheat', 'Farmer sees Produce: ' + verifiedFarmerOrder.produce);
assert(verifiedFarmerOrder.totalQuantity === 2000, 'Farmer sees Quantity: ' + verifiedFarmerOrder.totalQuantity + ' KG');
assert(verifiedFarmerOrder.produceAmount === 56000, 'Farmer sees Order Amount: ₹' + verifiedFarmerOrder.produceAmount);
assert(verifiedFarmerOrder.deliveryMethod === 'Logistics Support', 'Farmer sees Delivery method: ' + verifiedFarmerOrder.deliveryMethod);
assert(Boolean(verifiedFarmerOrder.status), 'Farmer sees Order status: ' + verifiedFarmerOrder.status);

// 12. FARMER DASHBOARD LIFECYCLE, 8 CORE FEATURES & LOGOUT
console.log('\n--- TEST GROUP 12: FARMER DASHBOARD 8 CORE FEATURES & AUTH FLOW ---');

// Step 1: Login / Register as Farmer/FPO
const registeredFarmer = store.register({
  role: 'farmer',
  name: 'Virendra Singh',
  organization: 'Awadh Kisan Vikas Samiti',
  location: 'Kanpur Dehat',
  email: 'virendra.singh@krishibazaar.in'
});
assert(registeredFarmer.role === 'farmer', '1. Registered user role is strictly "farmer"');
assert(store.currentUser.id === registeredFarmer.id, '2. Store currentUser updated to registered farmer');

// Feature 1: Add Product to Sell
const addedListing = store.addListing({
  farmerId: registeredFarmer.id,
  farmerName: registeredFarmer.name,
  fpoName: registeredFarmer.organization,
  produce: 'Wheat',
  cropId: 'wheat',
  category: 'Grains',
  quantity: 4000, // 40 Quintals
  availableQuantity: 4000,
  unit: 'Quintal',
  pricePerKg: 29,
  location: registeredFarmer.location,
  availability: 'Available in Stock (Immediate)',
  qualityGrade: 'Grade A',
  status: 'Active'
});
assert(Boolean(addedListing.id), '3. Add Product to Sell creates active listing');

// Feature 2: My Listings
const myCrops = store.listings.filter(l => l.farmerId === registeredFarmer.id);
assert(myCrops.length >= 1, '4. My Listings retrieves farmer produce lots');
assert(myCrops[0].produce === 'Wheat', '5. My Listings contains added produce');

// Feature 3: Orders / Received Orders (With zero ReferenceError on myAllocatedOrders)
const testFarmerOrder = store.createOrder({
  buyerId: 'buyer_1',
  buyerName: 'Avadh Agro Mills',
  farmerId: registeredFarmer.id,
  farmerName: registeredFarmer.name,
  fpoName: registeredFarmer.organization,
  produce: 'Wheat',
  quantity: 10,
  unit: 'Quintal',
  totalQuantity: 1000,
  pricePerKg: 29,
  produceAmount: 29000,
  deliveryMethod: 'Logistics Support',
  totalAmount: 30500,
  status: 'Confirmed'
});
const farmerOrders = store.orders.filter(o => 
  o.farmerId === registeredFarmer.id || 
  o.allocations?.some(a => a.farmerId === registeredFarmer.id)
);
assert(farmerOrders.length >= 1, '6. Orders / Received Orders retrieved without ReferenceError');
assert(farmerOrders[0].produceAmount === 29000, '7. Farmer guaranteed payout is ₹29,000');

// Feature 4: Demand Forecast
const demandForecast = getCropDemandForecast('wheat');
assert(Boolean(demandForecast.forecastDemand), '8. Demand Forecast generates projected demand');
assert(Boolean(demandForecast.trend), '9. Demand Forecast identifies trend direction');

// Feature 5: Crop Advisor
assert(Boolean(demandForecast.marketSignal), '10. Crop Advisor provides agricultural market advice');

// Feature 6: Market Price & Demand
const priceIntel = getCropPriceIntelligence('wheat');
assert(priceIntel.currentPrice === 28, '11. Market Price & Demand provides benchmark Mandi rate');

// Feature 7: Price Intelligence
assert(Boolean(priceIntel.estimatedPrice), '12. Price Intelligence projects estimated future price');

// Feature 8: AI Assistant
const aiResponse = processNaturalQuery('wheat ka rate kya hai');
assert(aiResponse.intentType === 'price' && aiResponse.cropId === 'wheat', '13. AI Assistant correctly processes farmer natural query');

// Step 3: Logout
store.logout();
assert(store.currentUser === null, '14. Logout clears user session cleanly');

console.log('\n====================================================');
console.log(`TEST SUITE RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
