// Comprehensive Verification Suite for Context-Aware Krishi AI
// Tests all 4 role assistants, NLP (Hindi, Hinglish, English), voice command flow,
// website control actions, role permission gates, real state updates, and error fallbacks.

import { processNaturalQuery, getAssistantMetaForRole, extractCrop, extractQuantity, extractOrderId, resolveRole } from './src/services/nluService.js';
import { store } from './src/services/store.js';
import { i18n } from './src/services/i18nService.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('====================================================');
console.log('KRISHI AI CONTEXT-AWARE & NLP TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. Role Assistant Meta Tests
// ----------------------------------------------------
console.log('--- 1. ASSISTANT METADATA & BRANDING ADAPTATION ---');

const farmerMetaHi = getAssistantMetaForRole('farmer', 'hi');
assert(farmerMetaHi.name === 'कृषि सहायक', 'Farmer assistant name in Hindi is "कृषि सहायक"');
assert(farmerMetaHi.englishName === 'Krishi Sahayak', 'Farmer assistant englishName is "Krishi Sahayak"');

const buyerMetaHi = getAssistantMetaForRole('buyer', 'hi');
assert(buyerMetaHi.name === 'खरीदार सहायक', 'Buyer assistant name in Hindi is "खरीदार सहायक"');
assert(buyerMetaHi.englishName === 'Buyer Assistant', 'Buyer assistant englishName is "Buyer Assistant"');

const logisticsMetaHi = getAssistantMetaForRole('logistics', 'hi');
assert(logisticsMetaHi.name === 'वाहन सहायक', 'Logistics assistant name in Hindi is "वाहन सहायक"');
assert(logisticsMetaHi.englishName === 'Vehicle Assistant', 'Logistics assistant englishName is "Vehicle Assistant"');

const adminMetaHi = getAssistantMetaForRole('admin', 'hi');
assert(adminMetaHi.name === 'व्यवस्था सहायक', 'Admin assistant name in Hindi is "व्यवस्था सहायक"');
assert(adminMetaHi.englishName === 'Admin Assistant', 'Admin assistant englishName is "Admin Assistant"');

// ----------------------------------------------------
// 2. Entity Extraction Tests (Crop, Quantity, Order, Location)
// ----------------------------------------------------
console.log('\n--- 2. ENTITY EXTRACTION TESTS ---');

const crop1 = extractCrop('आज आलू का भाव क्या है?');
assert(crop1 && crop1.id === 'potato', 'Extracts crop "potato" from "आज आलू का भाव क्या है?"');

const crop2 = extractCrop('mere 500 kilo gehu ke liye buyer dhundo');
assert(crop2 && crop2.id === 'wheat', 'Extracts crop "wheat" from Hinglish "gehu"');

const crop3 = extractCrop('saste pyaz khojo');
assert(crop3 && crop3.id === 'onion', 'Extracts crop "onion" from "pyaz"');

const qty1 = extractQuantity('mere 500 kilo gehu');
assert(qty1 && qty1.normalizedKg === 500, 'Extracts 500 kg normalized quantity');

const qty2 = extractQuantity('mujhe 10 quintal wheat chahiye');
assert(qty2 && qty2.normalizedKg === 1000, 'Extracts 10 quintal as 1000 KG (1 Quintal = 100 KG)');

const qty3 = extractQuantity('5 ton');
assert(qty3 && qty3.normalizedKg === 5000, 'Extracts 5 ton as 5000 KG');

const orderId1 = extractOrderId('is order ORD-2026-8812 ko pickup kar liya');
assert(orderId1 === 'ORD-2026-8812', 'Extracts explicit Order ID ORD-2026-8812');

// ----------------------------------------------------
// 3. Farmer AI ("कृषि सहायक") Tests
// ----------------------------------------------------
console.log('\n--- 3. FARMER AI ("कृषि सहायक") TESTS ---');

const f1 = processNaturalQuery('आज आलू का भाव क्या है?', 'wheat', null, { role: 'farmer' });
assert(f1.intent === 'MARKET_PRICE_QUERY', 'Farmer: Mandi price query identified');
assert(f1.crop === 'Potato', 'Farmer: Identified crop as Potato');

const f2 = processNaturalQuery('मेरे 500 किलो गेहूं के लिए खरीदार खोजो', 'wheat', null, { role: 'farmer' });
assert(f2.intent === 'FIND_BUYERS_OR_SELL', 'Farmer: Find buyers intent identified');
assert(f2.action && f2.action.targetView === 'farmer-dashboard', 'Farmer: Action routes to farmer-dashboard');

const f3 = processNaturalQuery('मेरे प्रोडक्ट खोलो', 'wheat', null, { role: 'farmer' });
assert(f3.intent === 'VIEW_FARMER_PRODUCTS', 'Farmer: Open farmer products identified');
assert(f3.action && f3.action.targetView === 'farmer-dashboard', 'Farmer: Action routes to farmer products');

const f4 = processNaturalQuery('मेरा ऑर्डर ट्रैक करो', 'wheat', null, { role: 'farmer' });
assert(f4.intent === 'TRACK_ORDER', 'Farmer: Track order identified');
assert(f4.action && f4.action.targetView === 'order-details', 'Farmer: Action routes to order-details');

const f5 = processNaturalQuery('अगले सीजन में क्या उगाना बेहतर रहेगा?', 'wheat', null, { role: 'farmer' });
assert(f5.intent === 'CROP_PLANNING' || f5.intent === 'CROP_PLANNING_ADVISORY', 'Farmer: Crop planning advisory identified');

const f6 = processNaturalQuery('मार्केटप्लेस खोलो', 'wheat', null, { role: 'farmer' });
assert(f6.intent === 'OPEN_MARKET', 'Farmer: Open marketplace identified');
assert(f6.action && f6.action.targetView === 'marketplace', 'Farmer: Action routes to marketplace');

const f7 = processNaturalQuery('गेहूं की खेती कैसे करें?', 'wheat', null, { role: 'farmer' });
assert(f7.intent === 'AGRONOMY_ADVISORY', 'Farmer: Agronomy advisory identified');

const f8 = processNaturalQuery('mere orders dikhao', 'wheat', null, { role: 'farmer' });
assert(f8.intent === 'VIEW_FARMER_ORDERS', 'Farmer: View orders routes to Farmer Orders (not buyer)');
assert(f8.action.targetView === 'farmer-dashboard', 'Farmer: Target view is farmer-dashboard');

// ----------------------------------------------------
// 4. Buyer AI ("खरीदार सहायक") Tests
// ----------------------------------------------------
console.log('\n--- 4. BUYER AI ("खरीदार सहायक") TESTS ---');

const b1 = processNaturalQuery('मुझे 500 किलो आलू चाहिए', 'potato', null, { role: 'buyer' });
assert(b1.intent === 'PURCHASE_PRODUCT', 'Buyer: Purchase product intent identified');
assert(b1.quantityKg === 500, 'Buyer: Quantity 500 KG captured');
assert(b1.action && b1.action.targetView === 'bulk-requirement', 'Buyer: Action routes to bulk-requirement');

const b2 = processNaturalQuery('सस्ते प्याज खोजो', 'onion', null, { role: 'buyer' });
assert(b2.intent === 'PURCHASE_PRODUCT', 'Buyer: Search cheap onions identified');
assert(b2.crop === 'Onion', 'Buyer: Identified crop as Onion');

const b3 = processNaturalQuery('Marketplace खोलो', 'wheat', null, { role: 'buyer' });
assert(b3.intent === 'OPEN_MARKET', 'Buyer: Marketplace kholo identified');

const b4 = processNaturalQuery('मेरे ऑर्डर दिखाओ', 'wheat', null, { role: 'buyer' });
assert(b4.intent === 'VIEW_BUYER_ORDERS', 'Buyer: View orders routes to Buyer Orders');
assert(b4.action.targetView === 'buyer-dashboard', 'Buyer: Target view is buyer-dashboard');

const b5 = processNaturalQuery('मेरा ऑर्डर कहाँ पहुँचा?', 'wheat', null, { role: 'buyer' });
assert(b5.intent === 'TRACK_ORDER', 'Buyer: Track order status identified');

const b6 = processNaturalQuery('इस किसान के सारे प्रोडक्ट दिखाओ', 'wheat', null, { role: 'buyer' });
assert(b6.intent === 'SEARCH_LISTINGS', 'Buyer: Search farmer produce listings identified');

// ----------------------------------------------------
// 5. Logistics Partner AI ("वाहन सहायक") Tests
// ----------------------------------------------------
console.log('\n--- 5. LOGISTICS PARTNER AI ("वाहन सहायक") TESTS ---');

const l1 = processNaturalQuery('मेरे आज के assigned orders दिखाओ', 'wheat', null, { role: 'logistics' });
assert(l1.intent === 'LOGISTICS_ASSIGNED_ORDERS', 'Logistics: Assigned orders identified');
assert(l1.action && l1.action.targetView === 'logistics-dashboard', 'Logistics: Routes to logistics-dashboard');

const l2 = processNaturalQuery('इस order की pickup details खोलो', 'wheat', null, { role: 'logistics' });
assert(l2.intent === 'LOGISTICS_PICKUP_DETAILS', 'Logistics: Pickup details identified');

// Real state update test: Pickup
const targetTestOrderId = 'ORD-2026-8812';
const l3 = processNaturalQuery(`इस order ${targetTestOrderId} को pickup कर लिया`, 'wheat', null, { role: 'logistics' });
assert(l3.intent === 'LOGISTICS_CONFIRM_PICKUP', 'Logistics: Confirm pickup intent identified');
const updatedOrderAfterPickup = store.orders.find(o => o.id === targetTestOrderId);
assert(updatedOrderAfterPickup && updatedOrderAfterPickup.status === 'Picked Up', 'Logistics: Real order status updated to "Picked Up" in store');

// Real state update test: Dispatch
const l4 = processNaturalQuery(`इस order ${targetTestOrderId} को dispatch करो`, 'wheat', null, { role: 'logistics' });
assert(l4.intent === 'LOGISTICS_DISPATCH_ORDER', 'Logistics: Dispatch order intent identified');
const updatedOrderAfterDispatch = store.orders.find(o => o.id === targetTestOrderId);
assert(updatedOrderAfterDispatch && updatedOrderAfterDispatch.status === 'Dispatched', 'Logistics: Real order status updated to "Dispatched" in store');

// Real state update test: In Transit
const l5 = processNaturalQuery(`start transit`, 'wheat', null, { role: 'logistics' });
assert(l5.intent === 'LOGISTICS_START_TRANSIT', 'Logistics: Start transit intent identified');
const updatedOrderAfterTransit = store.orders.find(o => o.id === targetTestOrderId);
assert(updatedOrderAfterTransit && updatedOrderAfterTransit.status === 'In Transit', 'Logistics: Real order status updated to "In Transit" in store');

// Real state update test: Delivered
const l6 = processNaturalQuery(`order deliver ho gaya`, 'wheat', null, { role: 'logistics' });
assert(l6.intent === 'LOGISTICS_MARK_DELIVERED', 'Logistics: Mark delivered intent identified');
const updatedOrderAfterDelivered = store.orders.find(o => o.id === targetTestOrderId);
assert(updatedOrderAfterDelivered && updatedOrderAfterDelivered.status === 'Delivered', 'Logistics: Real order status updated to "Delivered" in store');

const l7 = processNaturalQuery('मेरा vehicle कहाँ है?', 'wheat', null, { role: 'logistics' });
assert(l7.intent === 'LOGISTICS_VEHICLE_DETAILS', 'Logistics: Vehicle details identified');

const l8 = processNaturalQuery('आज कितने orders deliver हुए?', 'wheat', null, { role: 'logistics' });
assert(l8.intent === 'LOGISTICS_DELIVERY_METRICS', 'Logistics: Delivery metrics identified');

const l9 = processNaturalQuery('Delivery history खोलो', 'wheat', null, { role: 'logistics' });
assert(l9.intent === 'LOGISTICS_DELIVERY_HISTORY', 'Logistics: Delivery history identified');

// ----------------------------------------------------
// 6. Admin AI ("व्यवस्था सहायक") Tests
// ----------------------------------------------------
console.log('\n--- 6. ADMIN AI ("व्यवस्था सहायक") TESTS ---');

const a1 = processNaturalQuery('platform users दिखाओ', 'wheat', null, { role: 'admin' });
assert(a1.intent === 'ADMIN_USERS_AUDIT', 'Admin: Platform users audit identified');
assert(a1.action && a1.action.targetView === 'admin-dashboard', 'Admin: Routes to admin-dashboard');

const a2 = processNaturalQuery('platform overview दिखाओ', 'wheat', null, { role: 'admin' });
assert(a2.intent === 'ADMIN_PLATFORM_OVERVIEW', 'Admin: Platform overview identified');

const a3 = processNaturalQuery('orders audit दिखाओ', 'wheat', null, { role: 'admin' });
assert(a3.intent === 'ADMIN_TRANSACTION_AUDIT', 'Admin: Orders & transaction audit identified');

// ----------------------------------------------------
// 7. Role Permission Enforcements
// ----------------------------------------------------
console.log('\n--- 7. ROLE PERMISSION ENFORCEMENT TESTS ---');

// Farmer cannot execute logistics dispatch
const perm1 = processNaturalQuery('ye order dispatch kar do', 'wheat', null, { role: 'farmer' });
assert(perm1.intent === 'PERMISSION_RESTRICTED', 'Farmer restricted from dispatching commercial carriers');

// Buyer cannot view admin user directory
const perm2 = processNaturalQuery('platform users दिखाओ', 'wheat', null, { role: 'buyer' });
assert(perm2.intent === 'PERMISSION_RESTRICTED', 'Buyer restricted from platform admin users directory');

// ----------------------------------------------------
// 8. High Risk / Confirmation Tests
// ----------------------------------------------------
console.log('\n--- 8. HIGH RISK CONFIRMATION TESTS ---');

const hr1 = processNaturalQuery('cancel order ORD-2026-8812', 'wheat', null, { role: 'buyer' });
assert(hr1.requiresConfirmation === true, 'Cancel order triggers requiresConfirmation: true');
assert(hr1.intentType === 'high_risk', 'Cancel order classified as high_risk intentType');

const hr2 = processNaturalQuery('delete account', 'wheat', null, { role: 'farmer' });
assert(hr2.requiresConfirmation === true, 'Delete account triggers requiresConfirmation: true');

// ----------------------------------------------------
// 9. Hinglish & Natural Language Variations
// ----------------------------------------------------
console.log('\n--- 9. HINGLISH & NATURAL LANGUAGE TESTS ---');

const h1 = processNaturalQuery('bhai mere orders dikha do', 'wheat', null, { role: 'buyer' });
assert(h1.intent === 'VIEW_BUYER_ORDERS', 'Hinglish "bhai mere orders dikha do" understood');

const h2 = processNaturalQuery('mere 500 kilo aloo ke liye buyer dhundo', 'wheat', null, { role: 'farmer' });
assert(h2.intent === 'FIND_BUYERS_OR_SELL', 'Hinglish "mere 500 kilo aloo ke liye buyer dhundo" understood');
assert(h2.crop === 'Potato', 'Identified Potato from "aloo"');

const h3 = processNaturalQuery('marketplace khol', 'wheat', null, { role: 'farmer' });
assert(h3.intent === 'OPEN_MARKET', 'Hinglish "marketplace khol" understood');

const h4 = processNaturalQuery('mera order kaha hai', 'wheat', null, { role: 'buyer' });
assert(h4.intent === 'TRACK_ORDER', 'Hinglish "mera order kaha hai" understood');

// ----------------------------------------------------
// 10. General Krishi Platform Questions & Explainers
// ----------------------------------------------------
console.log('\n--- 10. GENERAL KRISHI QUESTIONS & EXPLAINERS ---');

const g1 = processNaturalQuery('Krishi Bazaar क्या है?');
assert(g1.intent === 'ABOUT_KRISHI_BAZAAR', 'FAQ: "Krishi Bazaar क्या है?" understood');
assert(g1.answer.length > 50, 'FAQ: Krishi Bazaar explainer provides detailed response');

const g2 = processNaturalQuery('Marketplace कैसे काम करता है?');
assert(g2.intent === 'HOW_MARKETPLACE_WORKS', 'FAQ: "Marketplace कैसे काम करता है?" understood');

const g3 = processNaturalQuery('किसान product कैसे list कर सकता है?');
assert(g3.intent === 'HOW_TO_LIST_PRODUCT', 'FAQ: "किसान product कैसे list कर सकता है?" understood');

const g4 = processNaturalQuery('Bulk order क्या होता है?');
assert(g4.intent === 'WHAT_IS_BULK_ORDER', 'FAQ: "Bulk order क्या होता है?" understood');

const g5 = processNaturalQuery('Buyer किसान से directly कैसे खरीद सकता है?');
assert(g5.intent === 'HOW_BUYER_PURCHASES', 'FAQ: "Buyer किसान से directly कैसे खरीद सकता है?" understood');

const g6 = processNaturalQuery('Order के बाद logistics कैसे काम करता है?');
assert(g6.intent === 'HOW_LOGISTICS_WORKS', 'FAQ: "Order के बाद logistics कैसे काम करता है?" understood');

const g7 = processNaturalQuery('Krishi AI क्या कर सकता है?');
assert(g7.intent === 'WHAT_CAN_AI_DO', 'FAQ: "Krishi AI क्या कर सकता है?" understood');

const g8 = processNaturalQuery('मेरे order का status कैसे check करूं?');
assert(g8.intent === 'HOW_TO_CHECK_ORDER_STATUS', 'FAQ: "मेरे order का status कैसे check करूं?" understood');

// ----------------------------------------------------
// 11. AGENTIC BUY / SELL REQUEST TESTS
// ----------------------------------------------------
console.log('\n--- 11. AGENTIC BUY / SELL REQUEST TESTS ---');

// Agentic Buy
const ab1 = processNaturalQuery('500 kilo wheat order karo');
assert(ab1.intent === 'AGENTIC_BUY_REQUEST', 'Agentic Buy: "500 kilo wheat order karo" detected');
assert(ab1.intentType === 'agentic_buy', 'Agentic Buy: intentType is agentic_buy');
assert(ab1.requiresConfirmation === true, 'Agentic Buy: requiresConfirmation is true');
assert(ab1.quantityKg === 500, 'Agentic Buy: quantity is 500 KG');
assert(ab1.action?.isAgenticAction === true, 'Agentic Buy: action.isAgenticAction is true');
assert(ab1.matchResult !== undefined, 'Agentic Buy: matchResult is present');

const ab2 = processNaturalQuery('तुरंत ऑर्डर 10 quintal चावल');
assert(ab2.intent === 'AGENTIC_BUY_REQUEST', 'Agentic Buy: Hindi "तुरंत ऑर्डर 10 quintal चावल" detected');
assert(ab2.quantityKg === 1000, 'Agentic Buy: 10 quintal = 1000 KG correctly normalized');

const ab3 = processNaturalQuery('abhi kharido 200 kg mustard');
assert(ab3.intent === 'AGENTIC_BUY_REQUEST', 'Agentic Buy: "abhi kharido 200 kg mustard" detected');
assert(ab3.cropId === 'mustard', 'Agentic Buy: crop mustard detected');

// Agentic Sell
const as1 = processNaturalQuery('500 kg wheat list kar do');
assert(as1.intent === 'AGENTIC_SELL_REQUEST', 'Agentic Sell: "500 kg wheat list kar do" detected');
assert(as1.intentType === 'agentic_sell', 'Agentic Sell: intentType is agentic_sell');
assert(as1.requiresConfirmation === true, 'Agentic Sell: requiresConfirmation is true');
assert(as1.action?.isAgenticAction === true, 'Agentic Sell: action.isAgenticAction is true');

const as2 = processNaturalQuery('अभी बेचो 1000 kg आलू');
assert(as2.intent === 'AGENTIC_SELL_REQUEST', 'Agentic Sell: Hindi "अभी बेचो 1000 kg आलू" detected');
assert(as2.cropId === 'potato', 'Agentic Sell: crop potato detected');
assert(as2.quantityKg === 1000, 'Agentic Sell: quantity is 1000 KG');

const as3 = processNaturalQuery('listing banao 5 quintal onion');
assert(as3.intent === 'AGENTIC_SELL_REQUEST', 'Agentic Sell: "listing banao 5 quintal onion" detected');
assert(as3.quantityKg === 500, 'Agentic Sell: 5 quintal = 500 KG correctly normalized');

// Agentic Store Mutation Test
const ordersBefore = store.orders.length;
const newOrder = store.createOrder({
  produce: 'Wheat',
  quantity: 500,
  totalQuantity: 500,
  unit: 'kg',
  status: 'Confirmed',
  buyerName: 'AI Test Buyer'
});
assert(store.orders.length === ordersBefore + 1, 'Agentic Store: createOrder increases order count');
assert(newOrder.id && newOrder.id.startsWith('ORD-'), 'Agentic Store: created order has valid ID');
assert(newOrder.status === 'Confirmed', 'Agentic Store: created order status is Confirmed');

const listingsBefore = store.listings.length;
const newListing = store.addListing({
  produce: 'Rice',
  cropId: 'rice',
  quantity: 1000,
  pricePerKg: 42,
  location: 'Prayagraj',
  farmerName: 'AI Test Farmer'
});
assert(store.listings.length === listingsBefore + 1, 'Agentic Store: addListing increases listing count');
assert(newListing.status === 'Active', 'Agentic Store: created listing status is Active');

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('====================================================\n');
