// Explainable AI Demand Forecasting & Price Intelligence Engine
// Uses Least-Squares Trend Regression, Weighted Moving Averages, and Seasonality Factors

import { CROP_MARKET_SERIES } from '../data/marketData.js';
import { CROPS } from '../config/crops.js';

/**
 * Calculates linear regression slope and intercept from a series of values
 */
const calculateLinearTrend = (values) => {
  const n = values.length;
  if (n <= 1) return { slope: 0, intercept: values[0] || 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

/**
 * Performs crop-specific demand forecasting
 * @param {String} cropId - e.g. 'wheat', 'rice', 'mustard'
 * @returns {Object} Forecast results with historical points, projected demand, % change, and chart data
 */
export const getCropDemandForecast = (cropId = 'wheat') => {
  const normalizedId = cropId.toLowerCase();
  const series = CROP_MARKET_SERIES[normalizedId] || CROP_MARKET_SERIES['wheat'];
  const cropMeta = CROPS.find(c => c.id === normalizedId) || CROPS[0];

  const demandValues = series.priceHistory.map(h => h.demandKg);
  const currentDemand = demandValues[demandValues.length - 1];

  // Statistical Linear Regression over the historical time series
  const { slope, intercept } = calculateLinearTrend(demandValues);
  
  // Predict next period (index = demandValues.length) with seasonality adjustment
  const nextRaw = intercept + slope * demandValues.length;
  const forecastDemand = Math.round(nextRaw * (series.seasonalityFactor || 1.05));

  const demandChangeKg = forecastDemand - currentDemand;
  const percentageChange = Number(((demandChangeKg / currentDemand) * 100).toFixed(1));
  const trend = percentageChange >= 0 ? 'Increasing' : 'Decreasing';

  // Construct chart-ready data points
  const chartData = series.priceHistory.map(item => ({
    month: item.month,
    demand: item.demandKg,
    forecast: null
  }));

  // Append next period projection point
  chartData.push({
    month: 'Oct (Forecast)',
    demand: null,
    forecast: forecastDemand
  });

  return {
    cropId: normalizedId,
    cropName: series.cropName,
    category: series.category,
    unit: series.unit,
    emoji: cropMeta.emoji,
    currentDemand,
    forecastDemand,
    demandChangeKg,
    percentageChange,
    trend,
    modelMethod: 'Linear Trend Regression with Regional Seasonality Multiplier',
    marketSignal: series.marketSignal,
    supplyStatus: series.supplyStatus,
    aiInsight: series.aiInsight,
    chartData
  };
};

/**
 * Performs agricultural price intelligence & trend estimation
 * @param {String} cropId - e.g. 'wheat', 'rice', 'mustard'
 * @returns {Object} Current price, estimated next price, historical trend points, % change
 */
export const getCropPriceIntelligence = (cropId = 'wheat') => {
  const normalizedId = cropId.toLowerCase();
  const series = CROP_MARKET_SERIES[normalizedId] || CROP_MARKET_SERIES['wheat'];
  const cropMeta = CROPS.find(c => c.id === normalizedId) || CROPS[0];

  const priceValues = series.priceHistory.map(h => h.price);
  const currentPrice = series.currentPrice || priceValues[priceValues.length - 1];

  // Weighted Moving Average (WMA) of last 3 periods: weights [1, 2, 3]
  const len = priceValues.length;
  const wma = (priceValues[len - 3] * 1 + priceValues[len - 2] * 2 + priceValues[len - 1] * 3) / 6;

  // Trend Slope
  const { slope } = calculateLinearTrend(priceValues);
  
  // Estimated Next Price (blending WMA and Slope)
  const estimatedPrice = Number((wma + (slope * 0.75)).toFixed(1));
  const priceChange = Number((estimatedPrice - currentPrice).toFixed(1));
  const percentageChange = Number(((priceChange / currentPrice) * 100).toFixed(1));
  const trend = percentageChange > 0 ? 'Increasing' : percentageChange < 0 ? 'Decreasing' : 'Stable';

  const chartData = series.priceHistory.map(item => ({
    month: item.month,
    price: item.price,
    estimatedPrice: null
  }));

  chartData.push({
    month: 'Next Est.',
    price: null,
    estimatedPrice: estimatedPrice
  });

  return {
    cropId: normalizedId,
    cropName: series.cropName,
    category: series.category,
    unit: series.unit,
    emoji: cropMeta.emoji,
    currentPrice,
    estimatedPrice,
    priceChange,
    percentageChange,
    trend,
    modelMethod: 'Weighted Moving Average (3-Period) + Momentum Trend Regression',
    marketSignal: series.marketSignal,
    chartData
  };
};

/**
 * Combined Supply-Demand Analysis & Crop Recommendation Engine
 * Synthesizes expected demand, market supply status, active listing saturation, and price trends.
 * Uses strictly advisory language (Expected, Estimated, Recommended, Potential).
 * 
 * @param {String} cropId - e.g. 'wheat', 'mustard', 'rice', 'chickpea'
 * @param {Array} listings - Optional array of current active listings
 * @returns {Object} Comprehensive analysis and advisory recommendation
 */
export const getCropSupplyDemandAnalysis = (cropId = 'wheat', listings = []) => {
  const normalizedId = cropId.toLowerCase();
  const forecast = getCropDemandForecast(normalizedId);
  const priceIntel = getCropPriceIntelligence(normalizedId);

  // Compute listed supply volume from live listings if provided
  const cropListings = listings.filter(l => 
    (l.cropId || l.produce || '').toLowerCase() === normalizedId &&
    l.status === 'Active'
  );
  const activeSupplyKg = cropListings.reduce((sum, l) => sum + (l.availableQuantity || l.quantity || 0), 0);
  const farmerCount = cropListings.length;

  let demandLevel = 'High';
  let supplyLevel = forecast.supplyStatus === 'Tight' ? 'Tight' : forecast.supplyStatus === 'Ample' ? 'Very High' : 'Moderate';
  let competitionLevel = farmerCount >= 4 ? 'High' : farmerCount >= 2 ? 'Medium' : 'Low';
  let recommendation = '';
  let recommendationBadge = 'Advisory Recommendation';
  let rationale = '';

  if (normalizedId === 'wheat') {
    demandLevel = 'High';
    supplyLevel = activeSupplyKg > 8000 ? 'Very High' : 'High';
    competitionLevel = 'High';
    recommendation = 'Consider diversifying.';
    recommendationBadge = 'Market Saturation Advisory';
    rationale = 'While expected milling demand is high, local farmer listings and regional buffer inventories are very high with active producer competition. Farmers may consider diversifying acreage into high-demand oilseeds or pulses for potentially stronger returns.';
  } else if (normalizedId === 'mustard') {
    demandLevel = 'High';
    supplyLevel = 'Medium';
    competitionLevel = 'Medium';
    recommendation = 'Potentially favorable demand-supply balance.';
    recommendationBadge = 'Favorable Demand-Supply';
    rationale = 'Spot crushing mill procurement is high while regional mandi supply remains tight. Historical pricing indicators show firm buyer appetite and favorable price trends.';
  } else if (normalizedId === 'chickpea' || normalizedId === 'lentil' || normalizedId === 'pigeon_pea') {
    demandLevel = 'Medium-High';
    supplyLevel = 'Moderate';
    competitionLevel = 'Medium';
    recommendation = 'Steady market potential for dal milling procurement.';
    recommendationBadge = 'Steady Procurement Outlook';
    rationale = 'Pulse processing clusters maintain consistent purchase tenders. Well-graded lots with low moisture demonstrate steady buyer demand.';
  } else if (normalizedId === 'rice') {
    demandLevel = 'Very High';
    supplyLevel = 'Very High';
    competitionLevel = 'High';
    recommendation = 'Stable procurement outlook with competitive pricing.';
    recommendationBadge = 'High Volume Demand';
    rationale = 'Strong consumer consumption is offset by ample state-wide supply. Quality grading is key to securing top reference prices.';
  } else {
    demandLevel = forecast.percentageChange > 8 ? 'High' : 'Moderate';
    supplyLevel = forecast.supplyStatus || 'Moderate';
    competitionLevel = activeSupplyKg > 5000 ? 'High' : 'Moderate';
    recommendation = forecast.percentageChange > 5
      ? 'Potentially favorable demand-supply balance.'
      : 'Monitor spot prices before large harvest liquidation.';
    recommendationBadge = 'Market Intelligence';
    rationale = `Demand trend is ${forecast.trend.toLowerCase()} with ${supplyLevel.toLowerCase()} market availability.`;
  }

  return {
    cropId: normalizedId,
    cropName: forecast.cropName,
    emoji: forecast.emoji,
    expectedDemand: demandLevel,
    expectedSupply: supplyLevel,
    marketCompetition: competitionLevel,
    activeSupplyKg,
    activeFarmersCount: farmerCount,
    referencePrice: priceIntel.currentPrice,
    estimatedNextPrice: priceIntel.estimatedPrice,
    priceTrend: priceIntel.trend,
    recommendation,
    recommendationBadge,
    rationale,
    disclaimer: 'Analysis is based on available regional market records and statistical models. Does not guarantee future prices or profits.'
  };
};

