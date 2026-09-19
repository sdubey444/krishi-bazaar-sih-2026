// Agricultural Produce Catalog Configuration
// Supports multiple extensible categories and crops

export const CROP_CATEGORIES = {
  GRAINS: 'Grains',
  OILSEEDS: 'Oilseeds',
  PULSES: 'Pulses',
  VEGETABLES: 'Vegetables',
  OTHER: 'Other Produce'
};

export const CROPS = [
  // Grains
  {
    id: 'wheat',
    name: 'Wheat',
    category: CROP_CATEGORIES.GRAINS,
    emoji: '🌾',
    defaultUnit: 'kg',
    refPrice: 28,
    minOrderKg: 10,
    shelfLifeDays: 365,
    description: 'High quality Sharbati & Lokwan milling wheat with low moisture content.'
  },
  {
    id: 'rice',
    name: 'Rice',
    category: CROP_CATEGORIES.GRAINS,
    emoji: '🍚',
    defaultUnit: 'kg',
    refPrice: 42,
    minOrderKg: 5,
    shelfLifeDays: 365,
    description: 'Premium aromatic Sona Masoori & Basmati varieties direct from paddy farmers.'
  },
  {
    id: 'maize',
    name: 'Maize',
    category: CROP_CATEGORIES.GRAINS,
    emoji: '🌽',
    defaultUnit: 'kg',
    refPrice: 22,
    minOrderKg: 20,
    shelfLifeDays: 180,
    description: 'Clean yellow feed & food-grade maize kernels.'
  },

  // Oilseeds
  {
    id: 'mustard',
    name: 'Mustard',
    category: CROP_CATEGORIES.OILSEEDS,
    emoji: '🌼',
    defaultUnit: 'kg',
    refPrice: 58,
    minOrderKg: 10,
    shelfLifeDays: 270,
    description: 'High oil-content black & yellow mustard seeds from certified FPOs.'
  },
  {
    id: 'soybean',
    name: 'Soybean',
    category: CROP_CATEGORIES.OILSEEDS,
    emoji: '🌱',
    defaultUnit: 'kg',
    refPrice: 46,
    minOrderKg: 20,
    shelfLifeDays: 180,
    description: 'High protein non-GMO industrial and food grade soybean seeds.'
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    category: CROP_CATEGORIES.OILSEEDS,
    emoji: '🥜',
    defaultUnit: 'kg',
    refPrice: 65,
    minOrderKg: 10,
    shelfLifeDays: 120,
    description: 'Sun-dried pod groundnut with high seed recovery ratio.'
  },

  // Pulses
  {
    id: 'chickpea',
    name: 'Chickpea',
    category: CROP_CATEGORIES.PULSES,
    emoji: '🧆',
    defaultUnit: 'kg',
    refPrice: 62,
    minOrderKg: 10,
    shelfLifeDays: 240,
    description: 'Desi and Kabuli chickpeas, well-graded and sorted for retail and millers.'
  },
  {
    id: 'lentil',
    name: 'Lentil',
    category: CROP_CATEGORIES.PULSES,
    emoji: '🥣',
    defaultUnit: 'kg',
    refPrice: 70,
    minOrderKg: 10,
    shelfLifeDays: 240,
    description: 'Red masoor and whole green lentils directly from pulse clusters.'
  },
  {
    id: 'pigeon_pea',
    name: 'Pigeon Pea',
    category: CROP_CATEGORIES.PULSES,
    emoji: '🍲',
    defaultUnit: 'kg',
    refPrice: 88,
    minOrderKg: 10,
    shelfLifeDays: 240,
    description: 'Raw Tur/Arhar dal pods ready for processing.'
  },

  // Vegetables
  {
    id: 'potato',
    name: 'Potato',
    category: CROP_CATEGORIES.VEGETABLES,
    emoji: '🥔',
    defaultUnit: 'kg',
    refPrice: 18,
    minOrderKg: 25,
    shelfLifeDays: 45,
    description: 'Farm-fresh table and processing grade potatoes (Jyoti & Chipsona).'
  },
  {
    id: 'tomato',
    name: 'Tomato',
    category: CROP_CATEGORIES.VEGETABLES,
    emoji: '🍅',
    defaultUnit: 'kg',
    refPrice: 24,
    minOrderKg: 15,
    shelfLifeDays: 10,
    description: 'Firm, sun-ripened red hybrid tomatoes picked within 24 hours.'
  },
  {
    id: 'onion',
    name: 'Onion',
    category: CROP_CATEGORIES.VEGETABLES,
    emoji: '🧅',
    defaultUnit: 'kg',
    refPrice: 26,
    minOrderKg: 25,
    shelfLifeDays: 60,
    description: 'Medium to large size cured red onions from Nashik & UP belts.'
  },

  // Other Produce
  {
    id: 'sugarcane_jaggery',
    name: 'Sugarcane Jaggery',
    category: CROP_CATEGORIES.OTHER,
    emoji: '🍯',
    defaultUnit: 'kg',
    refPrice: 50,
    minOrderKg: 10,
    shelfLifeDays: 180,
    description: 'Traditional chemical-free organic jaggery blocks.'
  },
  {
    id: 'apple',
    name: 'Apple',
    category: CROP_CATEGORIES.OTHER,
    emoji: '🍎',
    defaultUnit: 'kg',
    refPrice: 95,
    minOrderKg: 20,
    shelfLifeDays: 45,
    description: 'Crisp Royal Delicious and Golden apples from Himachal Pradesh and Kashmir orchards.'
  },
  {
    id: 'chilli',
    name: 'Green Chilli',
    category: CROP_CATEGORIES.VEGETABLES,
    emoji: '🌶️',
    defaultUnit: 'kg',
    refPrice: 40,
    minOrderKg: 10,
    shelfLifeDays: 14,
    description: 'Spicy fresh green chillies direct from Guntur and UP vegetable belts.'
  },
  {
    id: 'garlic',
    name: 'Garlic',
    category: CROP_CATEGORIES.VEGETABLES,
    emoji: '🧄',
    defaultUnit: 'kg',
    refPrice: 120,
    minOrderKg: 10,
    shelfLifeDays: 180,
    description: 'Cured whole white garlic bulbs from Mandsaur and Rajasthan mandis.'
  },
  {
    id: 'cotton',
    name: 'Raw Cotton',
    category: CROP_CATEGORIES.OTHER,
    emoji: '☁️',
    defaultUnit: 'kg',
    refPrice: 72,
    minOrderKg: 50,
    shelfLifeDays: 365,
    description: 'Medium and long staple raw seed cotton (Kapas) from Punjab and Gujarat belts.'
  }
];

export const getCropById = (id) => {
  return CROPS.find(c => c.id.toLowerCase() === id.toLowerCase()) || {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    category: CROP_CATEGORIES.OTHER,
    emoji: '🌾',
    defaultUnit: 'kg',
    refPrice: 30,
    minOrderKg: 10,
    shelfLifeDays: 90,
    description: 'Agricultural produce'
  };
};

export const getCropByName = (name) => {
  return CROPS.find(c => c.name.toLowerCase() === name.toLowerCase()) || getCropById(name);
};
