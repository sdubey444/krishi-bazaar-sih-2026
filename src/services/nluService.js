// Krishi Bazaar Natural Language Understanding (NLU) Engine
// Supports Hindi (Devanagari), Hinglish (Roman Hindi), and English
// Performs intent identification, crop & unit extraction, India-wide location detection, and platform action routing

import { CROPS } from '../config/crops.js';
import { getCropPriceIntelligence, getCropDemandForecast, getCropSupplyDemandAnalysis } from './forecastEngine.js';
import { locationService } from './locationService.js';
import { marketDataService } from './marketDataService.js';
import { searchAgronomyKnowledgeBase } from '../data/agronomyKnowledgeBase.js';
import { store } from './store.js';

// Expanded Crop Lexicon for Multilingual Entity Recognition
const CROP_SYNONYMS = {
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
  const clean = text.toLowerCase();

  // Look for numbers followed by unit words
  // e.g., "100 quintal", "100 क्विंटल", "5000 kilo", "5000 kg", "50 kilo", "10 ton", "2000"
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
 * Understands natural user queries and returns grounded platform intelligence and website actions
 */
export const processNaturalQuery = (rawQuery, defaultCropId = 'wheat', locationContext = null) => {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();

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

  // 1. OPEN MARKET INTENT
  // "mandi khol ke do", "mandi kholo", "open marketplace", "market dekho", "मंडी खोल के दो", "मंडी खोलो", "मार्केटप्लेस खोलो"
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
    lower.includes('मार्केट खोलो') ||
    lower.includes('मंडी खोल') ||
    lower.includes('मंडी खोलो') ||
    lower.includes('बाज़ार खोलो');

  // 1B. VIEW FARMER PRODUCTS / MY LISTINGS INTENT
  // "mere product dikhao", "mere product", "मेरे प्रोडक्ट दिखाओ", "मेरे प्रोडक्ट", "मेरी फसल"
  const isOpenFarmerProducts =
    lower.includes('mere product') ||
    lower.includes('mere fasal') ||
    lower.includes('mere listing') ||
    lower.includes('मेरे प्रोडक्ट') ||
    lower.includes('मेरी फसल') ||
    lower.includes('मेरे उत्पाद') ||
    lower.includes('my products') ||
    lower.includes('my listings');

  // 2. TRACK ORDER INTENT
  // "mera order track karo", "order status", "track my order", "ट्रैक करो", "ऑर्डर ट्रैक"
  const isTrackOrder =
    lower.includes('track') ||
    lower.includes('order status') ||
    lower.includes('kahan pahuncha') ||
    lower.includes('कहाँ पहुँचा') ||
    lower.includes('ट्रैक करो') ||
    lower.includes('ट्रैक');

  // 3. VIEW ORDERS INTENT
  // "mere orders dikhao", "my orders", "pichle order", "मेरे ऑर्डर दिखाओ"
  const isViewOrders =
    (lower.includes('mere order') ||
     lower.includes('my order') ||
     lower.includes('orders dikhao') ||
     lower.includes('मेरे ऑर्डर')) && !isTrackOrder;

  // 4. PRICE INTENT
  // "gehu ka rate kya hai?", "Prayagraj mein aaj pyaz ka kya bhaav hai?", "mere area me wheat ka price batao", "गेहूं का प्राइस बताओ"
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

  // 5. SELL INTENT
  // "mere paas 5000 kg wheat hai, mujhe buyer chahiye", "bechna hai", "बेचना", "मेरे पास 5000 किलो गेहूं है"
  const isSell =
    lower.includes('bechna') ||
    lower.includes('sell') ||
    lower.includes('buyer chahiye') ||
    lower.includes('list produce') ||
    lower.includes('mere paas') ||
    lower.includes('mere pass') ||
    lower.includes('मेरे पास') ||
    lower.includes('i have') ||
    lower.includes('uplabdh') ||
    lower.includes('उपलब्ध') ||
    lower.includes('बेचना') ||
    lower.includes('विक्रय') ||
    lower.includes('ग्राहक चाहिए');

  // 6. CROP PLANNING / ADVISOR INTENT
  // "agle season mein kya ugana chahiye?", "kaunsi fasal ki demand zyada hai?", "which crop has high demand?", "what should I grow?"
  const isCropPlanning =
    lower.includes('agle season') ||
    lower.includes('next season') ||
    lower.includes('kya ugaye') ||
    lower.includes('what should i grow') ||
    lower.includes('kya ugana') ||
    lower.includes('ugana chahiye') ||
    lower.includes('ugaye') ||
    lower.includes('फसल चक्र') ||
    lower.includes('क्या उगाएं') ||
    lower.includes('क्या उगाना चाहिए');

  // 7. BUY INTENT
  // "mujhe 50 kilo aloo chahiye", "mujhe 100 quintal wheat chahiye", "kharidna hai", "खरीदना", "चाहिए"
  const isBuy =
    (lower.includes('chahiye') ||
      lower.includes('kharidna') ||
      lower.includes('buy') ||
      lower.includes('procure') ||
      lower.includes('lena hai') ||
      lower.includes('चाहिए') ||
      lower.includes('खरीदना')) &&
    !isSell &&
    !isCropPlanning;

  const isDemand =
    lower.includes('demand') ||
    lower.includes('mang') ||
    lower.includes('zyada demand') ||
    lower.includes('advisor') ||
    lower.includes('मांग') ||
    lower.includes('डिमांड');

  // 8. AGRONOMY & CROP HEALTH INTENT (Yellow leaves, disease, pest, fertilizer, irrigation)
  const agronomyMatch = searchAgronomyKnowledgeBase(query);
  const isAgronomyQuery =
    Boolean(agronomyMatch) ||
    lower.includes('farming') ||
    lower.includes('cultivation') ||
    lower.includes('kheti kaise') ||
    lower.includes('kheti') ||
    lower.includes('खेती कैसे') ||
    lower.includes('खेती') ||
    lower.includes('bimari') ||
    lower.includes('रोग') ||
    lower.includes('बीमारी') ||
    lower.includes('कीट');

  // 9. SEARCH LISTINGS INTENT
  const isSearch =
    lower.includes('dikhao') ||
    lower.includes('dhundo') ||
    lower.includes('listings') ||
    lower.includes('available') ||
    lower.includes('search') ||
    lower.includes('show') ||
    lower.includes('pass wale') ||
    lower.includes('दिखाओ') ||
    lower.includes('किसान');

  // 10. LOGISTICS INTENT
  const isLogistics =
    lower.includes('logistics') ||
    lower.includes('delivery') ||
    lower.includes('pickup') ||
    lower.includes('route') ||
    lower.includes('truck') ||
    lower.includes('gadi') ||
    lower.includes('गाड़ी') ||
    lower.includes('गाड़ी') ||
    lower.includes('ट्रक') ||
    lower.includes('बुकिंग') ||
    lower.includes('ट्रांसपोर्ट') ||
    lower.includes('भाड़ा') ||
    lower.includes('भाडा') ||
    lower.includes('डिलीवरी') ||
    lower.includes('पिकअप') ||
    lower.includes('लॉजिस्टिक्स') ||
    lower.includes('लॉजिस्टिक्स खोलो');

  // 11. HIGH-RISK IRREVERSIBLE ACTIONS (Requires explicit user confirmation)
  const isHighRisk =
    lower.includes('delete account') ||
    lower.includes('delete listing') ||
    lower.includes('cancel order') ||
    lower.includes('pay now') ||
    lower.includes('make payment') ||
    lower.includes('रद्द करो');

  // DISPATCH RESPONSES:

  // HIGH RISK SAFETY CHECK
  if (isHighRisk) {
    return {
      intent: 'HIGH_RISK_ACTION_CONFIRMATION',
      intentType: 'high_risk',
      understoodSummary: '⚠️ Explicit User Confirmation Required',
      answer: `High-risk action requested: "${query}".\n\nAI will not automatically execute irreversible financial or deletion actions. Please confirm your decision explicitly below.`,
      requiresConfirmation: true,
      action: {
        label: 'Confirm High-Risk Action',
        isHighRisk: true,
        targetView: 'confirm_modal',
        params: { actionQuery: query }
      }
    };
  }

  // A. OPEN MARKET INTENT
  if (isOpenMarket) {
    return {
      intent: 'OPEN_MARKET',
      intentType: 'navigation',
      crop: crop.name,
      understoodSummary: `🏪 Understood: Opening Krishi Bazaar Marketplace`,
      answer: `Opening the Krishi Bazaar Marketplace. Here you can explore verified farmer produce lots with direct transparent pricing and no middleman cuts.`,
      action: {
        label: 'Open Marketplace',
        targetView: 'marketplace',
        tool: 'openMarketplace',
        params: {}
      }
    };
  }

  // A2. VIEW FARMER PRODUCTS INTENT
  if (isOpenFarmerProducts) {
    return {
      intent: 'VIEW_FARMER_PRODUCTS',
      intentType: 'navigation',
      crop: crop.name,
      understoodSummary: `🌾 Understood: View Farmer Produce Listings`,
      answer: `Opening your produce listings and harvest inventory on the Farmer Dashboard.`,
      action: {
        label: 'Open My Listings',
        targetView: 'farmer-dashboard',
        tool: 'openFarmerProducts',
        params: { tab: 'listings' }
      }
    };
  }

  // B. TRACK ORDER INTENT
  if (isTrackOrder) {
    const state = store.getState();
    const latestOrder = state.orders?.[0];
    const orderRef = latestOrder?.id || 'ORD-2026-8812';

    return {
      intent: 'TRACK_ORDER',
      intentType: 'navigation',
      understoodSummary: `🚚 Understood: Track Order (${orderRef})`,
      answer: `Opening order tracking for ${orderRef}. Current Status: ${latestOrder?.status || 'Confirmed'}. Verified milestone-based checkpoints are displayed.`,
      action: {
        label: `Track Order ${orderRef}`,
        targetView: 'order-details',
        params: { orderId: orderRef }
      }
    };
  }

  // C. VIEW ORDERS INTENT
  if (isViewOrders) {
    return {
      intent: 'VIEW_ORDERS',
      intentType: 'navigation',
      understoodSummary: `📋 Understood: View My Orders`,
      answer: `Opening your order history and status overview.`,
      action: {
        label: 'View Orders Dashboard',
        targetView: 'my-orders',
        params: {}
      }
    };
  }

  // D. BUY INTENT ("mujhe 50 kilo aloo chahiye", "100 quintal wheat")
  if (isBuy) {
    const targetQtyKg = qty ? qty.normalizedKg : 10000;
    const targetUnit = qty?.unit || (targetQtyKg >= 100 ? 'Quintal' : 'kg');
    const targetDisplayQty = qty ? qty.displayString : `${targetQtyKg.toLocaleString()} KG`;

    return {
      intent: 'PURCHASE_PRODUCT',
      intentType: 'buy',
      crop: crop.name,
      cropId: crop.id,
      quantity: qty ? qty.value : (targetQtyKg / 100),
      unit: targetUnit,
      quantityKg: targetQtyKg,
      normalizedKg: targetQtyKg,
      understoodSummary: `${crop.emoji} Understood: Buy ${targetDisplayQty} of ${crop.name} (Normalized: ${targetQtyKg.toLocaleString()} KG)`,
      answer: `Understood! You want to purchase ${targetDisplayQty} of ${crop.name}.

In Krishi Bazaar, you can purchase any quantity directly through our unified Buy Produce flow. We dynamically search all suitable verified farmer listings and aggregate supply across smallholders when needed.

• Produce: ${crop.name}
• Requested Quantity: ${targetDisplayQty} (${targetQtyKg.toLocaleString()} KG)
• Delivery Choice: Self Pickup (₹0) OR Logistics Support with Smart Vehicle Matching.`,
      action: {
        label: `Proceed to Buy ${targetDisplayQty} ${crop.name}`,
        targetView: 'bulk-requirement',
        params: {
          cropId: crop.id,
          quantity: qty ? (qty.unit === 'Quintal' ? qty.value : qty.normalizedKg) : 10000,
          unit: qty ? qty.unit : 'kg'
        }
      }
    };
  }

  // E. SELL INTENT ("mere paas 5000 kilo wheat hai, mujhe buyer chahiye")
  if (isSell) {
    const sellQtyKg = qty ? qty.normalizedKg : 5000;
    const sellDisplayQty = qty ? qty.displayString : '5,000 KG';

    return {
      intent: 'SELL_PRODUCE',
      intentType: 'sell',
      crop: crop.name,
      cropId: crop.id,
      quantity: qty ? qty.value : 5000,
      unit: qty?.unit || 'kg',
      quantityKg: sellQtyKg,
      normalizedKg: sellQtyKg,
      understoodSummary: `${crop.emoji} Understood: Sell ${sellDisplayQty} of ${crop.name}`,
      answer: `Great! You have ${sellDisplayQty} of ${crop.name} to sell.

You can list your produce directly for buyers on Krishi Bazaar with zero middleman commissions. Verified buyers and bulk aggregators can place orders for your lots immediately.

• Crop: ${crop.name}
• Available Quantity: ${sellDisplayQty}
• Instant listing with quality grading and location`,
      action: {
        label: `List ${sellDisplayQty} ${crop.name} on Farmer Dashboard`,
        targetView: 'farmer-dashboard',
        params: {
          cropId: crop.id,
          quantity: sellQtyKg
        }
      }
    };
  }

  // F. PRICE QUERY (Grounds in Location + Agmarknet Dataset + Forecast Engine)
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
      understoodSummary: `${crop.emoji} Understood: ${crop.name} Market Price Information (${locName})`,
      answer: `Here is the structured price information for ${crop.emoji} ${crop.name}:

• Reference Price (Demo/Reference Data): ₹${priceData.currentPrice}/kg
• Mandi / Market: ${mandiName}
• Location: ${locName}
• Estimated Price (Next Cycle Trend): ₹${priceData.estimatedPrice}/kg (${priceData.percentageChange >= 0 ? '+' : ''}${priceData.percentageChange}%)
• Trend Direction: Price is ${priceData.trend}
• Market Insight: ${priceData.marketSignal}

Note: Price data is based on available regional platform reference records. Not live external web data.`,
      action: {
        label: `View Full ${crop.name} Price Intelligence`,
        targetView: 'market-intel',
        params: { cropId: crop.id, location: activeLocation }
      }
    };
  }

  // G. CROP PLANNING / ADVISORY INTENT ("agle season mein kya ugana chahiye?")
  if (isCropPlanning) {
    return {
      intent: 'CROP_PLANNING',
      intentType: 'advisory',
      crop: crop.name,
      location: activeLocation,
      understoodSummary: `🌱 Understood: Seasonal Crop Planning for ${activeLocation.state}`,
      answer: `Location-aware seasonal crop planning for ${activeLocation.district || activeLocation.state}:

1. Rabi Season (Winter Sowing):
   • Recommended: Wheat, Mustard, Chickpea (Gram), Potato.
   • Sowing window: October to November.
   • Scientific Advisory: Intercropping mustard with wheat improves disease resilience and balances income.

2. Kharif Season (Monsoon Sowing):
   • Recommended: Rice, Maize, Soybean, Groundnut, Pigeon Pea.
   • Sowing window: June to July with monsoon arrival.

Note: Agricultural recommendations are based on agro-climatic zone data. Profits cannot be guaranteed.`,
      action: {
        label: `View Detailed Crop Advisor`,
        targetView: 'market-intel',
        params: { cropId: crop.id }
      }
    };
  }

  // H. AGRONOMY & CROP HEALTH INTENT (Yellow leaves, disease, fertilizer, irrigation, cultivation)
  if (isAgronomyQuery) {
    const match = agronomyMatch || {
      title: `${crop.name} Cultivation & Agronomy Advisory`,
      summary: `Scientific cultivation, sowing, and disease management guidance for ${crop.name}.`,
      remedy: `• Seed Rate: Follow ICAR-approved seed rates and fungicide seed treatment.\n• Fertilizer: Apply balanced NPK based on Soil Health Card recommendations.\n• Irrigation: Water during critical vegetative and flowering stages.\n• Pest/Disease: Regular field scouting to detect early infection symptoms.`,
      topicId: `${crop.id}_farming`
    };
    return {
      intent: 'AGRONOMY_ADVISORY',
      intentType: 'advisory',
      understoodSummary: `🌾 Understood: ${match.title}`,
      answer: `${match.title}

${match.summary}

Scientific Recommendations:
${match.remedy}

Source: ICAR & Krishi Vigyan Kendra (KVK) verified agricultural guidelines.`,
      action: {
        label: 'Open Krishi Sahayak Assistant',
        targetView: 'farmer-dashboard',
        params: { agronomyTopic: match.topicId }
      }
    };
  }

  // I. DEMAND INTENT
  if (isDemand) {
    const mustardAnalysis = getCropSupplyDemandAnalysis('mustard');
    const wheatAnalysis = getCropSupplyDemandAnalysis('wheat');
    return {
      intent: 'Demand Forecast & Recommendation',
      intentType: 'demand',
      crop: crop.name,
      cropId: crop.id,
      understoodSummary: `📈 Understood: Crop Demand & Sowing Recommendation`,
      answer: `Market demand analysis across regional agricultural clusters:

1. 🌼 Mustard (Oilseeds):
   • Expected Demand: High | Supply: Tight | Recommendation: ${mustardAnalysis.recommendation}
   • Strong crushing mill procurement interest.

2. 🌾 Wheat (Grains):
   • Expected Demand: High | Supply: Very High | Recommendation: ${wheatAnalysis.recommendation}
   • High buffer saturation and active local farmer competition.

3. 🧆 Chickpea (Pulses):
   • Steady market potential for dal processing procurement.`,
      action: {
        label: `Explore Detailed Demand Forecasts`,
        targetView: 'market-intel',
        params: { cropId: 'mustard' }
      }
    };
  }

  // J. SEARCH LISTINGS QUERY
  if (isSearch) {
    const state = store.getState();
    const activeWheat = (state.listings || []).filter(
      l => (l.cropId || l.produce || '').toLowerCase() === crop.id && l.status === 'Active'
    );
    const totalAvailKg = activeWheat.reduce((sum, l) => sum + (l.availableQuantity || l.quantity || 0), 0);

    return {
      intent: 'Search Produce Listings',
      intentType: 'search',
      crop: crop.name,
      cropId: crop.id,
      understoodSummary: `🔍 Understood: Show available ${crop.name} listings`,
      answer: `Found ${activeWheat.length} active farmer/FPO listings for ${crop.emoji} ${crop.name} with total available volume of ${totalAvailKg.toLocaleString()} KG across regional clusters.

All listings are verified with moisture testing and quality grade certifications.`,
      action: {
        label: `View ${crop.name} Listings in Marketplace`,
        targetView: 'marketplace',
        params: { searchQuery: crop.name }
      }
    };
  }

  // K. LOGISTICS QUERY
  if (isLogistics) {
    return {
      intent: 'Logistics & Delivery Support',
      intentType: 'logistics',
      understoodSummary: `🚚 Understood: Logistics & Delivery Process`,
      answer: `Krishi Bazaar provides transparent logistics with two clear choices:

1. Option 1 — Self Pickup (₹0):
   • Buyer collects produce directly from farmer collection points with zero delivery charges.

2. Option 2 — Logistics Support:
   • Smart Vehicle Capacity Matching assigns verified transport partners (Mini Trucks 5T, Medium 10T, Heavy 15T).
   • Transparent cost breakdown: 90% direct driver earnings, 10% platform fee.
   • Multi-farmer pickup route optimization with step-by-step stops to destination.`,
      action: {
        label: `Inspect Delivery & Pickup Routes`,
        targetView: 'logistics',
        params: {}
      }
    };
  }

  // DEFAULT FALLBACK QUERY
  const priceData = getCropPriceIntelligence(crop.id);
  return {
    intent: 'General Inquiry',
    crop: crop.name,
    cropId: crop.id,
    understoodSummary: `💡 Understood: ${crop.name} Agricultural Intelligence`,
    answer: `Here is the current platform intelligence for ${crop.emoji} ${crop.name}:
• Reference Market Price: ₹${priceData.currentPrice}/kg (Estimated Next: ₹${priceData.estimatedPrice}/kg)
• Marketplace: Available for direct purchase or bulk supply aggregation
• Logistics: Self Pickup (₹0) or verified partner freight delivery.`,
    action: {
      label: `Go to Marketplace for ${crop.name}`,
      targetView: 'marketplace',
      params: { searchQuery: crop.name }
    }
  };
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
 * Structured Tool Catalog for Website Control
 */
export const KRISHI_AI_TOOLS = {
  openMarketplace: () => ({ targetView: 'marketplace' }),
  openMandi: (cropId, location) => ({ targetView: 'market-intel', params: { cropId, location } }),
  searchProduct: (cropId, query) => ({ targetView: 'marketplace', params: { cropId, query } }),
  prepareOrder: (cropId, quantity, unit) => ({ targetView: 'bulk-requirement', params: { cropId, quantity, unit } }),
  openOrders: () => ({ targetView: 'my-orders' }),
  trackOrder: (orderId) => ({ targetView: 'order-details', params: { orderId } }),
  openFarmerProducts: () => ({ targetView: 'farmer-dashboard', params: { tab: 'listings' } }),
  openLogistics: () => ({ targetView: 'logistics' }),
  getMarketPrice: (cropId, location) => ({ cropId, location }),
  getCropRecommendation: (season, location) => ({ season, location }),
  getDemandForecast: (cropId) => ({ cropId }),
  changeLocation: (location) => ({ location })
};
