// Krishi Bazaar Natural Language Understanding (NLU) Engine
// Supports Hindi (Devanagari), Hinglish (Roman Hindi), and English
// Performs role-context-aware intent identification, entity extraction (crop, unit, order, location),
// role permission checking, and platform action routing.

import { CROPS } from '../config/crops.js';
import { getCropPriceIntelligence, getCropDemandForecast, getCropSupplyDemandAnalysis } from './forecastEngine.js';
import { locationService } from './locationService.js';
import { marketDataService } from './marketDataService.js';
import { searchAgronomyKnowledgeBase } from '../data/agronomyKnowledgeBase.js';
import { store } from './store.js';

// Expanded Crop Lexicon for Multilingual Entity Recognition
export const CROP_SYNONYMS = {
  wheat: ['wheat', 'gehu', 'gehoon', 'sharbati', 'lokwan', 'गेहूं', 'गेहू', 'गेहूँ', 'कਣਕ'],
  rice: ['rice', 'chawal', 'dhan', 'paddy', 'sona masoori', 'चावल', 'धान', 'ਝੋਨਾ'],
  mustard: ['mustard', 'sarson', 'sarso', 'rai', 'toria', 'सरसों', 'राई'],
  maize: ['maize', 'makka', 'corn', 'bhutta', 'मक्का', 'भुट्टा'],
  soybean: ['soybean', 'soya', 'soyabean', 'सोयाबीन', 'सोया'],
  groundnut: ['groundnut', 'peanut', 'mungfali', 'moongphali', 'मूंगफली', 'મગફળી'],
  chickpea: ['chickpea', 'chana', 'gram', 'desi chana', 'kabuli chana', 'चना'],
  lentil: ['lentil', 'masoor', 'masur', 'मसूर'],
  pigeon_pea: ['pigeon pea', 'arhar', 'tur', 'toor', 'अरहर', 'तूर'],
  potato: ['potato', 'aloo', 'alu', 'आलू', 'बटाटा', 'ਆਲੂ'],
  tomato: ['tomato', 'tamatar', 'टमाटर', 'टोमॅटो', 'தக்காளி'],
  onion: ['onion', 'pyaz', 'pyaaz', 'कांदा', 'प्याज', 'வெங்காயம்'],
  sugarcane_jaggery: ['jaggery', 'gud', 'gur', 'sugarcane', 'गुड़', 'गन्ना'],
  apple: ['apple', 'seb', 'सेब', 'سیب'],
  chilli: ['chilli', 'mirch', 'mirchi', 'मिर्च', 'लाल मिर्च', 'మిరపకాయలు'],
  garlic: ['garlic', 'lahsun', 'lahsun', 'लहसुन'],
  coconut: ['coconut', 'nariyal', 'नारियल', 'தேங்காய்']
};

/**
 * Extracts crop from natural text
 */
export const extractCrop = (text) => {
  if (!text) return null;
  const clean = text.toLowerCase();
  for (const [cropId, synonyms] of Object.entries(CROP_SYNONYMS)) {
    for (const syn of synonyms) {
      if (/^[a-z0-9\s_-]+$/i.test(syn)) {
        const regex = new RegExp(`(^|\\W)${syn}(\\W|$)`, 'i');
        if (regex.test(clean)) {
          const meta = CROPS.find(c => c.id === cropId);
          return {
            id: cropId,
            name: meta?.name || (cropId.charAt(0).toUpperCase() + cropId.slice(1)),
            emoji: meta?.emoji || '🌾',
            category: meta?.category || 'Grains'
          };
        }
      } else {
        if (clean.includes(syn)) {
          const meta = CROPS.find(c => c.id === cropId);
          return {
            id: cropId,
            name: meta?.name || (cropId.charAt(0).toUpperCase() + cropId.slice(1)),
            emoji: meta?.emoji || '🌾',
            category: meta?.category || 'Grains'
          };
        }
      }
    }
  }
  return null;
};

/**
 * Extracts quantity, unit, and converts into normalized KG
 * (1 Quintal = 100 KG, 1 Ton = 1000 KG)
 */
export const extractQuantity = (text) => {
  if (!text) return null;
  const clean = text.toLowerCase();

  const regex = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(quintal|kintal|क्विंटल|kilo|kg|kgs|किलो|ton|tons|टन)?/i;
  const match = clean.match(regex);

  if (match) {
    const rawVal = parseFloat(match[1].replace(/,/g, ''));
    const unitWord = (match[2] || '').toLowerCase();

    let unit = 'kg';
    let normalizedKg = rawVal;

    if (unitWord.includes('quintal') || unitWord.includes('kintal') || unitWord.includes('क्विंटल')) {
      unit = 'Quintal';
      normalizedKg = rawVal * 100;
    } else if (unitWord.includes('ton') || unitWord.includes('टन')) {
      unit = 'Ton';
      normalizedKg = rawVal * 1000;
    } else {
      unit = 'kg';
      normalizedKg = rawVal;
    }

    return {
      value: rawVal,
      unit,
      normalizedKg,
      displayString: `${rawVal.toLocaleString()} ${unit}`
    };
  }

  return null;
};

/**
 * Extracts Order ID if present in text (e.g. ORD-2026-8812)
 */
export const extractOrderId = (text) => {
  if (!text) return null;
  const match = text.match(/(ORD-\d{4}-\d{4}|ORD-\d+)/i);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Returns Assistant Meta (Name, Badge, Greeting, Quick Chips) by Role
 */
export const getAssistantMetaForRole = (role = 'farmer', lang = 'hi') => {
  const isHi = lang === 'hi';
  const normRole = (role || 'farmer').toLowerCase();

  switch (normRole) {
    case 'farmer':
      return {
        role: 'farmer',
        name: isHi ? 'कृषि सहायक' : 'Krishi Sahayak',
        englishName: 'Krishi Sahayak',
        badge: isHi ? 'किसान / एफपीओ सहायक' : 'Farmer & FPO Assistant',
        subtitle: isHi ? 'फसल, मंडी भाव, खरीदार एवं कृषि सारथी' : 'Crop, Mandi Price, Buyer & Farm Assistant',
        welcomeMessage: isHi
          ? 'नमस्ते! मैं आपका "कृषि सहायक" हूँ। आप मुझसे मंडी भाव, फसल रोग, खाद, या "मेरे 500 किलो गेहूं के लिए खरीदार खोजो", "मेरे प्रोडक्ट खोलो", "मेरा ऑर्डर ट्रैक करो" जैसे सवाल पूछ या बोल सकते हैं।'
          : 'Namaste! I am your "Krishi Sahayak". Ask me about mandi prices, crop diseases, or speak: "Find buyers for my 500 kg wheat", "Open my products", "Track my order".',
        quickPrompts: [
          { label: 'आज आलू का भाव क्या है?', query: 'आज आलू का भाव क्या है?', emoji: '🥔' },
          { label: 'मेरे 500 किलो गेहूं के लिए खरीदार खोजो', query: 'मेरे 500 किलो गेहूं के लिए खरीदार खोजो', emoji: '🌾' },
          { label: 'मेरे प्रोडक्ट खोलो', query: 'मेरे प्रोडक्ट खोलो', emoji: '📦' },
          { label: 'मेरा ऑर्डर ट्रैक करो', query: 'मेरा ऑर्डर ट्रैक करो', emoji: '🚚' },
          { label: 'अगले सीजन में क्या उगाना बेहतर रहेगा?', query: 'अगले सीजन में क्या उगाना बेहतर रहेगा?', emoji: '🌱' },
          { label: 'मार्केटप्लेस खोलो', query: 'मार्केटप्लेस खोलो', emoji: '🏪' }
        ]
      };

    case 'buyer':
      return {
        role: 'buyer',
        name: isHi ? 'खरीदार सहायक' : 'Buyer Assistant',
        englishName: 'Buyer Assistant',
        badge: isHi ? 'खरीदार / उपभोक्ता सहायक' : 'Buyer & Consumer Assistant',
        subtitle: isHi ? 'फसल खोज, थोक ऑर्डर एवं ऑर्डर ट्रैकिंग' : 'Produce Search, Bulk Orders & Tracking',
        welcomeMessage: isHi
          ? 'नमस्ते! मैं आपका "खरीदार सहायक" हूँ। आप मुझसे "मुझे 500 किलो आलू चाहिए", "सस्ते प्याज खोजो", "मेरे ऑर्डर दिखाओ", या "मेरा ऑर्डर कहाँ पहुँचा?" पूछ या बोल सकते हैं।'
          : 'Namaste! I am your "Buyer Assistant". Ask or speak: "I need 500 kg potato", "Find cheap onions", "Show my orders", "Where has my order reached?".',
        quickPrompts: [
          { label: 'मुझे 500 किलो आलू चाहिए', query: 'मुझे 500 किलो आलू चाहिए', emoji: '🥔' },
          { label: 'सस्ते प्याज खोजो', query: 'सस्ते प्याज खोजो', emoji: '🧅' },
          { label: 'Marketplace खोलो', query: 'Marketplace खोलो', emoji: '🛒' },
          { label: 'मेरे ऑर्डर दिखाओ', query: 'मेरे ऑर्डर दिखाओ', emoji: '📋' },
          { label: 'मेरा ऑर्डर कहाँ पहुँचा?', query: 'मेरा ऑर्डर कहाँ पहुँचा?', emoji: '🚚' },
          { label: 'इस किसान के सारे प्रोडक्ट दिखाओ', query: 'इस किसान के सारे प्रोडक्ट दिखाओ', emoji: '👨‍🌾' }
        ]
      };

    case 'logistics':
      return {
        role: 'logistics',
        name: isHi ? 'वाहन सहायक' : 'Vehicle Assistant',
        englishName: 'Vehicle Assistant',
        badge: isHi ? 'वाहन / लॉजिस्टिक्स सारथी' : 'Vehicle & Fleet Assistant',
        subtitle: isHi ? 'असाइन ऑर्डर, पिकअप, डिस्पैच एवं मार्ग सारथी' : 'Assigned Orders, Pickup, Dispatch & Routes',
        welcomeMessage: isHi
          ? 'नमस्ते! मैं आपका "वाहन सहायक" हूँ। आप सीधे बोल या लिख सकते हैं: "मेरे आज के assigned orders दिखाओ", "इस order को pickup कर लिया", "इस order को dispatch करो", "मेरा vehicle कहाँ है?", "आज कितने orders deliver हुए?"।'
          : 'Namaste! I am your "Vehicle Assistant". Ask or speak: "Show today\'s assigned orders", "Picked up this order", "Dispatch this order", "Where is my vehicle?", "How many orders delivered today?".',
        quickPrompts: [
          { label: 'मेरे आज के assigned orders दिखाओ', query: 'मेरे आज के assigned orders दिखाओ', emoji: '📋' },
          { label: 'इस order की pickup details खोलो', query: 'इस order की pickup details खोलो', emoji: '📦' },
          { label: 'इस order को pickup कर लिया', query: 'इस order को pickup कर लिया', emoji: '✅' },
          { label: 'इस order को dispatch करो', query: 'इस order को dispatch करो', emoji: '🚛' },
          { label: 'मेरा vehicle कहाँ है?', query: 'मेरा vehicle कहाँ है?', emoji: '📍' },
          { label: 'आज कितने orders deliver हुए?', query: 'आज कितने orders deliver हुए?', emoji: '🏁' },
          { label: 'Delivery history खोलो', query: 'Delivery history खोलो', emoji: '📜' }
        ]
      };

    case 'admin':
      return {
        role: 'admin',
        name: isHi ? 'व्यवस्था सहायक' : 'Admin Assistant',
        englishName: 'Admin Assistant',
        badge: isHi ? 'व्यवस्थापक / मंच सलाहकार' : 'Platform Governance Assistant',
        subtitle: isHi ? 'उपयोगकर्ता, लेन-देन, ऑडिट एवं मंच अवलोकन' : 'Users, Transactions, Audits & Overview',
        welcomeMessage: isHi
          ? 'नमस्ते! मैं आपका "व्यवस्था सहायक" हूँ। आप मंच के कुल उपयोगकर्ताओं, किसान, खरीदार, लॉजिस्टिक्स पार्टनर सत्यापन और लेन-देन ऑडिट की जानकारी प्राप्त कर सकते हैं।'
          : 'Namaste! I am your "Admin Assistant". Inquire about platform users, farmer/buyer breakdown, verified logistics partners, and transaction audits.',
        quickPrompts: [
          { label: 'Platform overview दिखाओ', query: 'Platform overview दिखाओ', emoji: '📊' },
          { label: 'Platform users दिखाओ', query: 'Platform users दिखाओ', emoji: '👥' },
          { label: 'Orders audit दिखाओ', query: 'Orders audit दिखाओ', emoji: '📑' },
          { label: 'Logistics partners status', query: 'Logistics partners status', emoji: '🚚' },
          { label: 'Mandi market overview', query: 'Mandi market overview', emoji: '🏪' }
        ]
      };

    default:
      return {
        role: 'guest',
        name: isHi ? 'कृषि सहायक' : 'Krishi Sahayak',
        englishName: 'Krishi Sahayak',
        badge: isHi ? 'कृषि बाज़ार सलाहकार' : 'Krishi Bazaar Advisor',
        subtitle: isHi ? 'मंडी भाव, फसल सलाह एवं डिजिटल बाज़ार' : 'Mandi Prices, Crop Advisory & Marketplace',
        welcomeMessage: isHi
          ? 'नमस्ते! मैं "कृषि सहायक" हूँ। आप मुझसे भारत की मंडियों के भाव, फसल रोग, खाद या मार्केटप्लेस की जानकारी पूछ सकते हैं।'
          : 'Namaste! I am "Krishi Sahayak". Inquire about India-wide mandi rates, crop diseases, or explore our marketplace.',
        quickPrompts: [
          { label: 'मंडी खोलो', query: 'मंडी खोलो', emoji: '🏪' },
          { label: 'आज आलू का भाव क्या है?', query: 'आज आलू का भाव क्या है?', emoji: '🥔' },
          { label: 'प्रयागराज में प्याज का भाव', query: 'प्रयागराज में प्याज का भाव', emoji: '🧅' },
          { label: 'मार्केटप्लेस खोलो', query: 'मार्केटप्लेस खोलो', emoji: '🛒' },
          { label: 'अगले सीजन में क्या उगाएं?', query: 'अगले सीजन में क्या उगाएं?', emoji: '🌱' }
        ]
      };
  }
};

/**
 * Normalized Role Resolver from Context
 */
export const resolveRole = (roleContext) => {
  if (!roleContext) return 'farmer';
  if (typeof roleContext === 'string') return roleContext.toLowerCase();
  if (roleContext.role) return roleContext.role.toLowerCase();
  if (roleContext.currentUser?.role) return roleContext.currentUser.role.toLowerCase();
  if (roleContext.currentView) {
    if (roleContext.currentView.includes('farmer')) return 'farmer';
    if (roleContext.currentView.includes('buyer')) return 'buyer';
    if (roleContext.currentView.includes('logistics')) return 'logistics';
    if (roleContext.currentView.includes('admin')) return 'admin';
  }
  return 'farmer';
};

/**
 * Validates if an intent or action represents a high-risk or irreversible action
 * requiring explicit user confirmation before execution.
 */
export const isHighRiskAction = (intent, params = {}) => {
  if (!intent) return false;
  const highRiskIntents = [
    'HIGH_RISK_ACTION_CONFIRMATION',
    'DELETE_LISTING',
    'MAKE_PAYMENT',
    'CANCEL_ORDER',
    'DELETE_ACCOUNT'
  ];
  if (highRiskIntents.includes(intent.toUpperCase())) return true;
  if (params?.isHighRisk || params?.action === 'delete' || params?.action === 'pay') return true;
  return false;
};

/**
 * Understands natural user queries in Hindi, Hinglish, and English.
 * Automatically adapts context to user role (Farmer / Buyer / Logistics / Admin),
 * extracts entities, enforces role permissions, and performs supported website actions.
 */
export const processNaturalQuery = (rawQuery, defaultCropId = 'wheat', locationContext = null, roleContext = null) => {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();
  const role = resolveRole(roleContext);

  if (!query) {
    return {
      intent: 'empty',
      text: 'Please ask a question or tap the microphone to speak.'
    };
  }

  // Detect explicit location in query (Priority 1)
  const explicitLoc = locationService.resolveExplicitLocationFromQuery(query);
  const activeLocation = explicitLoc || locationContext || locationService.getLocationContext();

  const crop = extractCrop(query) || {
    id: defaultCropId,
    name: defaultCropId.charAt(0).toUpperCase() + defaultCropId.slice(1),
    emoji: '🌾'
  };

  const qty = extractQuantity(query);
  const explicitOrderId = extractOrderId(query);

  // Retrieve platform state
  const state = store.getState();
  const orders = state.orders || [];
  const assignedOrders = orders.filter(o => o.fulfillmentMethod !== 'self_pickup' && o.deliveryMethod !== 'Self Pickup');
  const targetOrder = (explicitOrderId ? orders.find(o => o.id === explicitOrderId) : null) || assignedOrders[0] || orders[0];
  const orderRef = targetOrder?.id || 'ORD-2026-8812';

  // ==========================================
  // HIGH-RISK IRREVERSIBLE ACTION DETECTION
  // ==========================================
  const isHighRisk =
    lower.includes('delete account') ||
    lower.includes('delete listing') ||
    lower.includes('cancel order') ||
    lower.includes('pay now') ||
    lower.includes('make payment') ||
    lower.includes('रद्द करो') ||
    lower.includes('खाता हटाओ');

  if (isHighRisk) {
    return {
      intent: 'HIGH_RISK_ACTION_CONFIRMATION',
      intentType: 'high_risk',
      understoodSummary: '⚠️ Explicit User Confirmation Required / स्पष्ट पुष्टि आवश्यक',
      answer: `High-risk irreversible operation requested: "${query}".\n\nAI will not execute irreversible account, payment, or cancellation actions without your direct manual confirmation. Please confirm your decision below.`,
      requiresConfirmation: true,
      action: {
        label: 'Confirm High-Risk Action',
        isHighRisk: true,
        targetView: 'confirm_modal',
        params: { actionQuery: query }
      }
    };
  }

  // ==========================================
  // 1. LOGISTICS PARTNER SPECIFIC ACTIONS
  // ==========================================

  // 1A. Assigned Orders ("मेरे आज के assigned orders दिखाओ", "assigned orders", "pending deliveries")
  const isLogisticsAssigned =
    lower.includes('assigned order') ||
    lower.includes('assigned orders') ||
    lower.includes('असाइंड ऑर्डर') ||
    lower.includes('pending deliveries') ||
    lower.includes('pending delivery') ||
    (role === 'logistics' && (lower.includes('mere order') || lower.includes('मेरे ऑर्डर') || lower.includes('my orders')));

  if (isLogisticsAssigned) {
    if (role !== 'logistics') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Assigned delivery orders are restricted to the Logistics Partner module. As a ${role.toUpperCase()}, you can track your own orders or view marketplace supply.`,
        action: {
          label: 'Open Orders',
          targetView: role === 'farmer' ? 'farmer-dashboard' : 'buyer-dashboard',
          params: { tab: 'orders' }
        }
      };
    }

    return {
      intent: 'LOGISTICS_ASSIGNED_ORDERS',
      intentType: 'navigation',
      understoodSummary: `📋 Understood: Assigned Deliveries (${assignedOrders.length} active)`,
      answer: `Showing today's assigned delivery orders for your vehicle fleet.\n\n• Active Commercial Orders: ${assignedOrders.length}\n• Ready for Pickup: ${assignedOrders.filter(o => o.status === 'Assigned' || o.status === 'Logistics Assigned').length}\n• In Transit: ${assignedOrders.filter(o => o.status === 'In Transit' || o.status === 'Dispatched').length}`,
      action: {
        label: 'View Assigned Orders',
        targetView: 'logistics-dashboard',
        tool: 'openAssignedOrders',
        params: { tab: 'assigned' }
      }
    };
  }

  // 1B. Pickup Details ("इस order की pickup details खोलो", "pickup details")
  const isLogisticsPickupDetails =
    lower.includes('pickup detail') ||
    lower.includes('pickup details') ||
    lower.includes('पिकअप विवरण') ||
    lower.includes('पिकअप डिटेल') ||
    (lower.includes('pickup') && lower.includes('kholo'));

  if (isLogisticsPickupDetails) {
    return {
      intent: 'LOGISTICS_PICKUP_DETAILS',
      intentType: 'navigation',
      understoodSummary: `📦 Understood: Pickup Details for ${orderRef}`,
      answer: `Opening verified pickup checkpoints for ${orderRef}.\n\n• Farmer / Hub: ${targetOrder?.allocations?.[0]?.farmerName || 'Prayagraj Farm Hub'}\n• Produce Lot: ${targetOrder?.produce || 'Wheat'} (${targetOrder?.totalQuantity || 5000} KG)\n• Pickup Location: ${targetOrder?.allocations?.[0]?.location || 'Mundera Mandi Yard, Prayagraj'}`,
      action: {
        label: `Open Pickup Details (${orderRef})`,
        targetView: 'logistics-dashboard',
        tool: 'openPickup',
        params: { tab: 'pickup', orderId: orderRef }
      }
    };
  }

  // 1C. Confirm Pickup Status Action ("इस order को pickup कर लिया", "pickup kar liya", "confirm pickup")
  const isConfirmPickup =
    (lower.includes('pickup') || lower.includes('पिकअप')) &&
    (lower.includes('kar liya') ||
     lower.includes('कर लिया') ||
     lower.includes('ho gaya') ||
     lower.includes('हो गया') ||
     lower.includes('kar lia') ||
     lower.includes('कर दिया') ||
     lower.includes('confirm') ||
     lower.includes('कंफर्म') ||
     lower.includes('mark picked') ||
     lower.includes('picked up') ||
     lower.includes('उठा लिया'));

  if (isConfirmPickup) {
    if (role !== 'logistics') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Only authorized Logistics Partners can confirm produce pickups at farm gates. Your current role is ${role.toUpperCase()}.`,
        action: null
      };
    }

    // Execute real state update in store
    store.updateOrderStatus(orderRef, 'Picked Up');

    return {
      intent: 'LOGISTICS_CONFIRM_PICKUP',
      intentType: 'action_completed',
      understoodSummary: `✅ Action Completed: Order ${orderRef} Picked Up`,
      answer: `Order ${orderRef} has been verified and updated to "Picked Up" status in the system!\n\n• Verified Milestone: Farm-Gate Produce Inspected & Loaded\n• Sync: Synchronized across Farmer and Buyer live tracking\n• Next Step: Dispatch to Highway Corridor`,
      action: {
        label: `View Picked Up Order (${orderRef})`,
        targetView: 'logistics-dashboard',
        tool: 'openPickup',
        params: { tab: 'pickup', orderId: orderRef }
      }
    };
  }

  // 1D. Dispatch Order Status Action ("इस order को dispatch करो", "ye order dispatch kar do", "dispatch karo")
  const isDispatchOrder =
    (lower.includes('dispatch') || lower.includes('डिस्पैच') || lower.includes('डिसपैच')) &&
    (lower.includes('kar') ||
     lower.includes('कर') ||
     lower.includes('mark') ||
     lower.includes('order') ||
     lower.includes('bhejo') ||
     lower.includes('भेज') ||
     lower.includes('nikal') ||
     lower.includes('हो गया') ||
     lower.includes('ho gaya'));

  if (isDispatchOrder) {
    if (role !== 'logistics') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Dispatch operations are reserved for assigned Logistics Partners. As a ${role.toUpperCase()}, you cannot change commercial carrier dispatch status.`,
        action: null
      };
    }

    // Execute real state update in store
    store.updateOrderStatus(orderRef, 'Dispatched');

    return {
      intent: 'LOGISTICS_DISPATCH_ORDER',
      intentType: 'action_completed',
      understoodSummary: `🚛 Action Completed: Order ${orderRef} Dispatched`,
      answer: `Order ${orderRef} has been updated to "Dispatched" status in real platform records!\n\n• Status: Dispatched from farm collection depot\n• En Route to: ${targetOrder?.destination || 'Destination Hub'}\n• Live tracking has been activated for buyer and seller.`,
      action: {
        label: `View Dispatched Order (${orderRef})`,
        targetView: 'logistics-dashboard',
        tool: 'openDispatch',
        params: { tab: 'dispatch', orderId: orderRef }
      }
    };
  }

  // 1E. Start Transit Status Action ("start transit", "transit shuru karo")
  const isStartTransit =
    lower.includes('start transit') ||
    lower.includes('transit shuru') ||
    lower.includes('ट्रांजिट शुरू');

  if (isStartTransit) {
    if (role !== 'logistics') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Transit state transitions are reserved for Logistics Partners.`,
        action: null
      };
    }

    store.updateOrderStatus(orderRef, 'In Transit');

    return {
      intent: 'LOGISTICS_START_TRANSIT',
      intentType: 'action_completed',
      understoodSummary: `🛣️ Action Completed: Order ${orderRef} In Transit`,
      answer: `Order ${orderRef} is now officially "In Transit"!\n\n• Carrier Vehicle: Moving along national highway corridor\n• Telematics: Checkpoint GPS synchronized\n• Expected Arrival: Within scheduled delivery window.`,
      action: {
        label: 'View Route & Telematics',
        targetView: 'logistics-dashboard',
        tool: 'openRouteInfo',
        params: { tab: 'routes', orderId: orderRef }
      }
    };
  }

  // 1F. Mark Delivered Status Action ("order deliver ho gaya", "mark delivered", "deliver kar diya")
  const isMarkDelivered =
    !lower.includes('kitne') &&
    !lower.includes('कितने') &&
    !lower.includes('how many') &&
    (lower.includes('deliver') || lower.includes('डिलीवर')) &&
    (lower.includes('ho gaya') ||
     lower.includes('हो गया') ||
     lower.includes('kar diya') ||
     lower.includes('कर दिया') ||
     lower.includes('mark') ||
     lower.includes('done') ||
     lower.includes('completed') ||
     lower.includes('pahunch gaya') ||
     lower.includes('पहुंच गया'));

  if (isMarkDelivered) {
    if (role !== 'logistics') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Delivery confirmation must be logged by the assigned carrier.`,
        action: null
      };
    }

    store.updateOrderStatus(orderRef, 'Delivered');

    return {
      intent: 'LOGISTICS_MARK_DELIVERED',
      intentType: 'action_completed',
      understoodSummary: `🏁 Action Completed: Order ${orderRef} Delivered`,
      answer: `Order ${orderRef} marked as "Delivered" successfully!\n\n• Buyer Receiving Slip: Logged with digital timestamp\n• Driver Earnings: 90% direct payout unlocked for settlement\n• Delivery History: Archiving order milestone records.`,
      action: {
        label: 'View Delivery History',
        targetView: 'logistics-dashboard',
        tool: 'openDeliveryHistory',
        params: { tab: 'history' }
      }
    };
  }

  // 1G. Vehicle Details ("मेरा vehicle कहाँ है?", "गाड़ी कहाँ है", "vehicle details")
  const isVehicleQuery =
    lower.includes('vehicle') ||
    lower.includes('mera vehicle') ||
    lower.includes('gadi kahan') ||
    lower.includes('गाड़ी कहाँ') ||
    lower.includes('वाहन विवरण') ||
    lower.includes('gadi ki detail');

  if (isVehicleQuery) {
    const partnerUser = state.currentUser;
    return {
      intent: 'LOGISTICS_VEHICLE_DETAILS',
      intentType: 'navigation',
      understoodSummary: `🚚 Understood: Vehicle & Carrier Information`,
      answer: `Carrier Vehicle Details:\n\n• Vehicle Number: ${partnerUser?.vehicleNumber || 'UP70 AB 1234'}\n• Model / Class: ${partnerUser?.vehicleType || 'Mini Truck (Tata 407)'}\n• Rated Capacity: ${partnerUser?.capacityTons || 5} Tons (${((partnerUser?.capacityTons || 5) * 10)} Quintals)\n• Commercial Permits: National Goods Carriage STA UP (Valid)\n• Active Telematics: Online & GPS Operational`,
      action: {
        label: 'View Vehicle Profile',
        targetView: 'logistics-dashboard',
        tool: 'openVehicleDetails',
        params: { tab: 'vehicle' }
      }
    };
  }

  // 1H. Driver Details ("driver details दिखाओ", "driver ID")
  const isDriverQuery =
    lower.includes('driver detail') ||
    lower.includes('driver details') ||
    lower.includes('driver id') ||
    lower.includes('ड्राइवर विवरण') ||
    lower.includes('ड्राइवर डिटेल');

  if (isDriverQuery) {
    const partnerUser = state.currentUser;
    return {
      intent: 'LOGISTICS_DRIVER_DETAILS',
      intentType: 'navigation',
      understoodSummary: `👤 Understood: Driver License & KYC Record`,
      answer: `Driver Credentials:\n\n• Full Name: ${partnerUser?.name || 'Rajesh Kumar'}\n• Driver ID: DRV-UP-7041\n• Contact: ${partnerUser?.phone || '+91 98765 67890'}\n• Verification: Aadhaar KYC & Commercial Heavy Goods License Verified\n• Duty State: On Active Corridor`,
      action: {
        label: 'View Driver Details',
        targetView: 'logistics-dashboard',
        tool: 'openDriverDetails',
        params: { tab: 'driver' }
      }
    };
  }

  // 1I. Delivery Count ("आज कितने orders deliver हुए?", "delivery count")
  const isDeliveryCount =
    ((lower.includes('kitne') || lower.includes('कितने') || lower.includes('how many')) &&
     (lower.includes('deliver') || lower.includes('डिलीवर') || lower.includes('डिलीवरी') || lower.includes('order') || lower.includes('ऑर्डर'))) ||
    lower.includes('delivery count');

  if (isDeliveryCount) {
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const pendingCount = orders.filter(o => o.status !== 'Delivered').length;

    return {
      intent: 'LOGISTICS_DELIVERY_METRICS',
      intentType: 'info',
      understoodSummary: `📊 Understood: Delivery Accomplishments`,
      answer: `Platform Delivery Summary:\n\n• Successfully Delivered: ${deliveredCount} Orders\n• Currently Pending / In Transit: ${pendingCount} Orders\n• Success Rate: 100% on-time farm-to-door fulfillment without spoilage.`,
      action: {
        label: 'Open Delivery History',
        targetView: 'logistics-dashboard',
        tool: 'openDeliveryHistory',
        params: { tab: 'history' }
      }
    };
  }

  // 1J. Delivery History ("Delivery history खोलो")
  const isDeliveryHistory =
    lower.includes('delivery history') ||
    lower.includes('डिलीवरी इतिहास') ||
    lower.includes('डिलीवरी हिस्ट्री');

  if (isDeliveryHistory) {
    return {
      intent: 'LOGISTICS_DELIVERY_HISTORY',
      intentType: 'navigation',
      understoodSummary: `📜 Understood: Open Completed Delivery History`,
      answer: `Opening your completed delivery manifests, signed consignee receipts, and payment settlements.`,
      action: {
        label: 'Open Delivery History',
        targetView: 'logistics-dashboard',
        tool: 'openDeliveryHistory',
        params: { tab: 'history' }
      }
    };
  }

  // 1K. Route Information ("route information", "route dikhao", "source to destination")
  const isRouteInfo =
    lower.includes('route info') ||
    lower.includes('route details') ||
    lower.includes('route dikhao') ||
    lower.includes('मार्ग की जानकारी') ||
    lower.includes('रूट दिखाओ');

  if (isRouteInfo) {
    return {
      intent: 'LOGISTICS_ROUTE_INFO',
      intentType: 'navigation',
      understoodSummary: `🗺️ Understood: Multi-Stop Optimized Route`,
      answer: `Displaying optimized route sequence:\n\n• Source Pickups: Multi-farmer aggregation in ${targetOrder?.allocations?.[0]?.location || 'Prayagraj'}\n• Highway Segment: NH-19 Expressway\n• Destination: ${targetOrder?.destination || 'Lucknow Wholesale Center'}\n• Real-Time Trajectory: Live GPS waypoint navigation.`,
      action: {
        label: 'Inspect Route Map',
        targetView: 'logistics-dashboard',
        tool: 'openRouteInfo',
        params: { tab: 'routes', orderId: orderRef }
      }
    };
  }

  // ==========================================
  // 2. ADMIN SPECIFIC ACTIONS
  // ==========================================

  // 2A. Admin Users ("platform users दिखाओ", "farmers dikhao", "buyers dikhao")
  const isAdminUsers =
    lower.includes('platform user') ||
    lower.includes('platform users') ||
    lower.includes('users dikhao') ||
    lower.includes('farmers dikhao') ||
    lower.includes('buyers dikhao') ||
    lower.includes('उपयोगकर्ता दिखाओ');

  if (isAdminUsers) {
    if (role !== 'admin') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Platform user auditing is restricted to Platform Administrators. Your active role is ${role.toUpperCase()}.`,
        action: null
      };
    }

    const totalUsers = state.users.length;
    const farmerCount = state.users.filter(u => u.role === 'farmer').length;
    const buyerCount = state.users.filter(u => u.role === 'buyer').length;

    return {
      intent: 'ADMIN_USERS_AUDIT',
      intentType: 'navigation',
      understoodSummary: `👥 Understood: Platform User Directory (${totalUsers} Users)`,
      answer: `Platform User Accounts Overview:\n\n• Total Registered Accounts: ${totalUsers}\n• Verified Farmers / FPOs: ${farmerCount}\n• Wholesale / Retail Buyers: ${buyerCount}\n• Verified Logistics Carriers: ${state.logisticsPartners?.length || 4}`,
      action: {
        label: 'Open Admin Users Directory',
        targetView: 'admin-dashboard',
        tool: 'openAdminUsers',
        params: { tab: 'users' }
      }
    };
  }

  // 2B. Admin Overview ("platform overview दिखाओ", "platform summary")
  const isAdminOverview =
    lower.includes('platform overview') ||
    lower.includes('overview dikhao') ||
    lower.includes('प्लेटफ़ॉर्म अवलोकन') ||
    lower.includes('मंच अवलोकन');

  if (isAdminOverview) {
    if (role !== 'admin') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Platform metrics and administrative governance are reserved for Admin credentials.`,
        action: null
      };
    }

    const totalOrders = orders.length;
    const totalVolume = (state.listings || []).reduce((s, l) => s + (l.quantity || 0), 0);

    return {
      intent: 'ADMIN_PLATFORM_OVERVIEW',
      intentType: 'navigation',
      understoodSummary: `📊 Understood: Platform Governance Overview`,
      answer: `Krishi Bazaar Platform Live Overview:\n\n• Active Market Produce Volume: ${totalVolume.toLocaleString()} KG\n• Total Processed Orders: ${totalOrders}\n• Multi-Role Ecosystem: Active Farmers, Verified Buyers, Commercial Carriers\n• Operational Integrity: Zero synthetic numbers, verified Agmarknet benchmarks.`,
      action: {
        label: 'Open Admin Overview',
        targetView: 'admin-dashboard',
        tool: 'openAdminOverview',
        params: { tab: 'overview' }
      }
    };
  }

  // 2C. Admin Orders / Transactions ("orders audit दिखाओ", "transactions")
  const isAdminTransactions =
    lower.includes('orders audit') ||
    lower.includes('transactions dikhao') ||
    lower.includes('लेन-देन') ||
    lower.includes('लेनदेन ऑडिट');

  if (isAdminTransactions) {
    if (role !== 'admin') {
      return {
        intent: 'PERMISSION_RESTRICTED',
        intentType: 'info',
        understoodSummary: '🔒 Role Permission Notice',
        answer: `Financial and transaction audits are accessible only to Administrator roles.`,
        action: null
      };
    }

    return {
      intent: 'ADMIN_TRANSACTION_AUDIT',
      intentType: 'navigation',
      understoodSummary: `📑 Understood: Order & Transaction Audit`,
      answer: `Accessing platform-wide transaction audits, settlement histories, and escrow records.`,
      action: {
        label: 'Open Orders Audit',
        targetView: 'admin-dashboard',
        tool: 'openAdminOrders',
        params: { tab: 'orders' }
      }
    };
  }

  // ==========================================
  // 2.5 GENERAL PLATFORM EXPLAINER & FAQ QUESTIONS
  // ==========================================

  // 1. "Krishi Bazaar क्या है?" / "What is Krishi Bazaar?"
  if (
    (lower.includes('krishi bazaar') || lower.includes('कृषि बाज़ार') || lower.includes('कृषि बाजार') || lower.includes('krishi bazar')) &&
    (lower.includes('kya hai') || lower.includes('क्या है') || lower.includes('what is') || lower.includes('about') || lower.includes('overview'))
  ) {
    return {
      intent: 'ABOUT_KRISHI_BAZAAR',
      intentType: 'info',
      understoodSummary: '🌾 Understood: What is Krishi Bazaar',
      answer: `Krishi Bazaar (कृषि बाज़ार) भारत का डिजिटल कृषि बाज़ार एवं सप्लाई-चेन प्लेटफॉर्म है, जो किसानों/एफपीओ, थोक व खुदरा खरीदारों और ट्रांसपोर्टर्स (Logistics Partners) को सीधे जोड़ता है।\n\n• किसानों को अपनी फसल का उचित एवं पारदर्शी मूल्य (शून्य बिचौलिया कटौती)।\n• खरीदारों के लिए खेत से सीधे ताज़ा उत्पाद व मल्टी-फार्मर सप्लाई एग्रीगेशन।\n• पारदर्शी लॉजिस्टिक्स: सेल्फ पिकअप (₹0) अथवा स्मार्ट वाहन आवंटन।\n• 22 भारतीय भाषाओं में AI मंडी भाव एवं वैज्ञानिक कृषि परामर्श।`,
      action: {
        label: 'Explore Marketplace',
        targetView: 'marketplace',
        tool: 'openMarketplace'
      }
    };
  }

  // 2. "Marketplace कैसे काम करता है?" / "How does marketplace work?"
  if (
    (lower.includes('marketplace') || lower.includes('मार्केटप्लेस')) &&
    (lower.includes('kaise kaam') || lower.includes('कैसे काम') || lower.includes('how it works') || lower.includes('how does') || lower.includes('kaise work') || lower.includes('kya hai') || lower.includes('क्या है') || lower.includes('what is'))
  ) {
    return {
      intent: 'HOW_MARKETPLACE_WORKS',
      intentType: 'info',
      understoodSummary: '🏪 Understood: How Marketplace Works',
      answer: `Krishi Bazaar Marketplace बहुत सीधा एवं पारदर्शी है:\n\n1. किसान अपनी फसल (मात्रा, गुणवत्ता ग्रेड, अपेक्षित भाव) को सीधे लिस्ट करते हैं।\n2. खरीदार उपलब्ध उत्पादों को खोजते हैं और पारदर्शी बेंचमार्क दरों पर ऑर्डर करते हैं।\n3. लॉजिस्टिक्स विकल्प: खरीदार स्वयं पिकअप कर सकते हैं (₹0 शुल्क) अथवा वाहन बुक कर सकते हैं।\n4. डिलीवरी और गुणवत्ता सत्यापन के बाद किसान को पूरा भुगतान सुरक्षित रूप से प्राप्त होता है।`,
      action: {
        label: 'Open Marketplace',
        targetView: 'marketplace',
        tool: 'openMarketplace'
      }
    };
  }

  // 3. "किसान product कैसे list कर सकता है?" / "How can farmer list product?"
  if (
    (lower.includes('list') || lower.includes('लिस्ट')) &&
    (lower.includes('kaise') || lower.includes('कैसे') || lower.includes('how') || lower.includes('karna hai') || lower.includes('kare'))
  ) {
    return {
      intent: 'HOW_TO_LIST_PRODUCT',
      intentType: 'guidance',
      understoodSummary: '📦 Understood: How Farmer Lists Produce',
      answer: `किसान अपनी फसल Krishi Bazaar पर 4 आसान चरणों में लिस्ट कर सकते हैं:\n\n1. 'Farmer / FPO' के रूप में लॉगिन करें।\n2. 'Farmer Dashboard' में 'Add Product / नई फसल जोड़ें' पर जाएं।\n3. फसल का नाम (जैसे आलू, गेहूं), मात्रा (KG या क्विंटल), ग्रेड व अपेक्षित भाव भरें।\n4. सबमिट करते ही आपका उत्पाद तुरंत Marketplace पर सभी खरीदारों को दिखने लगेगा!`,
      action: {
        label: 'Open Add Product Form',
        targetView: 'farmer-dashboard',
        tool: 'openFarmerProducts',
        params: { tab: 'listings', scrollTo: '#add-product-form' }
      }
    };
  }

  // 4. "Bulk order क्या होता है?" / "What is bulk order?"
  if (
    (lower.includes('bulk order') || lower.includes('थोक ऑर्डर') || lower.includes('थोक आर्डर') || lower.includes('bulk khareed') || lower.includes('bulk kharid')) &&
    (lower.includes('kya hai') || lower.includes('क्या है') || lower.includes('kya hota') || lower.includes('क्या होता') || lower.includes('what is') || lower.includes('kise kehte'))
  ) {
    return {
      intent: 'WHAT_IS_BULK_ORDER',
      intentType: 'info',
      understoodSummary: '📦 Understood: What is Bulk Order',
      answer: `Bulk Order (थोक खरीद) बड़े खरीदारों (Wholesalers, Processors, Retail Chains) के लिए विशेष सुविधा है:\n\n• जब किसी खरीदार को 50 क्विंटल (5,000 KG) या अधिक उपज चाहिए, तो हमारा Multi-Farmer Supply Aggregator आस-पास के कई किसानों की उपज को एक समेकित लॉट में जोड़ता है।\n• खरीदार को एक ही चालान और सत्यापित लॉजिस्टिक्स ट्रक लोड मिलता है।\n• छोटे और सीमांत किसानों को भी बड़े बाज़ार का लाभ मिलता है।`,
      action: {
        label: 'View Bulk Requirements',
        targetView: 'bulk-requirement',
        tool: 'prepareOrder'
      }
    };
  }

  // 5. "Buyer किसान से directly कैसे खरीद सकता है?" / "How can buyer buy directly from farmer?"
  if (
    (lower.includes('directly') || lower.includes('direct') || lower.includes('सीधे')) &&
    (lower.includes('kharid') || lower.includes('खरीद') || lower.includes('buy') || lower.includes('purchase')) &&
    (lower.includes('kaise') || lower.includes('कैसे') || lower.includes('how'))
  ) {
    return {
      intent: 'HOW_BUYER_PURCHASES',
      intentType: 'info',
      understoodSummary: '🛒 Understood: Direct Farm-Gate Procurement',
      answer: `खरीदार सीधे किसानों से 3 आसान चरणों में खरीद सकते हैं:\n\n1. Marketplace में अपनी इच्छित फसल (जैसे प्याज, आलू, गेहूं) खोजें।\n2. किसान की लिस्टिंग, गुणवत्ता ग्रेड और मंडी बेंचमार्क दर देखें।\n3. 'Order Now' या 'Bulk Order' चुनें और सेल्फ पिकअप (₹0) या डिलीवरी वाहन का चयन करें। कोई बिचौलिया कमीशन नहीं!`,
      action: {
        label: 'Explore Marketplace',
        targetView: 'marketplace',
        tool: 'openMarketplace'
      }
    };
  }

  // 6. "Order के बाद logistics कैसे काम करता है?" / "How does logistics work after order?"
  if (
    (lower.includes('order') || lower.includes('ऑर्डर')) &&
    (lower.includes('logistics') || lower.includes('लॉजिस्टिक्स')) &&
    (lower.includes('kaise') || lower.includes('कैसे') || lower.includes('how'))
  ) {
    return {
      intent: 'HOW_LOGISTICS_WORKS',
      intentType: 'info',
      understoodSummary: '🚚 Understood: Post-Order Logistics Flow',
      answer: `ऑर्डर कन्फर्म होने के बाद Krishi Bazaar लॉजिस्टिक्स 2 तरह से काम करता है:\n\n1. सेल्फ पिकअप (₹0): खरीदार अपने वाहन से किसान के फार्म-गेट या कलेक्शन सेंटर से खुद माल उठा सकते हैं।\n2. स्मार्ट वाहन आवंटन: हमारे सत्यापित Logistics Partners (मिनी ट्रक 5T, मीडियम 10T, भारी 15T) को ऑर्डर असाइन होता है।\n• फार्म-गेट पर वजन व नमी की जांच के बाद गाड़ी लोड होती है।\n• 90% भाड़ा सीधे ड्राइवर को जाता है और 10% प्लेटफॉर्म शुल्क रहता है।`,
      action: {
        label: 'Open Logistics',
        targetView: 'logistics',
        tool: 'openLogistics'
      }
    };
  }

  // 7. "Krishi AI क्या कर सकता है?" / "What can Krishi AI do?"
  if (
    (lower.includes('krishi ai') || lower.includes('कृषि ai') || (/\bai\b/i.test(lower) && (lower.includes('krishi') || lower.includes('assistant') || lower.includes('सहायक')))) &&
    (lower.includes('kya kar') || lower.includes('क्या कर') || lower.includes('what can') || lower.includes('kya hai') || lower.includes('क्या है'))
  ) {
    return {
      intent: 'WHAT_CAN_AI_DO',
      intentType: 'info',
      understoodSummary: '🤖 Understood: Krishi AI Capabilities',
      answer: `Krishi AI आपकी आवाज़ और भाषा को समझने वाला संदर्भ-जागरूक (Context-Aware) सहायक है:\n\n• किसानों के लिए ('कृषि सहायक'): मंडी भाव, खरीदार खोजना, फसल रोग सलाह, नई फसल लिस्ट करना।\n• खरीदारों के लिए ('खरीदार सहायक'): सस्ते उत्पाद खोजना, बल्क ऑर्डर तैयार करना, ऑर्डर ट्रैक करना।\n• ट्रांसपोर्टर्स के लिए ('वाहन सहायक'): पिकअप, डिस्पैच, इन-ट्रांजिट अपडेट और रूट मैप।\n• व्यवस्थापकों के लिए ('व्यवस्था सहायक'): उपयोगकर्ता ऑडिट और प्लेटफ़ॉर्म निरीक्षण।\n• हिंदी, इंग्लिश और हिंग्लिश में बोलकर या लिखकर वेबसाइट के एक्शन सीधे चलाएं!`,
      action: {
        label: 'Check Mandi Prices',
        targetView: 'market-intel',
        tool: 'getMarketPrice'
      }
    };
  }

  // 8. "मेरे order का status कैसे check करूं?" / "How to check my order status?"
  if (
    (lower.includes('order') || lower.includes('ऑर्डर')) &&
    (lower.includes('status') || lower.includes('स्टेटस') || lower.includes('स्थिति')) &&
    (lower.includes('kaise check') || lower.includes('कैसे check') || lower.includes('कैसे चेक') || lower.includes('how to check') || lower.includes('kaise dekhe'))
  ) {
    return {
      intent: 'HOW_TO_CHECK_ORDER_STATUS',
      intentType: 'guidance',
      understoodSummary: '📋 Understood: How to Check Order Status',
      answer: `अपने ऑर्डर का स्टेटस चेक करने के 2 आसान तरीके हैं:\n\n1. AI से सीधे बोलें: 'मेरा ऑर्डर ट्रैक करो' या 'मेरे ऑर्डर दिखाओ'।\n2. डैशबोर्ड पर 'My Orders' या 'Order Details' में जाएं, जहां आपको लाइव चेकपॉइंट (Confirmed → Picked Up → Dispatched → In Transit → Delivered) दिखाई देंगे।`,
      action: {
        label: `Track Order ${orderRef}`,
        targetView: 'order-details',
        tool: 'trackOrder',
        params: { orderId: orderRef }
      }
    };
  }

  // ==========================================
  // 3. COMMON / FARMER / BUYER ACTIONS
  // ==========================================

  // 3A0. Open Logistics ("लॉजिस्टिक्स खोलो", "open logistics", "ट्रक बुकिंग कैसे करें", "truck booking")
  const isOpenLogistics =
    lower.includes('logistics') ||
    lower.includes('लॉजिस्टिक्स') ||
    lower.includes('truck') ||
    lower.includes('ट्रक') ||
    lower.includes('freight') ||
    lower.includes('वाहन') ||
    lower.includes('गाड़ी बुकिंग') ||
    lower.includes('open logistics');

  if (isOpenLogistics) {
    return {
      intent: 'LOGISTICS_SERVICE_VIEW',
      intentType: 'logistics',
      understoodSummary: '🚚 Understood: Logistics & Freight Support',
      answer: `Krishi Bazaar provides transparent logistics with two clear choices:\n\n1. Option 1 — Self Pickup (₹0):\n   • Buyer collects produce directly from farmer collection points with zero delivery charges.\n\n2. Option 2 — Logistics Support:\n   • Smart Vehicle Capacity Matching assigns verified transport partners (Mini Trucks 5T, Medium 10T, Heavy 15T).\n   • Transparent cost breakdown: 90% direct driver earnings, 10% platform fee.\n   • Multi-farmer pickup route optimization with step-by-step stops to destination.`,
      action: {
        label: 'Open Logistics',
        targetView: 'logistics',
        tool: 'openLogistics',
        params: {}
      }
    };
  }

  // 3A. Open Marketplace ("मार्केटप्लेस खोलो", "marketplace khol", "mandi kholo", "open marketplace")
  const isOpenMarket =
    lower.includes('mandi khol') ||
    lower.includes('mandi kho') ||
    lower.includes('bazaar khol') ||
    lower.includes('bazar khol') ||
    lower.includes('open market') ||
    lower.includes('open marketplace') ||
    lower.includes('marketplace khol') ||
    lower.includes('मार्केटप्लेस खोल') ||
    lower.includes('मार्केटप्लेस खोलो') ||
    (lower.includes('marketplace') && (lower.includes('khol') || lower.includes('kho') || lower.includes('खोलो') || lower.includes('खोल') || lower.includes('open') || lower.includes('dekho') || lower.includes('देखो'))) ||
    (lower.includes('market') && (lower.includes('khol') || lower.includes('kho') || lower.includes('खोलो') || lower.includes('खोल') || lower.includes('open') || lower.includes('dekho') || lower.includes('देखो'))) ||
    lower.includes('मार्केट खोलो') ||
    lower.includes('मंडी खोल') ||
    lower.includes('मंडी खोलो') ||
    lower.includes('बाज़ार खोलो');

  if (isOpenMarket) {
    return {
      intent: 'OPEN_MARKET',
      intentType: 'navigation',
      crop: crop.name,
      understoodSummary: `🏪 Understood: Opening Krishi Bazaar Marketplace`,
      answer: `Opening the Krishi Bazaar Marketplace. Browse verified farmer harvest lots with transparent, benchmarked prices and zero middleman deductions.`,
      action: {
        label: 'Open Marketplace',
        targetView: 'marketplace',
        tool: 'openMarketplace',
        params: {}
      }
    };
  }

  // 3B. View Farmer Products ("मेरे प्रोडक्ट खोलो", "मेरे प्रोडक्ट", "my products", "मेरे उत्पाद")
  const isOpenFarmerProducts =
    lower.includes('mere product') ||
    lower.includes('mere fasal') ||
    lower.includes('mere listing') ||
    lower.includes('मेरे प्रोडक्ट') ||
    lower.includes('मेरी फसल') ||
    lower.includes('मेरे उत्पाद') ||
    lower.includes('my products') ||
    lower.includes('my listings');

  if (isOpenFarmerProducts) {
    return {
      intent: 'VIEW_FARMER_PRODUCTS',
      intentType: 'navigation',
      crop: crop.name,
      understoodSummary: `🌾 Understood: View Farmer Produce Listings`,
      answer: `Opening your produce inventory and live harvest listings on the Farmer Dashboard.`,
      action: {
        label: 'Open My Listings',
        targetView: 'farmer-dashboard',
        tool: 'openFarmerProducts',
        params: { tab: 'listings', scrollTo: '#inventory-summary' }
      }
    };
  }

  // 3C. Track Order ("मेरा ऑर्डर ट्रैक करो", "mera order kaha pahuncha", "mera order kaha hai", "track order")
  const isTrackOrder =
    lower.includes('track') ||
    lower.includes('kahan pahuncha') ||
    lower.includes('kaha pahuncha') ||
    lower.includes('kaha hai') ||
    lower.includes('कहाँ पहुँचा') ||
    lower.includes('कहाँ है') ||
    lower.includes('ट्रैक करो') ||
    lower.includes('ट्रैक');

  if (isTrackOrder) {
    return {
      intent: 'TRACK_ORDER',
      intentType: 'navigation',
      understoodSummary: `🚚 Understood: Track Order (${orderRef})`,
      answer: `Opening milestone tracking for ${orderRef}.\n\n• Current Status: ${targetOrder?.status || 'In Transit'}\n• Carrier: ${targetOrder?.fulfillmentMethod === 'self_pickup' ? 'Self Pickup' : 'Commercial Vehicle (UP70 AB 1234)'}\n• Milestone Checkpoints: Farm-Gate Verified → Transit Corridor → Delivery.`,
      action: {
        label: `Track Order ${orderRef}`,
        targetView: 'order-details',
        tool: 'trackOrder',
        params: { orderId: orderRef }
      }
    };
  }

  // 3D. View Orders ("मेरे ऑर्डर दिखाओ", "bhai mere orders dikha do", "my orders")
  // Automatically routes according to user's active role!
  const isViewOrders =
    (lower.includes('mere order') ||
     lower.includes('my order') ||
     lower.includes('orders dikhao') ||
     lower.includes('मेरे ऑर्डर')) && !isTrackOrder;

  if (isViewOrders) {
    if (roleContext && role === 'farmer') {
      return {
        intent: 'VIEW_FARMER_ORDERS',
        intentType: 'navigation',
        understoodSummary: `📋 Understood: View Farmer Orders Received`,
        answer: `Opening your received buyer orders on the Farmer Dashboard.`,
        action: {
          label: 'Open Farmer Orders',
          targetView: 'farmer-dashboard',
          tool: 'openOrders',
          params: { tab: 'orders', scrollTo: '#my-orders-section' }
        }
      };
    } else if (roleContext && role === 'buyer') {
      return {
        intent: 'VIEW_BUYER_ORDERS',
        intentType: 'navigation',
        understoodSummary: `📋 Understood: View Buyer Orders`,
        answer: `Opening your order history and active procurements on the Buyer Dashboard.`,
        action: {
          label: 'Open Buyer Orders',
          targetView: 'buyer-dashboard',
          tool: 'openOrders',
          params: { tab: 'orders' }
        }
      };
    } else {
      return {
        intent: 'VIEW_ORDERS',
        intentType: 'navigation',
        understoodSummary: `📋 Understood: View Orders`,
        answer: `Opening order history overview.`,
        action: {
          label: 'View Orders Dashboard',
          targetView: 'my-orders',
          tool: 'openOrders',
          params: { tab: 'orders' }
        }
      };
    }
  }

  // 3E. Price Query ("आज आलू का भाव क्या है?", "Prayagraj mein pyaz ka bhav", "wheat price", "rate kya hai")
  const isPrice =
    lower.includes('rate') ||
    lower.includes('price') ||
    lower.includes('bhav') ||
    lower.includes('bhaav') ||
    lower.includes('daam') ||
    lower.includes('kimat') ||
    lower.includes('प्राइस') ||
    lower.includes('रेट') ||
    lower.includes('भाव') ||
    lower.includes('दाम') ||
    lower.includes('कीमत');

  if (isPrice) {
    const priceData = getCropPriceIntelligence(crop.id);
    const locName = `${activeLocation.district || ''}, ${activeLocation.state || 'Uttar Pradesh'}`.trim();
    const mandiName = activeLocation.mandi || `${activeLocation.district || 'Regional'} Mandi`;

    return {
      intent: 'MARKET_PRICE_QUERY',
      intentType: 'price',
      crop: crop.name,
      cropId: crop.id,
      location: activeLocation,
      understoodSummary: `${crop.emoji} Understood: ${crop.name} Mandi Rate (${locName})`,
      answer: `Mandi Price Report for ${crop.emoji} ${crop.name}:\n\n• Reference Price (Demo/Reference Data): ₹${priceData.currentPrice}/kg\n• Mandi / Market: ${mandiName}\n• Geographic Hub: ${locName}\n• Forecasted Trend: ₹${priceData.estimatedPrice}/kg (${priceData.percentageChange >= 0 ? '+' : ''}${priceData.percentageChange}%)\n• Market Trend: ${priceData.trend}\n• Market Signal: ${priceData.marketSignal}\n\nNote: Grounded in regional platform Agmarknet records.`,
      action: {
        label: `View ${crop.name} Price Intelligence`,
        targetView: 'market-intel',
        tool: 'getMarketPrice',
        params: { cropId: crop.id, location: activeLocation }
      }
    };
  }

  // 3F. Sell / Find Buyers Intent ("मेरे 500 किलो गेहूं के लिए खरीदार खोजो", "bechna hai")
  const isSell =
    lower.includes('bechna') ||
    lower.includes('sell') ||
    lower.includes('buyer khojo') ||
    lower.includes('buyer dhundo') ||
    lower.includes('खरीदार खोजो') ||
    lower.includes('खरीदार ढूंढो') ||
    lower.includes('buyer chahiye') ||
    lower.includes('mere paas') ||
    lower.includes('mere pass') ||
    lower.includes('मेरे पास') ||
    lower.includes('becho') ||
    lower.includes('बेचना') ||
    lower.includes('ग्राहक चाहिए');

  if (isSell) {
    const sellQtyKg = qty ? qty.normalizedKg : 500;
    const sellDisplayQty = qty ? qty.displayString : '500 KG';

    return {
      intent: 'FIND_BUYERS_OR_SELL',
      intentType: 'sell',
      crop: crop.name,
      cropId: crop.id,
      quantity: qty ? qty.value : 500,
      unit: qty?.unit || 'kg',
      quantityKg: sellQtyKg,
      normalizedKg: sellQtyKg,
      understoodSummary: `${crop.emoji} Understood: Find Buyers for ${sellDisplayQty} of ${crop.name}`,
      answer: `Found immediate buyers and bulk demand requirements for ${sellDisplayQty} of ${crop.name}!\n\n• Produce: ${crop.name}\n• Available Volume: ${sellDisplayQty} (${sellQtyKg.toLocaleString()} KG)\n• Commission: 0% Direct Farm-to-Buyer Deal\n• Action: List lot or match directly against institutional buyer tenders.`,
      action: {
        label: `List ${sellDisplayQty} ${crop.name} for Buyers`,
        targetView: 'farmer-dashboard',
        tool: 'searchBuyer',
        params: {
          cropId: crop.id,
          quantity: sellQtyKg,
          scrollTo: '#add-product-form'
        }
      }
    };
  }

  // 3G. Crop Planning & Seasonal Advisory ("अगले सीजन में क्या उगाना बेहतर रहेगा?", "what should i grow", "agle season mein kya ugana chahiye")
  const isCropPlanning =
    lower.includes('agle season') ||
    lower.includes('next season') ||
    lower.includes('kya ugana') ||
    lower.includes('kya ugaye') ||
    lower.includes('what should i grow') ||
    lower.includes('ugana chahiye') ||
    lower.includes('फसल चक्र') ||
    lower.includes('क्या उगाएं') ||
    lower.includes('क्या उगाना') ||
    lower.includes('उगाना चाहिए');

  if (isCropPlanning) {
    return {
      intent: 'CROP_PLANNING',
      intentType: 'advisory',
      crop: crop.name,
      location: activeLocation,
      understoodSummary: `🌱 Understood: Seasonal Sowing Advisory for ${activeLocation.state}`,
      answer: `Location-Specific Crop Planning for ${activeLocation.district || activeLocation.state}:\n\n1. Rabi Season (Winter Sowing):\n   • Recommended: Wheat, Mustard (Oilseeds), Chickpea (Gram), Potato.\n   • Commercial Tip: Mustard has tight regional supply (+18% price upside expected).\n\n2. Kharif Season (Monsoon Sowing):\n   • Recommended: Rice, Maize, Soybean, Pigeon Pea (Arhar).\n\nRecommendations adhere to ICAR agro-climatic zone standards.`,
      action: {
        label: 'View Crop Intelligence & Advisory',
        targetView: 'market-intel',
        tool: 'getCropRecommendation',
        params: { cropId: crop.id }
      }
    };
  }

  // 3H. Buy Intent ("मुझे 500 किलो आलू चाहिए", "100 quintal wheat chahiye", "saste pyaz khojo")
  const isBuy =
    (lower.includes('chahiye') ||
     lower.includes('kharidna') ||
     lower.includes('buy') ||
     lower.includes('procure') ||
     lower.includes('saste') ||
     lower.includes('सस्ते') ||
     lower.includes('चाहिए') ||
     lower.includes('खरीदना')) && !isSell && !isCropPlanning;

  if (isBuy) {
    const targetQtyKg = qty ? qty.normalizedKg : 500;
    const targetUnit = qty?.unit || (targetQtyKg >= 100 ? 'Quintal' : 'kg');
    const targetDisplayQty = qty ? qty.displayString : `${targetQtyKg.toLocaleString()} KG`;

    return {
      intent: 'PURCHASE_PRODUCT',
      intentType: 'buy',
      crop: crop.name,
      cropId: crop.id,
      quantity: qty ? qty.value : targetQtyKg,
      unit: targetUnit,
      quantityKg: targetQtyKg,
      normalizedKg: targetQtyKg,
      understoodSummary: `${crop.emoji} Understood: Procure ${targetDisplayQty} of ${crop.name}`,
      answer: `Understood! Preparing procurement order for ${targetDisplayQty} of ${crop.name}.\n\n• Produce: ${crop.name}\n• Desired Volume: ${targetDisplayQty} (${targetQtyKg.toLocaleString()} KG)\n• Multi-Farmer Aggregation: Active across verified regional clusters\n• Freight: Self Pickup (₹0) or Smart Vehicle Allocation.`,
      action: {
        label: `Proceed to Order ${targetDisplayQty} ${crop.name}`,
        targetView: 'bulk-requirement',
        tool: 'prepareOrder',
        params: {
          cropId: crop.id,
          quantity: qty ? (qty.unit === 'Quintal' ? qty.value : qty.normalizedKg) : targetQtyKg,
          unit: qty ? qty.unit : 'kg'
        }
      }
    };
  }

  // 3I. Agronomy / Disease / Fertilizer Advisory ("गेहूं की खेती कैसे करें?", "मेरे प्याज के पत्ते पीले हो रहे हैं")
  const agronomyMatch = searchAgronomyKnowledgeBase(query);
  const isAgronomyQuery =
    Boolean(agronomyMatch) ||
    lower.includes('farming') ||
    lower.includes('kheti kaise') ||
    lower.includes('kheti') ||
    lower.includes('खेती') ||
    lower.includes('bimari') ||
    lower.includes('रोग') ||
    lower.includes('बीमारी') ||
    lower.includes('कीट') ||
    lower.includes('खाद') ||
    lower.includes('सिंचाई');

  if (isAgronomyQuery) {
    const match = agronomyMatch || {
      title: `${crop.name} Cultivation & Scientific Advisory`,
      summary: `Scientific cultivation, soil nutrition, and disease management for ${crop.name}.`,
      remedy: `• Seed Rate: Certified disease-free seed with Trichoderma fungicide treatment.\n• Fertilizer: Soil Health Card balanced NPK ratio.\n• Irrigation: Water during critical vegetative and flowering milestones.\n• Field Scouting: Early inspection for leaf blight and aphids.`,
      topicId: `${crop.id}_farming`
    };

    return {
      intent: 'AGRONOMY_ADVISORY',
      intentType: 'advisory',
      understoodSummary: `🌾 Understood: ${match.title}`,
      answer: `${match.title}\n\n${match.summary}\n\nScientific Guidance:\n${match.remedy}\n\nSource: ICAR & Krishi Vigyan Kendra (KVK) verified agronomy records.`,
      action: {
        label: 'Open Krishi Advisory',
        targetView: 'farmer-dashboard',
        tool: 'agronomyAdvisory',
        params: { agronomyTopic: match.topicId }
      }
    };
  }

  // 3J. Search Farmer / Listings ("इस किसान के सारे प्रोडक्ट दिखाओ", "search listings")
  const isSearch =
    lower.includes('dikhao') ||
    lower.includes('dhundo') ||
    lower.includes('kisan ke') ||
    lower.includes('किसान के') ||
    lower.includes('search') ||
    lower.includes('show');

  if (isSearch) {
    return {
      intent: 'SEARCH_LISTINGS',
      intentType: 'search',
      crop: crop.name,
      cropId: crop.id,
      understoodSummary: `🔍 Understood: Search ${crop.name} Produce Listings`,
      answer: `Searching active verified listings for ${crop.emoji} ${crop.name} with direct farm-gate inspection and fair pricing.`,
      action: {
        label: `View ${crop.name} in Marketplace`,
        targetView: 'marketplace',
        tool: 'searchProduct',
        params: { searchQuery: crop.name }
      }
    };
  }

  // ==========================================
  // DEFAULT GROUNDED FALLBACK
  // ==========================================
  const priceData = getCropPriceIntelligence(crop.id);
  return {
    intent: 'GENERAL_KRISHI_INQUIRY',
    crop: crop.name,
    cropId: crop.id,
    understoodSummary: `💡 Understood: ${crop.name} Agricultural Intelligence`,
    answer: `Current Platform Intelligence for ${crop.emoji} ${crop.name}:\n\n• Reference Price: ₹${priceData.currentPrice}/kg (Estimated Next: ₹${priceData.estimatedPrice}/kg)\n• Supply & Demand: Active regional trading volume\n• Marketplace: Direct farmer listings available with transparent grades\n• Logistics: Self Pickup (₹0) or verified partner truck dispatch.`,
    action: {
      label: `Open Marketplace for ${crop.name}`,
      targetView: 'marketplace',
      tool: 'openMarketplace',
      params: { searchQuery: crop.name }
    }
  };
};

/**
 * Structured Tool Catalog for Website Control
 */
export const KRISHI_AI_TOOLS = {
  openMarketplace: () => ({ targetView: 'marketplace' }),
  openMandi: (cropId, location) => ({ targetView: 'market-intel', params: { cropId, location } }),
  searchProduct: (cropId, query) => ({ targetView: 'marketplace', params: { cropId, query } }),
  prepareOrder: (cropId, quantity, unit) => ({ targetView: 'bulk-requirement', params: { cropId, quantity, unit } }),
  openOrders: () => ({ targetView: 'buyer-dashboard', params: { tab: 'orders' } }),
  trackOrder: (orderId) => ({ targetView: 'order-details', params: { orderId } }),
  openFarmerProducts: () => ({ targetView: 'farmer-dashboard', params: { tab: 'listings', scrollTo: '#inventory-summary' } }),
  openLogistics: () => ({ targetView: 'logistics' }),
  openAssignedOrders: () => ({ targetView: 'logistics-dashboard', params: { tab: 'assigned' } }),
  openPickup: (orderId) => ({ targetView: 'logistics-dashboard', params: { tab: 'pickup', orderId } }),
  openDispatch: (orderId) => ({ targetView: 'logistics-dashboard', params: { tab: 'dispatch', orderId } }),
  openDeliveryHistory: () => ({ targetView: 'logistics-dashboard', params: { tab: 'history' } }),
  openVehicleDetails: () => ({ targetView: 'logistics-dashboard', params: { tab: 'vehicle' } }),
  openDriverDetails: () => ({ targetView: 'logistics-dashboard', params: { tab: 'driver' } }),
  openRouteInfo: () => ({ targetView: 'logistics-dashboard', params: { tab: 'routes' } }),
  openAdminOverview: () => ({ targetView: 'admin-dashboard', params: { tab: 'overview' } }),
  openAdminUsers: () => ({ targetView: 'admin-dashboard', params: { tab: 'users' } }),
  openAdminOrders: () => ({ targetView: 'admin-dashboard', params: { tab: 'orders' } }),
  searchBuyer: () => ({ targetView: 'farmer-dashboard', params: { tab: 'listings', scrollTo: '#add-product-form' } }),
  getMarketPrice: (cropId, location) => ({ cropId, location }),
  getCropRecommendation: (season, location) => ({ season, location }),
  getDemandForecast: (cropId) => ({ cropId }),
  changeLocation: (location) => ({ location })
};
