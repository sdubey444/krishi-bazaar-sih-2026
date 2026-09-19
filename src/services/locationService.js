// Krishi Bazaar India-Wide Location Intelligence & Geolocation Engine
// Adheres strictly to TRUTH > DEMO APPEARANCE (never fabricates GPS coordinates)

import { INDIA_STATES_AND_UTS, INDIA_AGRICULTURAL_HUBS } from '../data/indiaLocationData.js';
import { HUBS_COORDINATES } from '../data/coordinates.js';

const STORAGE_KEY = 'kb_active_location';

export const COMMODITY_WORDS = new Set([
  'tomato', 'potato', 'onion', 'wheat', 'rice', 'grain', 'grains', 'fruit', 'fruits', 
  'veg', 'vegetable', 'vegetables', 'cotton', 'banana', 'apple', 'mango', 'garlic', 
  'chilli', 'spices', 'flower', 'flowers', 'paddy', 'mustard', 'pulses', 'pomegranate',
  'orange', 'grapes', 'mushroom', 'poultry', 'fish', 'meat', 'anaj', 'sabzi', 'phul'
]);

/**
 * Haversine formula to compute great-circle distance in kilometers
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const HINDI_LOCATION_ALIASES = {
  'शिमला': { state: 'Himachal Pradesh', district: 'Shimla' },
  'प्रयागराज': { state: 'Uttar Pradesh', district: 'Prayagraj' },
  'इलाहाबाद': { state: 'Uttar Pradesh', district: 'Prayagraj' },
  'नासिक': { state: 'Maharashtra', district: 'Nashik' },
  'पुणे': { state: 'Maharashtra', district: 'Pune' },
  'नागपुर': { state: 'Maharashtra', district: 'Nagpur' },
  'इंदौर': { state: 'Madhya Pradesh', district: 'Indore' },
  'भोपाल': { state: 'Madhya Pradesh', district: 'Bhopal' },
  'उज्जैन': { state: 'Madhya Pradesh', district: 'Ujjain' },
  'लखनऊ': { state: 'Uttar Pradesh', district: 'Lucknow' },
  'वाराणसी': { state: 'Uttar Pradesh', district: 'Varanasi' },
  'कानपुर': { state: 'Uttar Pradesh', district: 'Kanpur' },
  'आगरा': { state: 'Uttar Pradesh', district: 'Agra' },
  'जयपुर': { state: 'Rajasthan', district: 'Jaipur' },
  'जोधपुर': { state: 'Rajasthan', district: 'Jodhpur' },
  'कोटा': { state: 'Rajasthan', district: 'Kota' },
  'गंगानगर': { state: 'Rajasthan', district: 'Sri Ganganagar' },
  'श्री गंगानगर': { state: 'Rajasthan', district: 'Sri Ganganagar' },
  'लुधियाना': { state: 'Punjab', district: 'Ludhiana' },
  'अमृतसर': { state: 'Punjab', district: 'Amritsar' },
  'करनाल': { state: 'Haryana', district: 'Karnal' },
  'हिसार': { state: 'Haryana', district: 'Hisar' },
  'अहमदाबाद': { state: 'Gujarat', district: 'Ahmedabad' },
  'राजकोट': { state: 'Gujarat', district: 'Rajkot' },
  'सूरत': { state: 'Gujarat', district: 'Surat' },
  'पटना': { state: 'Bihar', district: 'Patna' },
  'कोलकाता': { state: 'West Bengal', district: 'Kolkata' },
  'बेंगलुरु': { state: 'Karnataka', district: 'Bengaluru' },
  'हैदराबाद': { state: 'Telangana', district: 'Hyderabad' },
  'चेन्नई': { state: 'Tamil Nadu', district: 'Chennai' },
  'दिल्ली': { state: 'Delhi', district: 'North Delhi' },
  'उत्तर प्रदेश': { state: 'Uttar Pradesh', district: 'Prayagraj' },
  'हिमाचल': { state: 'Himachal Pradesh', district: 'Shimla' },
  'हिमाचल प्रदेश': { state: 'Himachal Pradesh', district: 'Shimla' },
  'पंजाब': { state: 'Punjab', district: 'Ludhiana' },
  'हरियाणा': { state: 'Haryana', district: 'Karnal' },
  'राजस्थान': { state: 'Rajasthan', district: 'Jaipur' },
  'मध्य प्रदेश': { state: 'Madhya Pradesh', district: 'Indore' },
  'महाराष्ट्र': { state: 'Maharashtra', district: 'Nashik' },
  'गुजरात': { state: 'Gujarat', district: 'Ahmedabad' }
};

class LocationService {
  constructor() {
    this.listeners = new Set();
    this.activeLocation = this.loadPersistedLocation();
    this.gpsState = {
      isAvailable: false,
      coords: null,
      permissionState: 'prompt', // 'prompt' | 'granted' | 'denied' | 'unsupported'
      error: null
    };
  }

  loadPersistedLocation() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore
    }
    // Default initial location: Prayagraj, UP
    return {
      state: 'Uttar Pradesh',
      district: 'Prayagraj',
      mandi: 'Mundera Mandi',
      lat: 25.4358,
      lng: 81.8463,
      source: 'default',
      isManual: false
    };
  }

  persistLocation(loc) {
    this.activeLocation = loc;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      }
    } catch (e) {
      // Ignore
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.getLocationContext());
      } catch (e) {
        console.error('LocationService listener error:', e);
      }
    }
  }

  /**
   * Request device GPS location via browser Geolocation API
   * Will only succeed if user grants permission and coordinates are returned.
   */
  async requestDeviceGps() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.gpsState = {
        isAvailable: false,
        coords: null,
        permissionState: 'unsupported',
        error: 'Geolocation is not supported by your browser.'
      };
      return { success: false, error: this.gpsState.error };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          const closest = this.findNearestDistrict(lat, lng);

          const resolved = {
            state: closest.state,
            district: closest.district.name,
            mandi: closest.district.primaryMandis[0] || `${closest.district.name} Main APMC`,
            lat,
            lng,
            accuracy,
            source: 'gps',
            isManual: false,
            distanceToDistrictCenterKm: closest.distanceKm
          };

          this.gpsState = {
            isAvailable: true,
            coords: { lat, lng, accuracy },
            permissionState: 'granted',
            error: null
          };

          this.persistLocation(resolved);
          resolve({ success: true, location: resolved });
        },
        (err) => {
          let errorMsg = 'GPS location unavailable.';
          let perm = 'denied';
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = 'GPS permission was denied by user.';
            perm = 'denied';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMsg = 'GPS position is currently unavailable.';
            perm = 'unavailable';
          } else if (err.code === err.TIMEOUT) {
            errorMsg = 'GPS request timed out.';
            perm = 'timeout';
          }

          this.gpsState = {
            isAvailable: false,
            coords: null,
            permissionState: perm,
            error: errorMsg
          };

          resolve({ success: false, error: errorMsg, code: err.code });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  /**
   * Finds the nearest agricultural district in India for a given lat/lng
   */
  findNearestDistrict(lat, lng) {
    let bestMatch = null;
    let minDistance = Infinity;

    for (const [stateName, stateInfo] of Object.entries(INDIA_AGRICULTURAL_HUBS)) {
      for (const dist of stateInfo.districts) {
        const d = calculateDistanceKm(lat, lng, dist.lat, dist.lng);
        if (d !== null && d < minDistance) {
          minDistance = d;
          bestMatch = {
            state: stateName,
            district: dist,
            distanceKm: d
          };
        }
      }
    }

    if (!bestMatch) {
      return {
        state: 'Uttar Pradesh',
        district: INDIA_AGRICULTURAL_HUBS['Uttar Pradesh'].districts[0],
        distanceKm: 0
      };
    }

    return bestMatch;
  }

  /**
   * Set location manually (State -> District -> Mandi)
   */
  setManualLocation({ state, district, mandi = null }) {
    const stateData = INDIA_AGRICULTURAL_HUBS[state];
    const distData = stateData?.districts.find(d => d.name.toLowerCase() === district.toLowerCase());

    const loc = {
      state,
      district,
      mandi: mandi || distData?.primaryMandis[0] || `${district} Mandi`,
      lat: distData?.lat || 26.0,
      lng: distData?.lng || 81.0,
      source: 'manual',
      isManual: true
    };

    this.persistLocation(loc);
    return loc;
  }

  /**
   * Alias for setting user-selected manual location
   */
  setUserSelectedLocation(state, district, mandi = null) {
    return this.setManualLocation({ state, district, mandi });
  }

  /**
   * Reset user selection back to default
   */
  clearSelectedLocation() {
    this.activeLocation = {
      state: 'Uttar Pradesh',
      district: 'Prayagraj',
      mandi: 'Mundera Mandi',
      lat: 25.4358,
      lng: 81.8463,
      source: 'default',
      isManual: false
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Resolves explicit location from natural user query (e.g. "Shimla mein pyaaz ka kya rate hai?")
   * Rule 13: Explicit location in current user query overrides GPS and manual selection!
   */
  resolveExplicitLocationFromQuery(queryText) {
    if (!queryText) return null;
    const clean = queryText.toLowerCase();

    // Check Hindi Devanagari location aliases first
    for (const [hindiName, info] of Object.entries(HINDI_LOCATION_ALIASES)) {
      if (clean.includes(hindiName.toLowerCase())) {
        const stateData = INDIA_AGRICULTURAL_HUBS[info.state];
        const dist = stateData?.districts.find(d => d.name.toLowerCase() === info.district.toLowerCase()) || stateData?.districts[0];
        if (dist) {
          return {
            state: info.state,
            district: dist.name,
            mandi: dist.primaryMandis?.[0] || `${dist.name} Mandi`,
            lat: dist.lat,
            lng: dist.lng,
            source: 'query_explicit',
            matchedToken: dist.name
          };
        }
      }
    }

    // Check states
    for (const [stateName, stateData] of Object.entries(INDIA_AGRICULTURAL_HUBS)) {
      if (clean.includes(stateName.toLowerCase())) {
        // Check if a specific district of that state is also mentioned
        for (const dist of stateData.districts) {
          if (clean.includes(dist.name.toLowerCase())) {
            return {
              state: stateName,
              district: dist.name,
              mandi: dist.primaryMandis[0] || `${dist.name} Mandi`,
              lat: dist.lat,
              lng: dist.lng,
              source: 'query_explicit',
              matchedToken: dist.name
            };
          }
        }
        // State matched without specific district -> use capital / primary district
        const primaryDist = stateData.districts[0];
        return {
          state: stateName,
          district: primaryDist.name,
          mandi: primaryDist.primaryMandis[0] || `${primaryDist.name} Mandi`,
          lat: primaryDist.lat,
          lng: primaryDist.lng,
          source: 'query_explicit',
          matchedToken: stateName
        };
      }
    }

    // Check all districts across all states
    for (const [stateName, stateData] of Object.entries(INDIA_AGRICULTURAL_HUBS)) {
      for (const dist of stateData.districts) {
        if (clean.includes(dist.name.toLowerCase())) {
          return {
            state: stateName,
            district: dist.name,
            mandi: dist.primaryMandis[0] || `${dist.name} Mandi`,
            lat: dist.lat,
            lng: dist.lng,
            source: 'query_explicit',
            matchedToken: dist.name
          };
        }
        // Check primary mandis (full phrase and meaningful words)
        for (const mandi of dist.primaryMandis) {
          const simpleMandiName = mandi.toLowerCase().replace(/mandi|apmc|market|yard|wholesale|complex/g, '').trim();
          const mandiTokens = simpleMandiName.split(/\s+/).filter(w => 
            w.length > 3 && 
            !['asia', 'largest', 'main', 'road', 'terminal', 'city', 'fruit', 'grain', 'central'].includes(w) &&
            !COMMODITY_WORDS.has(w)
          );
          
          if ((simpleMandiName.length > 3 && !COMMODITY_WORDS.has(simpleMandiName) && clean.includes(simpleMandiName)) ||
              mandiTokens.some(tok => clean.includes(tok))) {
            return {
              state: stateName,
              district: dist.name,
              mandi,
              lat: dist.lat,
              lng: dist.lng,
              source: 'query_explicit',
              matchedToken: mandi
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Location Priority Engine (Strict 5-Tier Rule):
   * 1. Explicit location in current user query
   * 2. User-selected location (manual change)
   * 3. Current device/browser location if permission granted
   * 4. Account/profile location if appropriate
   * 5. No location / Default fallback
   */
  getLocationContext(queryText = null, userProfileLocation = null) {
    // 1. Explicit in query
    if (queryText) {
      const explicit = this.resolveExplicitLocationFromQuery(queryText);
      if (explicit) return explicit;
    }

    // 2. User-selected manual location
    if (this.activeLocation && this.activeLocation.isManual) {
      return this.activeLocation;
    }

    // 3. Device GPS location if available
    if (this.gpsState.isAvailable && this.activeLocation?.source === 'gps') {
      return this.activeLocation;
    }

    // 4. User profile location
    if (userProfileLocation) {
      const explicitProfile = this.resolveExplicitLocationFromQuery(userProfileLocation);
      if (explicitProfile) {
        return {
          ...explicitProfile,
          source: 'profile'
        };
      }
    }

    // 5. Fallback active location (Prayagraj, UP or previously stored)
    return this.activeLocation || {
      state: 'Uttar Pradesh',
      district: 'Prayagraj',
      mandi: 'Mundera Mandi',
      lat: 25.4358,
      lng: 81.8463,
      source: 'fallback'
    };
  }

  /**
   * Retrieves all verified mandis within the state or district,
   * calculating real distance from reference coords if available.
   */
  getNearbyMandisForContext(locationContext) {
    const loc = locationContext || this.getLocationContext();
    const stateData = INDIA_AGRICULTURAL_HUBS[loc.state];
    if (!stateData) return [];

    const results = [];
    const userLat = loc.lat;
    const userLng = loc.lng;

    for (const dist of stateData.districts) {
      const distKm = (userLat && userLng) ? calculateDistanceKm(userLat, userLng, dist.lat, dist.lng) : null;
      for (const mandi of dist.primaryMandis) {
        results.push({
          mandiName: mandi,
          district: dist.name,
          state: loc.state,
          distanceKm: distKm,
          majorCrops: dist.majorCrops,
          lat: dist.lat,
          lng: dist.lng
        });
      }
    }

    // Sort by distance if available
    results.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    return results;
  }
}

export const locationService = new LocationService();
