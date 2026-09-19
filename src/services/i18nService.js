// Krishi Bazaar 22-Language Multilingual Service
// Supports 22 Scheduled Indian Languages with persistent selection and Speech BCP-47 mapping

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', speechCode: 'hi-IN' },
  { code: 'en', name: 'English', englishName: 'English', speechCode: 'en-IN' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', speechCode: 'bn-IN' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', speechCode: 'mr-IN' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', speechCode: 'te-IN' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', speechCode: 'ta-IN' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', speechCode: 'gu-IN' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', speechCode: 'ur-IN' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', speechCode: 'kn-IN' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', speechCode: 'or-IN' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', speechCode: 'ml-IN' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', speechCode: 'pa-IN' },
  { code: 'as', name: 'অসমীয়া', englishName: 'Assamese', speechCode: 'as-IN' },
  { code: 'mai', name: 'मैथिली', englishName: 'Maithili', speechCode: 'hi-IN' },
  { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santali', speechCode: 'hi-IN' },
  { code: 'ks', name: 'कॉशुर', englishName: 'Kashmiri', speechCode: 'ks-IN' },
  { code: 'ne', name: 'नेपाली', englishName: 'Nepali', speechCode: 'ne-NP' },
  { code: 'sd', name: 'سنڌي', englishName: 'Sindhi', speechCode: 'sd-IN' },
  { code: 'kok', name: 'कोंकणी', englishName: 'Konkani', speechCode: 'kok-IN' },
  { code: 'doi', name: 'डोगरी', englishName: 'Dogri', speechCode: 'hi-IN' },
  { code: 'brx', name: 'बर\'', englishName: 'Bodo', speechCode: 'hi-IN' },
  { code: 'mni', name: 'মৈতৈলোন্', englishName: 'Manipuri', speechCode: 'bn-IN' },
  { code: 'sa', name: 'संस्कृतम्', englishName: 'Sanskrit', speechCode: 'sa-IN' }
];

const TRANSLATIONS = {
  en: {
    appName: 'Krishi Bazaar',
    tagline: 'Direct Farm-to-Market Platform',
    // Farmer 7 Primary Actions
    myCrops: 'My Crops',
    sellCrop: 'Sell Crop',
    todayPrice: "Today's Mandi Rate",
    myOrders: 'My Orders',
    myInventory: 'My Inventory',
    krishiSahayak: 'Krishi Sahayak AI',
    voiceAction: 'Tap & Speak',
    // Navigation
    products: 'Products',
    bulkSupply: 'Bulk Supply',
    marketPrices: 'Market Prices',
    logistics: 'Delivery & Route',
    farmerDashboard: 'Farmer Dashboard',
    buyerDashboard: 'Buyer Dashboard',
    adminDashboard: 'Admin Dashboard',
    switchRole: 'Switch Role',
    login: 'Log In',
    createAccount: 'Create Account',
    logout: 'Log Out',
    // Roles
    roleFarmer: 'Farmer / FPO',
    roleBuyer: 'Buyer / Consumer',
    roleAdmin: 'Platform Admin',
    // Location
    selectLocation: 'Select Location',
    changeLocation: 'Change Location',
    currentLocation: 'Current Location',
    usingGps: 'GPS Detected',
    // Status
    verifiedCurrent: 'Verified Current',
    latestAvailable: 'Latest available online data',
    priceUnavailable: 'Current price could not be verified',
    // Common
    quantity: 'Quantity',
    pricePerKg: 'Price per KG',
    quintal: 'Quintal',
    kg: 'KG',
    search: 'Search produce, crops or location...',
    filter: 'Filter',
    deleteListing: 'Delete Listing',
    editListing: 'Edit Listing',
    confirmDelete: 'Are you sure you want to delete this listing?',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  hi: {
    appName: 'कृषि बाज़ार',
    tagline: 'सीधा किसान से बाज़ार मंच',
    // Farmer 7 Primary Actions
    myCrops: 'मेरी फसल',
    sellCrop: 'फसल बेचें',
    todayPrice: 'आज का भाव',
    myOrders: 'मेरे ऑर्डर',
    myInventory: 'मेरा सामान',
    krishiSahayak: 'कृषि सहायक',
    voiceAction: 'बोलकर करें',
    // Navigation
    products: 'उत्पाद',
    bulkSupply: 'थोक आपूर्ति',
    marketPrices: 'मंडी भाव',
    logistics: 'डिलीवरी और रूट',
    farmerDashboard: 'किसान डैशबोर्ड',
    buyerDashboard: 'खरीदार डैशबोर्ड',
    adminDashboard: 'प्रशासक डैशबोर्ड',
    switchRole: 'भूमिका बदलें',
    login: 'लॉग इन करें',
    createAccount: 'खाता बनाएं',
    logout: 'लॉग आउट',
    // Roles
    roleFarmer: 'किसान / एफपीओ',
    roleBuyer: 'खरीदार / उपभोक्ता',
    roleAdmin: 'प्लेटफ़ॉर्म एडमिन',
    // Location
    selectLocation: 'स्थान चुनें',
    changeLocation: 'स्थान बदलें',
    currentLocation: 'वर्तमान स्थान',
    usingGps: 'जीपीएस द्वारा पहचाना गया',
    // Status
    verifiedCurrent: 'सत्यापित वर्तमान भाव',
    latestAvailable: 'ऑनलाइन उपलब्ध नवीनतम डेटा',
    priceUnavailable: 'वर्तमान भाव सत्यापित नहीं हो सका',
    // Common
    quantity: 'मात्रा',
    pricePerKg: 'भाव प्रति किलो',
    quintal: 'क्विंटल',
    kg: 'किलो',
    search: 'फसल, उत्पाद या मंडी खोजें...',
    filter: 'फ़िल्टर करें',
    deleteListing: 'लिस्टिंग हटाएं',
    editListing: 'लिस्टिंग संपादित करें',
    confirmDelete: 'क्या आप वाकई इस लिस्टिंग को हटाना चाहते हैं?',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें'
  },
  pa: {
    appName: 'ਕ੍ਰਿਸ਼ੀ ਬਾਜ਼ਾਰ',
    tagline: 'ਸਿੱਧਾ ਕਿਸਾਨ ਤੋਂ ਮੰਡੀ ਪਲੇਟਫਾਰਮ',
    myCrops: 'ਮੇਰੀ ਫਸਲ',
    sellCrop: 'ਫਸਲ ਵੇਚੋ',
    todayPrice: 'ਅੱਜ ਦਾ ਭਾਅ',
    myOrders: 'ਮੇਰੇ ਆਰਡਰ',
    myInventory: 'ਮੇਰਾ ਸਮਾਨ',
    krishiSahayak: 'ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ',
    voiceAction: 'ਬੋਲ ਕੇ ਕਰੋ',
    products: 'ਉਤਪਾਦ',
    bulkSupply: 'ਥੋਕ ਸਪਲਾਈ',
    marketPrices: 'ਮੰਡੀ ਭਾਅ',
    logistics: 'ਡਿਲੀਵਰੀ ਅਤੇ ਰੂਟ',
    farmerDashboard: 'ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ',
    buyerDashboard: 'ਖਰੀਦਦਾਰ ਡੈਸ਼ਬੋਰਡ',
    adminDashboard: 'ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ',
    selectLocation: 'ਸਥਾਨ ਚੁਣੋ',
    changeLocation: 'ਸਥਾਨ ਬਦਲੋ'
  },
  bn: {
    appName: 'কৃষি বাজার',
    tagline: 'সরাসরি কৃষক থেকে বাজার প্ল্যাটফর্ম',
    myCrops: 'আমার ফসল',
    sellCrop: 'ফসল বিক্রি করুন',
    todayPrice: 'আজকের বাজার দর',
    myOrders: 'আমার অর্ডার',
    myInventory: 'আমার পণ্য',
    krishiSahayak: 'কৃষি সহায়ক',
    voiceAction: 'কথা বলে করুন',
    products: 'পণ্যসমূহ',
    bulkSupply: 'পাইকারি সরবরাহ',
    marketPrices: 'বাজার দর',
    logistics: 'ডেলিভারি ও রুট',
    farmerDashboard: 'কৃষক ড্যাশবোর্ড',
    buyerDashboard: 'ক্রেতা ড্যাশবোর্ড',
    adminDashboard: 'অ্যাডমিন ড্যাশবোর্ড',
    selectLocation: 'স্থান নির্বাচন করুন',
    changeLocation: 'স্থান পরিবর্তন করুন'
  },
  mr: {
    appName: 'कृषी बाजार',
    tagline: 'थेट शेतकरी ते बाजारपेठ व्यासपीठ',
    myCrops: 'माझे पीक',
    sellCrop: 'पीक विका',
    todayPrice: 'आजचा बाजारभाव',
    myOrders: 'माझे ऑर्डर्स',
    myInventory: 'माझा माल',
    krishiSahayak: 'कृषी सहाय्यक',
    voiceAction: 'बोलून करा',
    products: 'उत्पादने',
    bulkSupply: 'घाऊक पुरवठा',
    marketPrices: 'बाजारभाव',
    logistics: 'डिलिव्हरी व वाहतूक मार्ग',
    farmerDashboard: 'शेतकरी डॅशबोर्ड',
    buyerDashboard: 'खरेदीदार डॅशबोर्ड',
    adminDashboard: 'प्रशासक डॅशबोर्ड',
    selectLocation: 'स्थान निवडा',
    changeLocation: 'स्थान बदला'
  },
  ta: {
    appName: 'கிருஷி பஜார்',
    tagline: 'நேரடி விவசாயி முதல் சந்தை தளம்',
    myCrops: 'என் பயிர்',
    sellCrop: 'பயிர் விற்க',
    todayPrice: 'இன்றைய சந்தை விலை',
    myOrders: 'என் ஆர்டர்கள்',
    myInventory: 'என் இருப்பு',
    krishiSahayak: 'வேளாண் உதவியாளர்',
    voiceAction: 'பேசி செய்க',
    products: 'பொருட்கள்',
    bulkSupply: 'மொத்த விநியோகம்',
    marketPrices: 'சந்தை விலைகள்',
    logistics: 'டெலிவரி மற்றும் பாதை',
    farmerDashboard: 'விவசாயி டாஷ்போர்டு',
    buyerDashboard: 'வாங்குபவர் டாஷ்போர்டு',
    adminDashboard: 'நிர்வாக டாஷ்போர்டு',
    selectLocation: 'இடத்தை தேர்வு செய்க',
    changeLocation: 'இடத்தை மாற்றுக'
  },
  te: {
    appName: 'కృషి బజార్',
    tagline: 'రైతు నుండి నేరుగా మార్కెట్ వేదిక',
    myCrops: 'నా పంట',
    sellCrop: 'పంట అమ్మండి',
    todayPrice: 'ఈ రోజు మార్కెట్ ధర',
    myOrders: 'నా ఆర్డర్లు',
    myInventory: 'నా సరుకు',
    krishiSahayak: 'వ్యవసాయ సహాయకుడు',
    voiceAction: 'మాట్లాడి చేయండి',
    products: 'ఉత్పత్తులు',
    bulkSupply: 'భారీ సరఫరా',
    marketPrices: 'మార్కెట్ ధరలు',
    logistics: 'డెలివరీ మరియు రూట్',
    farmerDashboard: 'రైతు డ్యాష్‌బోర్డ్',
    buyerDashboard: 'కొనుగోలుదారు డ్యాష్‌బోర్డ్',
    adminDashboard: 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    selectLocation: 'ప్రాంతాన్ని ఎంచుకోండి',
    changeLocation: 'ప్రాంతం మార్చండి'
  },
  gu: {
    appName: 'કૃષિ બજાર',
    tagline: 'સીધા ખેડૂતથી માર્કેટ પ્લેટફોર્મ',
    myCrops: 'મારો પાક',
    sellCrop: 'પાક વેચો',
    todayPrice: 'આજનો બજાર ભાવ',
    myOrders: 'મારા ઓર્ડર',
    myInventory: 'મારો માલ',
    krishiSahayak: 'કૃષિ સહાયક',
    voiceAction: 'બોલીને કરો',
    products: 'ઉત્પાદનો',
    bulkSupply: 'જથ્થાબંધ સપ્લાય',
    marketPrices: 'બજાર ભાવ',
    logistics: 'ડિલિવરી અને રૂટ',
    farmerDashboard: 'ખેડૂત ડેશબોર્ડ',
    buyerDashboard: 'ગ્રાહક ડેશબોર્ડ',
    adminDashboard: 'એડમિન ડેશબોર્ડ',
    selectLocation: 'સ્થળ પસંદ કરો',
    changeLocation: 'સ્થળ બદલો'
  },
  kn: {
    appName: 'ಕೃಷಿ ಬಜಾರ್',
    tagline: 'ರೈತರಿಂದ ನೇರ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ',
    myCrops: 'ನನ್ನ ಬೆಳೆ',
    sellCrop: 'ಬೆಳೆ ಮಾರಿ',
    todayPrice: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ',
    myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
    myInventory: 'ನನ್ನ ದಾಸ್ತಾನು',
    krishiSahayak: 'ಕೃಷಿ ಸಹಾಯಕ',
    voiceAction: 'ಮಾತನಾಡಿ ಮಾಡಿ',
    products: 'ಉತ್ಪನ್ನಗಳು',
    bulkSupply: 'ಸಗಟು ಪೂರೈಕೆ',
    marketPrices: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    logistics: 'ಡೆಲಿವರಿ ಮತ್ತು ಮಾರ್ಗ',
    farmerDashboard: 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    buyerDashboard: 'ಖರೀದಿದಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    adminDashboard: 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    selectLocation: 'ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ',
    changeLocation: 'ಸ್ಥಳ ಬದಲಾಯಿಸಿ'
  },
  ml: {
    appName: 'കൃഷി ബസാർ',
    tagline: 'കർഷകരിൽ നിന്ന് നേരിട്ട് വിപണി പ്ലാറ്റ്‌ഫോം',
    myCrops: 'എന്റെ വിള',
    sellCrop: 'വിള വിൽക്കുക',
    todayPrice: 'ഇന്നത്തെ മാർക്കറ്റ് നിരക്ക്',
    myOrders: 'എന്റെ ഓർഡറുകൾ',
    myInventory: 'എന്റെ ചരക്ക്',
    krishiSahayak: 'കൃഷി സഹായി',
    voiceAction: 'സംസാരിച്ചു ചെയ്യുക',
    products: 'ഉൽപ്പന്നങ്ങൾ',
    bulkSupply: 'മൊത്ത വിതരണം',
    marketPrices: 'വിപണി നിരക്കുകൾ',
    logistics: 'ഡെലിവറിയും റൂട്ടും',
    farmerDashboard: 'കർഷക ഡാഷ്‌ബോർഡ്',
    buyerDashboard: 'വാങ്ങുന്നയാളുടെ ഡാഷ്‌ബോർഡ്',
    adminDashboard: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
    selectLocation: 'സ്ഥലം തിരഞ്ഞെടുക്കുക',
    changeLocation: 'സ്ഥലം മാറ്റുക'
  }
};

const STORAGE_LANG_KEY = 'kb_active_language';

class I18nService {
  constructor() {
    this.currentLanguage = this.loadLanguage();
    this.listeners = new Set();
  }

  loadLanguage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_LANG_KEY);
        if (stored) return stored;
      }
    } catch (e) {
      // Ignore
    }
    return 'hi'; // Default friendly farmer language: Hindi
  }

  setLanguage(langCode) {
    const valid = SUPPORTED_LANGUAGES.some(l => l.code === langCode);
    this.currentLanguage = valid ? langCode : 'hi';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_LANG_KEY, this.currentLanguage);
      }
    } catch (e) {
      // Ignore
    }
    this.notify();
  }

  getLanguage() {
    return this.currentLanguage;
  }

  getLanguageMeta(langCode = null) {
    const code = langCode || this.currentLanguage;
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
  }

  getSpeechRecognitionLang() {
    const meta = this.getLanguageMeta();
    return meta.speechCode || 'hi-IN';
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentLanguage);
      } catch (e) {
        console.error('I18nService notification error:', e);
      }
    }
  }

  /**
   * Translate a key with automatic fallback to Hindi and then English
   */
  t(key, lang = null) {
    const targetLang = lang || this.currentLanguage;
    const currentDict = TRANSLATIONS[targetLang];
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to Hindi
    if (TRANSLATIONS['hi'] && TRANSLATIONS['hi'][key] !== undefined) {
      return TRANSLATIONS['hi'][key];
    }
    // Fallback to English
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key] !== undefined) {
      return TRANSLATIONS['en'][key];
    }
    return key;
  }
}

export const i18n = new I18nService();
