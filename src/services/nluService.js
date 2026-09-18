// Krishi Bazaar Natural Language Understanding (NLU) Engine
// Supports Hindi (Devanagari), Hinglish (Roman Hindi), and English
// Performs intent identification, crop & unit extraction, and platform action routing

import { CROPS } from '../config/crops.js';
import { getCropPriceIntelligence, getCropDemandForecast, getCropSupplyDemandAnalysis } from './forecastEngine.js';
import { store } from './store.js';

// Crop Lexicon for Multilingual Entity Recognition
const CROP_SYNONYMS = {
  wheat: ['wheat', 'gehu', 'gehoon', 'sharbati', 'lokwan', 'गेहूं', 'गेहू', 'गेहूँ'],
  rice: ['rice', 'chawal', 'dhan', 'paddy', 'sona masoori', 'चावल', 'धान'],
  mustard: ['mustard', 'sarson', 'sarso', 'rai', 'toria', 'सरसों', 'राई'],
  maize: ['maize', 'makka', 'corn', 'bhutta', 'मक्का', 'भुट्टा'],
  soybean: ['soybean', 'soya', 'soyabean', 'सोयाबीन', 'सोया'],
  groundnut: ['groundnut', 'peanut', 'mungfali', 'moongphali', 'मूंगफली'],
  chickpea: ['chickpea', 'chana', 'gram', 'desi chana', 'kabuli chana', 'चना'],
  lentil: ['lentil', 'masoor', 'masur', 'मसूर'],
  pigeon_pea: ['pigeon pea', 'arhar', 'tur', 'toor', 'अरहर', 'तूर'],
  potato: ['potato', 'aloo', 'alu', 'आलू'],
  tomato: ['tomato', 'tamatar', 'टमाटर'],
  onion: ['onion', 'pyaz', 'pyaaz', 'कांदा', 'प्याज'],
  sugarcane_jaggery: ['jaggery', 'gud', 'gur', 'sugarcane', 'गुड़', 'गन्ना']
};

/**
 * Extracts crop from natural text
 */
export const extractCrop = (text) => {
  const clean = text.toLowerCase();
  for (const [cropId, synonyms] of Object.entries(CROP_SYNONYMS)) {
    for (const syn of synonyms) {
      if (clean.includes(syn)) {
        const meta = CROPS.find(c => c.id === cropId);
        return {
          id: cropId,
          name: meta?.name || cropId,
          emoji: meta?.emoji || '🌾',
          category: meta?.category || 'Grains'
        };
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
  // e.g., "100 quintal", "100 क्विंटल", "5000 kilo", "5000 kg", "10 ton", "2000"
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
 * Understands natural user queries and returns grounded platform intelligence and action
 */
export const processNaturalQuery = (rawQuery, defaultCropId = 'wheat') => {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();

  if (!query) {
    return {
      intent: 'empty',
      text: 'Please ask a question or tap the microphone to speak.'
    };
  }

  const crop = extractCrop(query) || {
    id: defaultCropId,
    name: defaultCropId.charAt(0).toUpperCase() + defaultCropId.slice(1),
    emoji: '🌾'
  };

  const qty = extractQuantity(query);

  // 1. PRICE INTENT
  // "gehu ka rate kya hai?", "mere area me wheat ka price batao", "गेहूं का प्राइस बताओ", "wheat price"
  const isPrice =
    lower.includes('rate') ||
    lower.includes('price') ||
    lower.includes('bhav') ||
    lower.includes('daam') ||
    lower.includes('kimat') ||
    lower.includes('प्राइस') ||
    lower.includes('रेट') ||
    lower.includes('भाव') ||
    lower.includes('दाम') ||
    lower.includes('कीमत');

  // 2. SELL INTENT
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

  // 3. BUY INTENT
  // "mujhe 100 quintal wheat chahiye", "kharidna hai", "खरीदना", "चाहिए" (without bechna)
  const isBuy =
    (lower.includes('chahiye') ||
      lower.includes('kharidna') ||
      lower.includes('buy') ||
      lower.includes('procure') ||
      lower.includes('lena hai') ||
      lower.includes('चाहिए') ||
      lower.includes('खरीदना')) &&
    !isSell;

  // 4. DEMAND / ADVISOR INTENT
  // "kaunsi fasal ki demand zyada hai?", "which crop has high demand?", "what should I grow?"
  const isDemand =
    lower.includes('demand') ||
    lower.includes('mang') ||
    lower.includes('zyada demand') ||
    lower.includes('kya ugaye') ||
    lower.includes('what should i grow') ||
    lower.includes('next season') ||
    lower.includes('advisor') ||
    lower.includes('मांग') ||
    lower.includes('डिमांड') ||
    lower.includes('फसल');

  // 5. NEARBY / LISTINGS SEARCH INTENT
  // "mere pass wale kisanon ka gehu dikhao", "show wheat listings", "available listings"
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

  // 6. LOGISTICS INTENT
  // "logistics kaise kaam karta hai?", "delivery charge", "truck", "pickup", "ट्रक बुकिंग"
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
    lower.includes('पिकअप');

  // DISPATCH RESPONSES:

  // A. BUY QUERY
  if (isBuy) {
    const targetQtyKg = qty ? qty.normalizedKg : 10000;
    const targetUnit = qty?.unit || (targetQtyKg >= 100 ? 'Quintal' : 'kg');
    const targetDisplayQty = qty ? qty.displayString : `${targetQtyKg.toLocaleString()} KG`;

    return {
      intent: 'Buy Produce',
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

  // B. SELL QUERY
  if (isSell) {
    const sellQtyKg = qty ? qty.normalizedKg : 5000;
    const sellDisplayQty = qty ? qty.displayString : '5,000 KG';

    return {
      intent: 'Sell Produce',
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

  // C. PRICE QUERY
  if (isPrice) {
    const priceData = getCropPriceIntelligence(crop.id);
    return {
      intent: 'Price Search',
      intentType: 'price',
      crop: crop.name,
      cropId: crop.id,
      understoodSummary: `${crop.emoji} Understood: ${crop.name} Market Price Information`,
      answer: `Here is the structured price information for ${crop.emoji} ${crop.name}:

• Reference Price (Demo/Reference Data): ₹${priceData.currentPrice}/kg
• Estimated Price (Next Cycle Trend): ₹${priceData.estimatedPrice}/kg (${priceData.percentageChange >= 0 ? '+' : ''}${priceData.percentageChange}%)
• Trend Direction: Price is ${priceData.trend}
• Market Insight: ${priceData.marketSignal}

Note: Price data is based on available regional platform reference records. Not live external web data.`,
      action: {
        label: `View Full ${crop.name} Price Intelligence`,
        targetView: 'market-intel',
        params: { cropId: crop.id }
      }
    };
  }

  // D. DEMAND / CROP ADVISOR QUERY
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

  // E. SEARCH LISTINGS QUERY
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
      answer: `Found ${activeWheat.length} active farmer/FPO listings for ${crop.emoji} ${crop.name} with total available volume of ${totalAvailKg.toLocaleString()} KG across regional clusters (Prayagraj, Kanpur, Unnao, Varanasi).

All listings are verified with moisture testing and quality grade certifications.`,
      action: {
        label: `View ${crop.name} Listings in Marketplace`,
        targetView: 'marketplace',
        params: { searchQuery: crop.name }
      }
    };
  }

  // F. LOGISTICS QUERY
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
