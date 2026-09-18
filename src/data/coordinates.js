// Realistic geographic coordinates for logistics route planning and optimization

export const HUBS_COORDINATES = {
  'Prayagraj': { lat: 25.4358, lng: 81.8463, state: 'Uttar Pradesh' },
  'Kanpur': { lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  'Unnao': { lat: 26.5393, lng: 80.4878, state: 'Uttar Pradesh' },
  'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  'Varanasi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
  'Barabanki': { lat: 26.9274, lng: 81.1842, state: 'Uttar Pradesh' },
  'Fatehpur': { lat: 25.9287, lng: 80.8128, state: 'Uttar Pradesh' },
  'Ayodhya': { lat: 26.7922, lng: 82.1998, state: 'Uttar Pradesh' },
  'Agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' }
};

export const getCoordinatesForLocation = (locationName) => {
  if (!locationName) return HUBS_COORDINATES['Prayagraj'];
  const key = Object.keys(HUBS_COORDINATES).find(
    k => k.toLowerCase() === locationName.trim().toLowerCase()
  );
  if (key) return HUBS_COORDINATES[key];
  
  // Hash-based deterministic coordinate generator for custom locations around Central UP
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
