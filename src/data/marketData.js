// Historical market and demand datasets for multiple crops
// Grounded time-series data for explainable statistical forecasting and price intelligence

export const CROP_MARKET_SERIES = {
  wheat: {
    cropName: 'Wheat',
    category: 'Grains',
    currentPrice: 28,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 24.5, demandKg: 14000 },
      { month: 'May', price: 25.2, demandKg: 15500 },
      { month: 'Jun', price: 26.0, demandKg: 16200 },
      { month: 'Jul', price: 26.8, demandKg: 17100 },
      { month: 'Aug', price: 27.5, demandKg: 18500 },
      { month: 'Sep (Current)', price: 28.0, demandKg: 20000 }
    ],
    seasonalityFactor: 1.12, // High winter/rabi milling demand
    marketSignal: 'Bullish - Flour mills & state procurement tenders expanding buffer inventory.',
    supplyStatus: 'Moderate',
    aiInsight: 'Flour mills are accelerating buffer acquisitions before the next sowing season begins. Consistent upward momentum is observed.'
  },
  rice: {
    cropName: 'Rice',
    category: 'Grains',
    currentPrice: 42,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 38.0, demandKg: 13500 },
      { month: 'May', price: 39.0, demandKg: 14200 },
      { month: 'Jun', price: 40.2, demandKg: 15800 },
      { month: 'Jul', price: 41.0, demandKg: 16900 },
      { month: 'Aug', price: 41.5, demandKg: 18000 },
      { month: 'Sep (Current)', price: 42.0, demandKg: 22500 }
    ],
    seasonalityFactor: 1.18, // Festive consumption uptick
    marketSignal: 'Strong Demand - Higher domestic consumption and institutional procurement.',
    supplyStatus: 'Ample',
    aiInsight: 'Upcoming festival season is driving bulk retail orders for premium aromatic varieties.'
  },
  maize: {
    cropName: 'Maize',
    category: 'Grains',
    currentPrice: 22,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 19.5, demandKg: 9500 },
      { month: 'May', price: 20.0, demandKg: 10200 },
      { month: 'Jun', price: 20.8, demandKg: 10800 },
      { month: 'Jul', price: 21.2, demandKg: 11500 },
      { month: 'Aug', price: 21.8, demandKg: 12200 },
      { month: 'Sep (Current)', price: 22.0, demandKg: 13000 }
    ],
    seasonalityFactor: 1.08,
    marketSignal: 'Steady - Growing demand from starch and poultry feed manufacturers.',
    supplyStatus: 'Balanced',
    aiInsight: 'Industrial feed consumption has grown 8% quarter-over-quarter.'
  },
  mustard: {
    cropName: 'Mustard',
    category: 'Oilseeds',
    currentPrice: 58,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 51.0, demandKg: 6200 },
      { month: 'May', price: 52.5, demandKg: 6800 },
      { month: 'Jun', price: 54.0, demandKg: 7300 },
      { month: 'Jul', price: 55.5, demandKg: 8000 },
      { month: 'Aug', price: 56.8, demandKg: 8800 },
      { month: 'Sep (Current)', price: 58.0, demandKg: 9800 }
    ],
    seasonalityFactor: 1.15,
    marketSignal: 'High Demand - Crushing millers actively building stockpiles.',
    supplyStatus: 'Tight',
    aiInsight: 'Crushing mills report tight spot availability before upcoming rabi sowing.'
  },
  soybean: {
    cropName: 'Soybean',
    category: 'Oilseeds',
    currentPrice: 46,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 42.0, demandKg: 8000 },
      { month: 'May', price: 43.0, demandKg: 8400 },
      { month: 'Jun', price: 44.0, demandKg: 9000 },
      { month: 'Jul', price: 44.8, demandKg: 9400 },
      { month: 'Aug', price: 45.5, demandKg: 10100 },
      { month: 'Sep (Current)', price: 46.0, demandKg: 11000 }
    ],
    seasonalityFactor: 1.07,
    marketSignal: 'Moderate Uptrend - Export parity and feed demand lifting prices.',
    supplyStatus: 'Moderate',
    aiInsight: 'Stable demand from both oil refineries and soy meal export units.'
  },
  groundnut: {
    cropName: 'Groundnut',
    category: 'Oilseeds',
    currentPrice: 65,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 59.0, demandKg: 4500 },
      { month: 'May', price: 60.5, demandKg: 4900 },
      { month: 'Jun', price: 62.0, demandKg: 5200 },
      { month: 'Jul', price: 63.0, demandKg: 5600 },
      { month: 'Aug', price: 64.0, demandKg: 6100 },
      { month: 'Sep (Current)', price: 65.0, demandKg: 6700 }
    ],
    seasonalityFactor: 1.10,
    marketSignal: 'Steady - Confectionery and domestic oil demand sustained.',
    supplyStatus: 'Balanced',
    aiInsight: 'Peanut butter processing clusters driving premium for Grade A bold pods.'
  },
  chickpea: {
    cropName: 'Chickpea',
    category: 'Pulses',
    currentPrice: 62,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 55.0, demandKg: 7200 },
      { month: 'May', price: 56.5, demandKg: 7800 },
      { month: 'Jun', price: 58.0, demandKg: 8400 },
      { month: 'Jul', price: 59.5, demandKg: 9100 },
      { month: 'Aug', price: 61.0, demandKg: 9900 },
      { month: 'Sep (Current)', price: 62.0, demandKg: 11200 }
    ],
    seasonalityFactor: 1.14,
    marketSignal: 'Bullish - High festive demand and chana dal processing orders.',
    supplyStatus: 'Tight',
    aiInsight: 'Government buffer releases have stabilized spot spikes while underlying demand remains brisk.'
  },
  lentil: {
    cropName: 'Lentil',
    category: 'Pulses',
    currentPrice: 70,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 64.0, demandKg: 5000 },
      { month: 'May', price: 65.5, demandKg: 5300 },
      { month: 'Jun', price: 66.8, demandKg: 5800 },
      { month: 'Jul', price: 68.0, demandKg: 6200 },
      { month: 'Aug', price: 69.2, demandKg: 6700 },
      { month: 'Sep (Current)', price: 70.0, demandKg: 7400 }
    ],
    seasonalityFactor: 1.09,
    marketSignal: 'Firm - Millers seeking well-graded unpolished red masoor.',
    supplyStatus: 'Moderate',
    aiInsight: 'Pulse processing units operating near peak seasonal capacity.'
  },
  potato: {
    cropName: 'Potato',
    category: 'Vegetables',
    currentPrice: 18,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 14.0, demandKg: 22000 },
      { month: 'May', price: 15.0, demandKg: 24000 },
      { month: 'Jun', price: 16.0, demandKg: 26000 },
      { month: 'Jul', price: 16.8, demandKg: 27500 },
      { month: 'Aug', price: 17.5, demandKg: 29000 },
      { month: 'Sep (Current)', price: 18.0, demandKg: 31500 }
    ],
    seasonalityFactor: 1.06,
    marketSignal: 'Cold Storage Release - Steady consumer and snack processing uptake.',
    supplyStatus: 'Ample',
    aiInsight: 'Chipsona and table potato varieties moving steadily from Agra and Farrukhabad cold hubs.'
  },
  tomato: {
    cropName: 'Tomato',
    category: 'Vegetables',
    currentPrice: 24,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 18.0, demandKg: 11000 },
      { month: 'May', price: 20.0, demandKg: 12500 },
      { month: 'Jun', price: 28.0, demandKg: 13000 },
      { month: 'Jul', price: 32.0, demandKg: 12000 },
      { month: 'Aug', price: 26.0, demandKg: 13800 },
      { month: 'Sep (Current)', price: 24.0, demandKg: 15200 }
    ],
    seasonalityFactor: 1.02,
    marketSignal: 'Normalizing - New arrivals cooling previous monsoon price spikes.',
    supplyStatus: 'Ample',
    aiInsight: 'Fresh crop arrivals from southern and central belts have restored normal market flows.'
  },
  onion: {
    cropName: 'Onion',
    category: 'Vegetables',
    currentPrice: 26,
    unit: 'kg',
    priceHistory: [
      { month: 'Apr', price: 20.0, demandKg: 16000 },
      { month: 'May', price: 21.5, demandKg: 17200 },
      { month: 'Jun', price: 23.0, demandKg: 18500 },
      { month: 'Jul', price: 24.5, demandKg: 19800 },
      { month: 'Aug', price: 25.2, demandKg: 21000 },
      { month: 'Sep (Current)', price: 26.0, demandKg: 23000 }
    ],
    seasonalityFactor: 1.11,
    marketSignal: 'Firm - Rabi stored stocks depleting as pre-festive procurement begins.',
    supplyStatus: 'Moderate',
    aiInsight: 'Buyers are contracting Grade A storage onions ahead of the post-monsoon festive period.'
  }
};
