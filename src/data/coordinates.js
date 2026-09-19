// Geographic coordinates for India-wide logistics route planning and optimization
import { INDIA_AGRICULTURAL_HUBS } from './indiaLocationData.js';

export const HUBS_COORDINATES = {
  // Northern Corridor (UP Hubs)
  'Prayagraj': { lat: 25.4358, lng: 81.8463, state: 'Uttar Pradesh' },
  'Kanpur': { lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  'Unnao': { lat: 26.5393, lng: 80.4878, state: 'Uttar Pradesh' },
  'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  'Varanasi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
  'Barabanki': { lat: 26.9274, lng: 81.1842, state: 'Uttar Pradesh' },
  'Fatehpur': { lat: 25.9287, lng: 80.8128, state: 'Uttar Pradesh' },
  'Ayodhya': { lat: 26.7922, lng: 82.1998, state: 'Uttar Pradesh' },
  'Agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  'Bareilly': { lat: 28.3670, lng: 79.4304, state: 'Uttar Pradesh' },

  // Punjab & Haryana Hubs
  'Ludhiana': { lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  'Amritsar': { lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  'Jalandhar': { lat: 31.3260, lng: 75.5762, state: 'Punjab' },
  'Bathinda': { lat: 30.2110, lng: 74.9455, state: 'Punjab' },
  'Karnal': { lat: 29.6857, lng: 76.9905, state: 'Haryana' },
  'Hisar': { lat: 29.1492, lng: 75.7217, state: 'Haryana' },

  // Delhi NCR
  'Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Azadpur': { lat: 28.7041, lng: 77.1025, state: 'Delhi' },
  'Ghazipur': { lat: 28.6280, lng: 77.3000, state: 'Delhi' },

  // Himachal Pradesh & J&K Hubs
  'Shimla': { lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh' },
  'Kullu': { lat: 31.9579, lng: 77.1095, state: 'Himachal Pradesh' },
  'Solan': { lat: 30.9084, lng: 77.0999, state: 'Himachal Pradesh' },
  'Srinagar': { lat: 34.0837, lng: 74.7973, state: 'Jammu & Kashmir' },
  'Jammu': { lat: 32.7266, lng: 74.8570, state: 'Jammu & Kashmir' },

  // Western Corridor (Maharashtra, Gujarat, Rajasthan)
  'Nashik': { lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  'Jalgaon': { lat: 21.0077, lng: 75.5626, state: 'Maharashtra' },
  'Rajkot': { lat: 22.3039, lng: 70.8022, state: 'Gujarat' },
  'Surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Kota': { lat: 25.2138, lng: 75.8648, state: 'Rajasthan' },
  'Jodhpur': { lat: 26.2389, lng: 73.0243, state: 'Rajasthan' },

  // Central Hubs (Madhya Pradesh)
  'Indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  'Ujjain': { lat: 23.1765, lng: 75.7885, state: 'Madhya Pradesh' },
  'Bhopal': { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },

  // Southern Corridor (Tamil Nadu, Karnataka, Kerala, AP, Telangana)
  'Coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  'Madurai': { lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  'Salem': { lat: 11.6643, lng: 78.1460, state: 'Tamil Nadu' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Mysuru': { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  'Hubballi': { lat: 15.3647, lng: 75.1240, state: 'Karnataka' },
  'Ernakulam': { lat: 9.9816, lng: 76.2999, state: 'Kerala' },
  'Kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  'Kozhikode': { lat: 11.2588, lng: 75.7804, state: 'Kerala' },
  'Guntur': { lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh' },
  'Vijayawada': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'Warangal': { lat: 17.9689, lng: 79.5941, state: 'Telangana' },

  // Eastern & North-Eastern Corridor (WB, Bihar, Odisha, Assam)
  'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'Siliguri': { lat: 26.7271, lng: 88.3953, state: 'West Bengal' },
  'Patna': { lat: 25.5941, lng: 85.1376, state: 'Bihar' },
  'Muzaffarpur': { lat: 26.1209, lng: 85.3647, state: 'Bihar' },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245, state: 'Odisha' },
  'Cuttack': { lat: 20.4625, lng: 85.8828, state: 'Odisha' },
  'Guwahati': { lat: 26.1445, lng: 91.7362, state: 'Assam' },
  'Dehradun': { lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' }
};

export const getCoordinatesForLocation = (locationName) => {
  if (!locationName) return HUBS_COORDINATES['Prayagraj'];
  
  const clean = locationName.trim().toLowerCase();
  
  // 1. Check exact key match
  const key = Object.keys(HUBS_COORDINATES).find(
    k => k.toLowerCase() === clean
  );
  if (key) return HUBS_COORDINATES[key];

  // 2. Check substring match against known hubs
  for (const [hubName, coords] of Object.entries(HUBS_COORDINATES)) {
    if (clean.includes(hubName.toLowerCase()) || hubName.toLowerCase().includes(clean)) {
      return coords;
    }
  }

  // 3. Check across India Agricultural Hubs districts and mandis
  for (const [stateName, stateData] of Object.entries(INDIA_AGRICULTURAL_HUBS)) {
    if (clean.includes(stateName.toLowerCase())) {
      const firstDistrict = stateData.districts[0];
      if (firstDistrict) {
        return { lat: firstDistrict.lat, lng: firstDistrict.lng, state: stateName };
      }
    }
    for (const dist of stateData.districts) {
      if (clean.includes(dist.name.toLowerCase()) || dist.name.toLowerCase().includes(clean)) {
        return { lat: dist.lat, lng: dist.lng, state: stateName };
      }
      for (const mandi of dist.primaryMandis) {
        if (clean.includes(mandi.toLowerCase()) || mandi.toLowerCase().includes(clean)) {
          return { lat: dist.lat, lng: dist.lng, state: stateName };
        }
      }
    }
  }
  
  // 4. Hash-based deterministic coordinate generator for custom locations around Central UP
  let hash = 0;
  for (let i = 0; i < locationName.length; i++) {
    hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash % 100) / 100) * 0.8;
  const lngOffset = (((hash >> 3) % 100) / 100) * 0.8;
  return {
    lat: 26.0 + latOffset,
    lng: 81.0 + lngOffset,
    state: 'Uttar Pradesh'
  };
};
