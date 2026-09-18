// Krishi Bazaar Procurement Configuration & Normalization
// Establishes standardized unit conversion and configurable aggregation thresholds

export const PROCUREMENT_CONFIG = {
  // Unit conversion multipliers to standard Kilograms (KG)
  QUINTAL_TO_KG: 100, // 1 Quintal = 100 KG
  TON_TO_KG: 1000,    // 1 Metric Ton = 1000 KG

  // Configurable threshold: orders exceeding this quantity in KG represent larger procurement
  // that typically benefits from or requires multi-farmer supply aggregation
  BULK_AGGREGATION_THRESHOLD_KG: 500
};

/**
 * Normalizes any quantity to standard Kilograms (KG)
 * @param {Number} quantity - Numeric quantity entered by buyer
 * @param {String} unit - 'kg' | 'Quintal' | 'Ton'
 * @returns {Number} Normalized quantity in KG
 */
export const normalizeToKg = (quantity = 0, unit = 'kg') => {
  const num = Number(quantity) || 0;
  const cleanUnit = (unit || 'kg').toLowerCase().trim();

  if (cleanUnit.includes('quintal') || cleanUnit.includes('kintal') || cleanUnit.includes('क्विंटल')) {
    return num * PROCUREMENT_CONFIG.QUINTAL_TO_KG;
  }
  if (cleanUnit.includes('ton') || cleanUnit.includes('टन')) {
    return num * PROCUREMENT_CONFIG.TON_TO_KG;
  }
  return num;
};

/**
 * Internally classifies procurement size based on normalized KG
 * (Does NOT expose separate buyer modes or switches to the user)
 * @param {Number} normalizedKg - Weight in Kilograms
 * @returns {Object} Internal classification metadata
 */
export const classifyProcurement = (normalizedKg = 0) => {
  const isLarge = normalizedKg >= PROCUREMENT_CONFIG.BULK_AGGREGATION_THRESHOLD_KG;
  return {
    isBulk: isLarge,
    thresholdKg: PROCUREMENT_CONFIG.BULK_AGGREGATION_THRESHOLD_KG,
    type: isLarge ? 'Large / Aggregated Procurement' : 'Direct Single-Farmer Purchase',
    description: isLarge
      ? `Tonnage requirement (${normalizedKg.toLocaleString()} KG) exceeds single farm lot baseline; dynamically aggregated across smallholders.`
      : `Standard requirement (${normalizedKg.toLocaleString()} KG); fulfilled directly from optimal farmer listing.`
  };
};
