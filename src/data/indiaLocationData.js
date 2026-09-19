// Comprehensive Indian States, Union Territories, Agricultural Districts, and Mandi Hubs
// Real geographic coordinates across North, South, East, West, Central, and North-East India

export const INDIA_STATES_AND_UTS = [
  { code: 'UP', name: 'Uttar Pradesh', type: 'State' },
  { code: 'PB', name: 'Punjab', type: 'State' },
  { code: 'HR', name: 'Haryana', type: 'State' },
  { code: 'MH', name: 'Maharashtra', type: 'State' },
  { code: 'TN', name: 'Tamil Nadu', type: 'State' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'State' },
  { code: 'DL', name: 'Delhi', type: 'Union Territory' },
  { code: 'RJ', name: 'Rajasthan', type: 'State' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'State' },
  { code: 'GJ', name: 'Gujarat', type: 'State' },
  { code: 'KA', name: 'Karnataka', type: 'State' },
  { code: 'KL', name: 'Kerala', type: 'State' },
  { code: 'WB', name: 'West Bengal', type: 'State' },
  { code: 'BR', name: 'Bihar', type: 'State' },
  { code: 'AP', name: 'Andhra Pradesh', type: 'State' },
  { code: 'TG', name: 'Telangana', type: 'State' },
  { code: 'OR', name: 'Odisha', type: 'State' },
  { code: 'AS', name: 'Assam', type: 'State' },
  { code: 'JK', name: 'Jammu & Kashmir', type: 'Union Territory' },
  { code: 'UK', name: 'Uttarakhand', type: 'State' },
  { code: 'CG', name: 'Chhattisgarh', type: 'State' },
  { code: 'JH', name: 'Jharkhand', type: 'State' },
  { code: 'GA', name: 'Goa', type: 'State' },
  { code: 'TR', name: 'Tripura', type: 'State' },
  { code: 'ML', name: 'Meghalaya', type: 'State' },
  { code: 'MN', name: 'Manipur', type: 'State' },
  { code: 'NL', name: 'Nagaland', type: 'State' },
  { code: 'MZ', name: 'Mizoram', type: 'State' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'State' },
  { code: 'SK', name: 'Sikkim', type: 'State' },
  { code: 'CH', name: 'Chandigarh', type: 'Union Territory' },
  { code: 'PY', name: 'Puducherry', type: 'Union Territory' },
  { code: 'LA', name: 'Ladakh', type: 'Union Territory' },
  { code: 'AN', name: 'Andaman & Nicobar Islands', type: 'Union Territory' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory' },
  { code: 'LD', name: 'Lakshadweep', type: 'Union Territory' }
];

export const INDIA_AGRICULTURAL_HUBS = {
  'Uttar Pradesh': {
    districts: [
      {
        name: 'Prayagraj',
        lat: 25.4358,
        lng: 81.8463,
        primaryMandis: ['Mundera Mandi', 'Naini APMC', 'Soraon Sub-Market'],
        majorCrops: ['wheat', 'rice', 'mustard', 'potato', 'chickpea', 'tomato']
      },
      {
        name: 'Kanpur',
        lat: 26.4499,
        lng: 80.3319,
        primaryMandis: ['Chakeri Grain Market', 'Naubasta APMC'],
        majorCrops: ['wheat', 'rice', 'mustard', 'pulses', 'potato']
      },
      {
        name: 'Lucknow',
        lat: 26.8467,
        lng: 80.9462,
        primaryMandis: ['Dubagga Fruit & Veg Market', 'Sitapur Road Grain Mandi'],
        majorCrops: ['wheat', 'rice', 'mango', 'vegetables', 'mustard']
      },
      {
        name: 'Varanasi',
        lat: 25.3176,
        lng: 82.9739,
        primaryMandis: ['Panchkoshi APMC', 'Rohania Veg Market'],
        majorCrops: ['rice', 'wheat', 'vegetables', 'tomato']
      },
      {
        name: 'Agra',
        lat: 27.1767,
        lng: 78.0081,
        primaryMandis: ['Agra Cantt APMC', 'Fatehabad Potato Hub'],
        majorCrops: ['potato', 'mustard', 'wheat', 'bajra']
      },
      {
        name: 'Bareilly',
        lat: 28.3670,
        lng: 79.4304,
        primaryMandis: ['Delapeer APMC Mandi'],
        majorCrops: ['rice', 'sugarcane', 'wheat', 'mustard']
      }
    ]
  },
  'Punjab': {
    districts: [
      {
        name: 'Ludhiana',
        lat: 30.9010,
        lng: 75.8573,
        primaryMandis: ['Gill Road Grain Mandi', 'Khanna Asia Largest Mandi', 'Samrala APMC'],
        majorCrops: ['wheat', 'rice', 'maize', 'potato']
      },
      {
        name: 'Amritsar',
        lat: 31.6340,
        lng: 74.8723,
        primaryMandis: ['Bhagtanwala Grain Market', 'Rayya Mandi'],
        majorCrops: ['wheat', 'rice', 'mustard', 'vegetables']
      },
      {
        name: 'Jalandhar',
        lat: 31.3260,
        lng: 75.5762,
        primaryMandis: ['Maqsudan Veg & Potato Market', 'Nakodar APMC'],
        majorCrops: ['potato', 'wheat', 'maize', 'rice']
      },
      {
        name: 'Bathinda',
        lat: 30.2110,
        lng: 74.9455,
        primaryMandis: ['Bathinda Main Grain Mandi', 'Rampura Phul APMC'],
        majorCrops: ['cotton', 'wheat', 'mustard']
      }
    ]
  },
  'Haryana': {
    districts: [
      {
        name: 'Karnal',
        lat: 29.6857,
        lng: 76.9905,
        primaryMandis: ['Karnal New Grain Market', 'Taraori Basmati Hub'],
        majorCrops: ['rice', 'wheat', 'mustard', 'sugarcane']
      },
      {
        name: 'Hisar',
        lat: 29.1492,
        lng: 75.7217,
        primaryMandis: ['Hisar Anaj Mandi', 'Hansi APMC'],
        majorCrops: ['cotton', 'mustard', 'wheat', 'gram']
      },
      {
        name: 'Ambala',
        lat: 30.3782,
        lng: 76.7767,
        primaryMandis: ['Ambala City Grain Market'],
        majorCrops: ['wheat', 'rice', 'maize']
      }
    ]
  },
  'Maharashtra': {
    districts: [
      {
        name: 'Nashik',
        lat: 19.9975,
        lng: 73.7898,
        primaryMandis: ['Lasalgaon Onion Mandi (Asia Largest)', 'Pimpalgaon Onion Market', 'Nashik APMC'],
        majorCrops: ['onion', 'grapes', 'tomato', 'soybean', 'maize']
      },
      {
        name: 'Pune',
        lat: 18.5204,
        lng: 73.8567,
        primaryMandis: ['Gultekdi Market Yard', 'Junnar Tomato Market', 'Manchar APMC'],
        majorCrops: ['onion', 'tomato', 'soybean', 'sugarcane', 'vegetables']
      },
      {
        name: 'Nagpur',
        lat: 21.1458,
        lng: 79.0882,
        primaryMandis: ['Kalamna APMC', 'Cotton Market Nagpur'],
        majorCrops: ['orange', 'cotton', 'soybean', 'chickpea']
      },
      {
        name: 'Jalgaon',
        lat: 21.0077,
        lng: 75.5626,
        primaryMandis: ['Jalgaon Banana & Cotton Mandi'],
        majorCrops: ['banana', 'cotton', 'soybean', 'maize']
      },
      {
        name: 'Solapur',
        lat: 17.6599,
        lng: 75.9064,
        primaryMandis: ['Solapur Onion & Pomegranate Market'],
        majorCrops: ['onion', 'pomegranate', 'chickpea', 'groundnut']
      }
    ]
  },
  'Tamil Nadu': {
    districts: [
      {
        name: 'Coimbatore',
        lat: 11.0168,
        lng: 76.9558,
        primaryMandis: ['Ukkadam Regulated Market', 'Mettupalayam Veg Hub', 'Pollachi Coconut APMC'],
        majorCrops: ['coconut', 'banana', 'tomato', 'onion', 'groundnut']
      },
      {
        name: 'Madurai',
        lat: 9.9252,
        lng: 78.1198,
        primaryMandis: ['Mattuthavani Central Market', 'Paravai APMC'],
        majorCrops: ['rice', 'pulses', 'cotton', 'vegetables']
      },
      {
        name: 'Salem',
        lat: 11.6643,
        lng: 78.1460,
        primaryMandis: ['Shevapet Regulated Market', 'Salem Mango Hub'],
        majorCrops: ['mango', 'tapioca', 'tomato', 'groundnut']
      },
      {
        name: 'Chennai',
        lat: 13.0827,
        lng: 80.2707,
        primaryMandis: ['Koyambedu Wholesale Market Complex', 'Madhavaram APMC'],
        majorCrops: ['vegetables', 'fruits', 'onion', 'tomato', 'potato']
      },
      {
        name: 'Thanjavur',
        lat: 10.7870,
        lng: 79.1378,
        primaryMandis: ['Thanjavur Paddy Regulated Market'],
        majorCrops: ['rice', 'pulses', 'banana', 'sugarcane']
      }
    ]
  },
  'Himachal Pradesh': {
    districts: [
      {
        name: 'Shimla',
        lat: 31.1048,
        lng: 77.1734,
        primaryMandis: ['Dhali Fruit & Apple APMC', 'Parwanoo Terminal Market'],
        majorCrops: ['apple', 'potato', 'tomato', 'garlic', 'capsicum']
      },
      {
        name: 'Kullu',
        lat: 31.9579,
        lng: 77.1095,
        primaryMandis: ['Bhuntar APMC', 'Kullu Apple Market'],
        majorCrops: ['apple', 'plum', 'pomegranate', 'vegetables']
      },
      {
        name: 'Mandi',
        lat: 31.7082,
        lng: 76.9320,
        primaryMandis: ['Mandi APMC', 'Sundernagar Market'],
        majorCrops: ['maize', 'wheat', 'ginger', 'tomato']
      },
      {
        name: 'Solan',
        lat: 30.9084,
        lng: 77.0999,
        primaryMandis: ['Solan Mushroom & Tomato APMC'],
        majorCrops: ['tomato', 'mushroom', 'capsicum', 'ginger']
      }
    ]
  },
  'Delhi': {
    districts: [
      {
        name: 'North Delhi',
        lat: 28.7041,
        lng: 77.1025,
        primaryMandis: ['Azadpur APMC (Asia Largest Veg/Fruit Terminal)', 'Narela Grain Mandi'],
        majorCrops: ['wheat', 'vegetables', 'onion', 'potato', 'tomato', 'fruits']
      },
      {
        name: 'East Delhi',
        lat: 28.6280,
        lng: 77.3000,
        primaryMandis: ['Ghazipur Fruit, Flower & Poultry Market'],
        majorCrops: ['vegetables', 'fruits', 'flowers']
      },
      {
        name: 'South Delhi',
        lat: 28.5355,
        lng: 77.2090,
        primaryMandis: ['Okhla APMC Vegetable Market'],
        majorCrops: ['vegetables', 'fruits']
      }
    ]
  },
  'Rajasthan': {
    districts: [
      {
        name: 'Jaipur',
        lat: 26.9124,
        lng: 75.7873,
        primaryMandis: ['Muhana Mandi (Largest Veg/Fruit in RJ)', 'Kukas APMC'],
        majorCrops: ['mustard', 'wheat', 'gram', 'onion', 'bajra']
      },
      {
        name: 'Kota',
        lat: 25.2138,
        lng: 75.8648,
        primaryMandis: ['Bhamashah Krishi Upaj Mandi (Soybean & Mustard Hub)'],
        majorCrops: ['soybean', 'mustard', 'wheat', 'coriander', 'garlic']
      },
      {
        name: 'Jodhpur',
        lat: 26.2389,
        lng: 73.0243,
        primaryMandis: ['Jodhpur Krishi Upaj Mandi', 'Bhagat Ki Kothi APMC'],
        majorCrops: ['cumin', 'isabgol', 'mustard', 'bajra', 'guar']
      },
      {
        name: 'Sri Ganganagar',
        lat: 29.9094,
        lng: 73.8799,
        primaryMandis: ['Ganganagar Grain & Cotton Mandi'],
        majorCrops: ['wheat', 'cotton', 'mustard', 'kinnow']
      }
    ]
  },
  'Madhya Pradesh': {
    districts: [
      {
        name: 'Indore',
        lat: 22.7196,
        lng: 75.8577,
        primaryMandis: ['Chhavani Grain Mandi', 'Choithram Veg Terminal'],
        majorCrops: ['soybean', 'wheat', 'potato', 'onion', 'garlic']
      },
      {
        name: 'Ujjain',
        lat: 23.1765,
        lng: 75.7885,
        primaryMandis: ['Chimanganj Krishi Upaj Mandi'],
        majorCrops: ['soybean', 'wheat', 'gram', 'garlic']
      },
      {
        name: 'Bhopal',
        lat: 23.2599,
        lng: 77.4126,
        primaryMandis: ['Karond APMC Mandi'],
        majorCrops: ['wheat', 'soybean', 'lentil', 'chickpea']
      },
      {
        name: 'Mandsaur',
        lat: 24.0722,
        lng: 75.0684,
        primaryMandis: ['Mandsaur Garlic & Spices APMC'],
        majorCrops: ['garlic', 'soybean', 'coriander', 'mustard']
      }
    ]
  },
  'Gujarat': {
    districts: [
      {
        name: 'Rajkot',
        lat: 22.3039,
        lng: 70.8022,
        primaryMandis: ['Bedi Market Yard Rajkot', 'Gondal APMC (Chilli & Groundnut Hub)'],
        majorCrops: ['groundnut', 'cotton', 'cumin', 'chilli', 'wheat']
      },
      {
        name: 'Surat',
        lat: 21.1702,
        lng: 72.8311,
        primaryMandis: ['Surat Sardar Market APMC'],
        majorCrops: ['sugarcane', 'rice', 'banana', 'vegetables']
      },
      {
        name: 'Ahmedabad',
        lat: 23.0225,
        lng: 72.5714,
        primaryMandis: ['Jamalpur APMC', 'Vasna Veg Market'],
        majorCrops: ['cotton', 'wheat', 'castor', 'vegetables']
      },
      {
        name: 'Mehsana',
        lat: 23.5880,
        lng: 72.3693,
        primaryMandis: ['Unjha APMC (World Largest Cumin & Fennel Hub)'],
        majorCrops: ['cumin', 'fennel', 'mustard', 'castor']
      }
    ]
  },
  'Karnataka': {
    districts: [
      {
        name: 'Bengaluru Urban',
        lat: 12.9716,
        lng: 77.5946,
        primaryMandis: ['Yeshwanthpur APMC', 'Binny Mills Grain Market', 'KR Market'],
        majorCrops: ['ragi', 'tomato', 'potato', 'onion', 'maize', 'fruits']
      },
      {
        name: 'Mysuru',
        lat: 12.2958,
        lng: 76.6394,
        primaryMandis: ['Bandipalya APMC Yard Mysuru'],
        majorCrops: ['rice', 'ragi', 'sugarcane', 'banana']
      },
      {
        name: 'Hubballi',
        lat: 15.3647,
        lng: 75.1240,
        primaryMandis: ['Amaragol APMC Yard (North Karnataka Hub)'],
        majorCrops: ['cotton', 'onion', 'chilli', 'groundnut', 'maize']
      },
      {
        name: 'Kolar',
        lat: 13.1367,
        lng: 78.1291,
        primaryMandis: ['Kolar Tomato Market (Asia 2nd Largest Tomato Mandi)'],
        majorCrops: ['tomato', 'potato', 'mango', 'vegetables']
      }
    ]
  },
  'Kerala': {
    districts: [
      {
        name: 'Ernakulam',
        lat: 9.9816,
        lng: 76.2999,
        primaryMandis: ['Maradu Wholesale Market', 'Aluva Regulated Market'],
        majorCrops: ['coconut', 'rubber', 'banana', 'pepper', 'spices']
      },
      {
        name: 'Kozhikode',
        lat: 11.2588,
        lng: 75.7804,
        primaryMandis: ['Palayam Market Kozhikode'],
        majorCrops: ['coconut', 'pepper', 'ginger', 'banana']
      },
      {
        name: 'Wayanad',
        lat: 11.6854,
        lng: 76.1320,
        primaryMandis: ['Kalpetta Spices Regulated Market'],
        majorCrops: ['coffee', 'tea', 'pepper', 'cardamom', 'ginger']
      },
      {
        name: 'Palakkad',
        lat: 10.7867,
        lng: 76.6548,
        primaryMandis: ['Palakkad Paddy Granary APMC'],
        majorCrops: ['rice', 'groundnut', 'sugarcane', 'vegetables']
      }
    ]
  },
  'West Bengal': {
    districts: [
      {
        name: 'Kolkata',
        lat: 22.5726,
        lng: 88.3639,
        primaryMandis: ['Posta Bazar Wholesale Grain Market', 'Koley Market Veg Hub'],
        majorCrops: ['rice', 'potato', 'jute', 'vegetables', 'mustard']
      },
      {
        name: 'Hooghly',
        lat: 22.9034,
        lng: 88.3899,
        primaryMandis: ['Sheoraphuli Regulated Market', 'Arambagh Potato Hub'],
        majorCrops: ['potato', 'rice', 'jute', 'vegetables']
      },
      {
        name: 'Burdwan',
        lat: 23.2324,
        lng: 87.8615,
        primaryMandis: ['Burdwan Rice Granary APMC'],
        majorCrops: ['rice', 'potato', 'mustard']
      },
      {
        name: 'Siliguri',
        lat: 26.7271,
        lng: 88.3953,
        primaryMandis: ['Siliguri Regulated Market (North Bengal Hub)'],
        majorCrops: ['tea', 'pineapple', 'ginger', 'rice', 'maize']
      }
    ]
  },
  'Bihar': {
    districts: [
      {
        name: 'Patna',
        lat: 25.5941,
        lng: 85.1376,
        primaryMandis: ['Bazar Samiti Bazar Musallahpur', 'Danapur APMC'],
        majorCrops: ['rice', 'wheat', 'maize', 'potato', 'pulses']
      },
      {
        name: 'Muzaffarpur',
        lat: 26.1209,
        lng: 85.3647,
        primaryMandis: ['Bazar Samiti Muzaffarpur (Shahi Litchi Hub)'],
        majorCrops: ['litchi', 'maize', 'rice', 'wheat', 'tobacco']
      },
      {
        name: 'Begusarai',
        lat: 25.4182,
        lng: 86.1272,
        primaryMandis: ['Barauni Grain Market'],
        majorCrops: ['maize', 'wheat', 'mustard', 'pulses']
      }
    ]
  },
  'Andhra Pradesh': {
    districts: [
      {
        name: 'Guntur',
        lat: 16.3067,
        lng: 80.4365,
        primaryMandis: ['Guntur Mirchi Yard (Asia Largest Chilli Market)'],
        majorCrops: ['chilli', 'cotton', 'tobacco', 'rice', 'turmeric']
      },
      {
        name: 'Kurnool',
        lat: 15.8281,
        lng: 78.0373,
        primaryMandis: ['Kurnool Onion & Groundnut APMC'],
        majorCrops: ['onion', 'groundnut', 'cotton', 'chickpea']
      },
      {
        name: 'Vijayawada',
        lat: 16.5062,
        lng: 80.6480,
        primaryMandis: ['Gollapudi Wholesale Market Yard'],
        majorCrops: ['rice', 'cotton', 'mango', 'banana']
      }
    ]
  },
  'Telangana': {
    districts: [
      {
        name: 'Warangal',
        lat: 17.9689,
        lng: 79.5941,
        primaryMandis: ['Enumamula Agriculture Market Yard (Largest in South India)'],
        majorCrops: ['cotton', 'chilli', 'turmeric', 'maize', 'rice']
      },
      {
        name: 'Nizamabad',
        lat: 18.6725,
        lng: 78.0941,
        primaryMandis: ['Nizamabad Turmeric & Grain Market Yard'],
        majorCrops: ['turmeric', 'rice', 'soybean', 'maize']
      },
      {
        name: 'Hyderabad',
        lat: 17.3850,
        lng: 78.4867,
        primaryMandis: ['Bowenpally Veg APMC', 'Malakpet Onion Mandi'],
        majorCrops: ['vegetables', 'onion', 'fruits', 'rice']
      }
    ]
  },
  'Odisha': {
    districts: [
      {
        name: 'Cuttack',
        lat: 20.4625,
        lng: 85.8828,
        primaryMandis: ['Malgodown Wholesale Market', 'Chhatra Bazar APMC'],
        majorCrops: ['rice', 'pulses', 'vegetables', 'jute']
      },
      {
        name: 'Bhubaneswar',
        lat: 20.2961,
        lng: 85.8245,
        primaryMandis: ['Aiginia Fruit & Veg Wholesale Market'],
        majorCrops: ['rice', 'vegetables', 'coconut']
      }
    ]
  },
  'Assam': {
    districts: [
      {
        name: 'Kamrup (Guwahati)',
        lat: 26.1445,
        lng: 91.7362,
        primaryMandis: ['Fancy Bazar Wholesale Market', 'Pamohi APMC Market Yard'],
        majorCrops: ['rice', 'tea', 'jute', 'mustard', 'ginger', 'banana']
      },
      {
        name: 'Jorhat',
        lat: 26.7509,
        lng: 94.2037,
        primaryMandis: ['Jorhat Tea & Produce Market'],
        majorCrops: ['tea', 'rice', 'mustard', 'black pepper']
      }
    ]
  },
  'Jammu & Kashmir': {
    districts: [
      {
        name: 'Srinagar',
        lat: 34.0837,
        lng: 74.7973,
        primaryMandis: ['Parimpora Fruit & Apple Mandi'],
        majorCrops: ['apple', 'walnut', 'saffron', 'almond', 'cherry']
      },
      {
        name: 'Jammu',
        lat: 32.7266,
        lng: 74.8570,
        primaryMandis: ['Narwal Fruit & Grain Mandi'],
        majorCrops: ['basmati rice', 'wheat', 'mustard', 'maize']
      },
      {
        name: 'Shopian',
        lat: 33.7200,
        lng: 74.8300,
        primaryMandis: ['Shopian Apple Capital Terminal Market'],
        majorCrops: ['apple', 'walnut', 'pear']
      }
    ]
  },
  'Uttarakhand': {
    districts: [
      {
        name: 'Dehradun',
        lat: 30.3165,
        lng: 78.0322,
        primaryMandis: ['Niranjanpur Mandi Dehradun'],
        majorCrops: ['basmati rice', 'litchi', 'wheat', 'sugarcane']
      },
      {
        name: 'Udham Singh Nagar',
        lat: 28.9800,
        lng: 79.4000,
        primaryMandis: ['Kashipur APMC', 'Rudrapur Mandi'],
        majorCrops: ['rice', 'wheat', 'sugarcane', 'mustard']
      }
    ]
  }
};
