// Firebase Configuration & Service Initializer
// Provides graceful fallback to Prototype Demo Mode if credentials are not configured

export const isFirebaseConfigured = () => {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key'
  );
};

export const getFirebaseStatus = () => {
  if (isFirebaseConfigured()) {
    return {
      mode: 'Firebase Live Cloud',
      connected: true,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
    };
  }
  return {
    mode: 'Prototype Demo Mode (Local Reactive Store)',
    connected: true,
    note: 'Running fully functional stateful prototype with pre-seeded multi-crop datasets.'
  };
};
