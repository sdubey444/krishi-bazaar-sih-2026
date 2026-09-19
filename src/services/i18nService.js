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
    krishiAi: 'Krishi AI',
    askKrishiAi: 'Ask Krishi AI',
    talkKrishiAi: 'Talk with Krishi AI',
    assistantFarmer: 'Krishi Sahayak',
    assistantBuyer: 'Buyer Assistant',
    assistantLogistics: 'Vehicle Assistant',
    assistantAdmin: 'Admin Assistant',
    voiceListening: 'Listening... Speak clearly',
    voiceProcessing: 'Processing query...',
    voiceActionExecuting: 'Executing action...',
    voiceCompleted: 'Completed',
    voiceFallback: 'Speech recognition is not supported in this browser. Please type below.',
    exploreMarketplace: 'Explore Marketplace',
    bulkOrder: 'Bulk Order',
    orderBulkProduce: 'Order Bulk Produce',
    products: 'Products',
    chooseLocation: 'Choose Location',
    orders: 'Orders',
    logistics: 'Logistics',
    // Farmer 7 Primary Actions
    myCrops: 'My Crops',
    sellCrop: 'Sell Crop',
    todayPrice: "Today's Mandi Rate",
    myOrders: 'My Orders',
    myInventory: 'My Inventory',
    krishiSahayak: 'Krishi AI',
    voiceAction: 'Tap & Speak',
    // Navigation
    bulkSupply: 'Bulk Supply',
    marketPrices: 'Market Prices',
    farmerDashboard: 'Farmer Dashboard',
    buyerDashboard: 'Buyer Dashboard',
    adminDashboard: 'Admin Dashboard',
    logisticsDashboard: 'Logistics Dashboard',
    switchRole: 'Switch Role',
    login: 'Log In',
    createAccount: 'Create Account',
    logout: 'Log Out',
    // Roles
    roleFarmer: 'Farmer / FPO',
    roleBuyer: 'Buyer / Consumer',
    roleLogistics: 'Logistics Partner',
    roleAdmin: 'Platform Admin',
    // Logistics Workflow & Dashboard
    logisticsPartner: 'Logistics Partner',
    overview: 'Overview',
    assignedOrders: 'Assigned Orders',
    pickup: 'Pickup',
    dispatch: 'Dispatch',
    inTransit: 'In Transit',
    delivered: 'Delivered',
    liveTracking: 'Live Tracking',
    routeInformation: 'Route Information',
    vehicleDetails: 'Vehicle Details',
    driverDetails: 'Driver Details',
    paymentStatus: 'Payment Status',
    deliveryHistory: 'Delivery History',
    reports: 'Reports',
    profile: 'Profile',
    acceptAssignment: 'Accept Assignment',
    confirmPickup: 'Confirm Pickup',
    markPickedUp: 'Mark Picked Up',
    markDispatched: 'Mark Dispatched',
    startTransit: 'Start Transit',
    markDelivered: 'Mark Delivered',
    pickupLocation: 'Pickup Location',
    destination: 'Destination',
    currentStatus: 'Current Status',
    simulatedTrackingDemo: 'Simulated Tracking — Demo',
    demoRoute: 'Demo Route',
    simulatedRoute: 'Simulated Route',
    prototypeData: 'Prototype Data',
    driverId: 'Driver ID',
    driverName: 'Driver Name',
    driverContact: 'Driver Contact',
    assignedVehicle: 'Assigned Vehicle',
    vehicleNumber: 'Vehicle Number',
    vehicleType: 'Vehicle Type',
    vehicleStatus: 'Vehicle Status',
    insuranceStatus: 'Insurance Status',
    permitStatus: 'Permit Status',
    estimatedArrival: 'Estimated Arrival',
    distanceRemaining: 'Distance Remaining',
    totalDistance: 'Total Distance',
    paymentPending: 'Payment Pending',
    paymentConfirmed: 'Payment Confirmed',
    cod: 'COD (Cash on Delivery)',
    paymentCompleted: 'Payment Completed',
    freightEarnings: 'Freight Earnings (90%)',
    orderId: 'Order ID',
    farmerSeller: 'Farmer / Seller',
    buyerBusiness: 'Buyer / Business',
    product: 'Product',
    assignedDate: 'Assigned Date',
    // Voice AI States
    listening: 'Listening...',
    understanding: 'Understanding...',
    executing: 'Executing action...',
    completed: 'Completed',
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
    appName: 'Krishi Bazaar / कृषि बाज़ार',
    tagline: 'सीधा किसान से बाज़ार मंच',
    krishiAi: 'कृषि AI',
    askKrishiAi: 'Krishi AI से पूछें',
    talkKrishiAi: 'Krishi AI से बात करें',
    assistantFarmer: 'कृषि सहायक',
    assistantBuyer: 'खरीदार सहायक',
    assistantLogistics: 'वाहन सहायक',
    assistantAdmin: 'व्यवस्था सहायक',
    voiceListening: 'सुन रहा हूँ... स्पष्ट बोलें',
    voiceProcessing: 'समझ रहा हूँ...',
    voiceActionExecuting: 'कार्यवाही हो रही है...',
    voiceCompleted: 'पूरा हुआ',
    voiceFallback: 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया नीचे लिखकर पूछें।',
    exploreMarketplace: 'मार्केटप्लेस देखें',
    bulkOrder: 'थोक ऑर्डर',
    orderBulkProduce: 'थोक ऑर्डर करें',
    products: 'उत्पाद',
    chooseLocation: 'स्थान चुनें',
    orders: 'ऑर्डर',
    logistics: 'लॉजिस्टिक्स',
    // Farmer 7 Primary Actions
    myCrops: 'मेरी फसल',
    sellCrop: 'फसल बेचें',
    todayPrice: 'आज का भाव',
    myOrders: 'मेरे ऑर्डर',
    myInventory: 'मेरा सामान',
    krishiSahayak: 'कृषि AI',
    voiceAction: 'बोलकर करें',
    // Navigation
    bulkSupply: 'थोक आपूर्ति',
    marketPrices: 'मंडी भाव',
    farmerDashboard: 'किसान डैशबोर्ड',
    buyerDashboard: 'खरीदार डैशबोर्ड',
    adminDashboard: 'प्रशासक डैशबोर्ड',
    logisticsDashboard: 'लॉजिस्टिक्स डैशबोर्ड',
    switchRole: 'भूमिका बदलें',
    login: 'लॉग इन करें',
    createAccount: 'खाता बनाएं',
    logout: 'लॉग आउट',
    // Roles
    roleFarmer: 'किसान / एफपीओ',
    roleBuyer: 'खरीदार / उपभोक्ता',
    roleLogistics: 'लॉजिस्टिक्स पार्टनर',
    roleAdmin: 'प्लेटफ़ॉर्म एडमिन',
    // Logistics Workflow & Dashboard
    logisticsPartner: 'लॉजिस्टिक्स पार्टनर',
    overview: 'अवलोकन',
    assignedOrders: 'असाइन किए गए ऑर्डर',
    pickup: 'पिकअप',
    dispatch: 'डिस्पैच',
    inTransit: 'रास्ते में',
    delivered: 'डिलीवर हो गया',
    liveTracking: 'लाइव ट्रैकिंग',
    routeInformation: 'मार्ग की जानकारी',
    vehicleDetails: 'वाहन विवरण',
    driverDetails: 'ड्राइवर विवरण',
    paymentStatus: 'भुगतान की स्थिति',
    deliveryHistory: 'डिलीवरी इतिहास',
    reports: 'रिपोर्ट',
    profile: 'प्रोफ़ाइल',
    acceptAssignment: 'असाइनमेंट स्वीकार करें',
    confirmPickup: 'पिकअप की पुष्टि करें',
    markPickedUp: 'पिकअप पूरा हुआ',
    markDispatched: 'डिस्पैच मार्क करें',
    startTransit: 'ट्रांजिट शुरू करें',
    markDelivered: 'डिलीवर मार्क करें',
    pickupLocation: 'पिकअप स्थान',
    destination: 'गंतव्य',
    currentStatus: 'वर्तमान स्थिति',
    simulatedTrackingDemo: 'सिम्युलेटेड ट्रैकिंग — डेमो',
    demoRoute: 'डेमो रूट',
    simulatedRoute: 'सिम्युलेटेड रूट',
    prototypeData: 'प्रोटोटाइप डेटा',
    driverId: 'ड्राइवर आईडी',
    driverName: 'ड्राइवर का नाम',
    driverContact: 'ड्राइवर संपर्क',
    assignedVehicle: 'आवंटित वाहन',
    vehicleNumber: 'वाहन संख्या',
    vehicleType: 'वाहन प्रकार',
    vehicleStatus: 'वाहन स्थिति',
    insuranceStatus: 'बीमा स्थिति',
    permitStatus: 'परमिट स्थिति',
    estimatedArrival: 'अनुमानित आगमन',
    distanceRemaining: 'शेष दूरी',
    totalDistance: 'कुल दूरी',
    paymentPending: 'भुगतान लंबित',
    paymentConfirmed: 'भुगतान पुष्ट',
    cod: 'सीओडी (डिलीवरी पर नकद)',
    paymentCompleted: 'भुगतान पूर्ण',
    freightEarnings: 'माल ढुलाई कमाई (90%)',
    orderId: 'ऑर्डर आईडी',
    farmerSeller: 'किसान / विक्रेता',
    buyerBusiness: 'खरीदार / व्यापार',
    product: 'उत्पाद',
    assignedDate: 'असाइन की गई तारीख',
    // Voice AI States
    listening: 'सुन रहा हूँ...',
    understanding: 'समझ रहा हूँ...',
    executing: 'कर रहा हूँ...',
    completed: 'पूरा हुआ',
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
