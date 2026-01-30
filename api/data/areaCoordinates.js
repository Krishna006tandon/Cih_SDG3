// Area/locality coordinates for major Indian cities
// Used for area-first AQI data fetching with fallback to city-level data
export const areaCoordinates = {
  // Delhi NCR Areas
  Delhi: {
    "Connaught Place": { lat: 28.6343, lng: 77.2189 },
    "South Extension": { lat: 28.5698, lng: 77.2247 },
    "Karol Bagh": { lat: 28.6517, lng: 77.1930 },
    "Rajouri Garden": { lat: 28.6462, lng: 77.1176 },
    "Dwarka": { lat: 28.5920, lng: 77.0454 },
    "Greater Kailash": { lat: 28.5542, lng: 77.2347 },
    "Lajpat Nagar": { lat: 28.5675, lng: 77.2433 },
    "Defence Colony": { lat: 28.5929, lng: 77.2326 },
    "East of Kailash": { lat: 28.5582, lng: 77.2569 },
    "Green Park": { lat: 28.5562, lng: 77.2069 },
    "Hauz Khas": { lat: 28.5495, lng: 77.1920 },
    "Jangpura": { lat: 28.5958, lng: 77.2458 },
    "Kalkaji": { lat: 28.5456, lng: 77.2728 },
    "Nehru Place": { lat: 28.5523, lng: 77.2567 },
    "Okhla": { lat: 28.5526, lng: 77.2847 },
    "Punjabi Bagh": { lat: 28.6685, lng: 77.1345 },
    "R.K. Puram": { lat: 28.5526, lng: 77.1833 },
    "Safdarjung Enclave": { lat: 28.5642, lng: 77.1989 },
    "Saket": { lat: 28.5274, lng: 77.2197 },
    "Shahdara": { lat: 28.6801, lng: 77.3010 },
    "Vasant Vihar": { lat: 28.5691, lng: 77.1570 },
    "Janakpuri": { lat: 28.6198, lng: 77.0880 },
    "Uttam Nagar": { lat: 28.6172, lng: 77.0633 },
    "Paschim Vihar": { lat: 28.6685, lng: 77.1069 },
    "Patel Nagar": { lat: 28.6467, lng: 77.1533 },
    "Model Town": { lat: 28.7086, lng: 77.1900 },
    "Civil Lines": { lat: 28.6797, lng: 77.2263 },
    "Kingsway Camp": { lat: 28.6975, lng: 77.2092 },
    "Mukherjee Nagar": { lat: 28.7041, lng: 77.2069 },
    "Timarpur": { lat: 28.6947, lng: 77.2169 }
  },
  
  // Mumbai Areas
  Mumbai: {
    "Andheri East": { lat: 19.1136, lng: 72.8674 },
    "Andheri West": { lat: 19.1208, lng: 72.8489 },
    "Bandra": { lat: 19.0596, lng: 72.8305 },
    "Bandra Kurla Complex": { lat: 19.0698, lng: 72.8656 },
    "Borivali East": { lat: 19.2299, lng: 72.8530 },
    "Borivali West": { lat: 19.2303, lng: 72.8444 },
    "Byculla": { lat: 18.9777, lng: 72.8328 },
    "Chembur": { lat: 19.0497, lng: 72.8845 },
    "Colaba": { lat: 18.9144, lng: 72.8258 },
    "Dadar": { lat: 19.0181, lng: 72.8442 },
    "Ghatkopar East": { lat: 19.0884, lng: 72.9127 },
    "Ghatkopar West": { lat: 19.0917, lng: 72.9042 },
    "Juhu": { lat: 19.1076, lng: 72.8259 },
    "Kandivali East": { lat: 19.1994, lng: 72.8592 },
    "Kandivali West": { lat: 19.2021, lng: 72.8428 },
    "Khar West": { lat: 19.0650, lng: 72.8333 },
    "Malad East": { lat: 19.1860, lng: 72.8528 },
    "Malad West": { lat: 19.1860, lng: 72.8367 },
    "Marine Lines": { lat: 18.9437, lng: 72.8228 },
    "Matunga": { lat: 19.0273, lng: 72.8572 },
    "Mulund East": { lat: 19.1793, lng: 72.9444 },
    "Mulund West": { lat: 19.1753, lng: 72.9319 },
    "Nariman Point": { lat: 18.9264, lng: 72.8287 },
    "Powai": { lat: 19.1184, lng: 72.9077 },
    "Santacruz East": { lat: 19.0825, lng: 72.8550 },
    "Santacruz West": { lat: 19.0977, lng: 72.8367 },
    "Sion": { lat: 19.0444, lng: 72.8628 },
    "Tardeo": { lat: 18.9639, lng: 72.8169 },
    "Versova": { lat: 19.1310, lng: 72.8236 },
    "Worli": { lat: 18.9956, lng: 72.8181 }
  },
  
  // Bangalore Areas
  Bengaluru: {
    "Electronic City": { lat: 12.8391, lng: 77.6774 },
    "Whitefield": { lat: 12.9739, lng: 77.7266 },
    "Koramangala": { lat: 12.9352, lng: 77.6245 },
    "Indiranagar": { lat: 12.9719, lng: 77.6412 },
    "HSR Layout": { lat: 12.9139, lng: 77.6389 },
    "Jayanagar": { lat: 12.9250, lng: 77.5938 },
    "Bannerghatta Road": { lat: 12.8500, lng: 77.5725 },
    "Marathahalli": { lat: 12.9504, lng: 77.7036 },
    "BTM Layout": { lat: 12.9166, lng: 77.6104 },
    "Frazer Town": { lat: 12.9955, lng: 77.6171 },
    "Richmond Town": { lat: 12.9667, lng: 77.5983 },
    "Malleshwaram": { lat: 13.0092, lng: 77.5669 },
    "Basavanagudi": { lat: 12.9366, lng: 77.5712 },
    "Peenya": { lat: 13.0300, lng: 77.5150 },
    "Yeshwantpur": { lat: 13.0289, lng: 77.5400 },
    "Hebbal": { lat: 13.0339, lng: 77.5900 },
    "Sadashivanagar": { lat: 13.0078, lng: 77.5778 },
    "Sanjay Nagar": { lat: 13.0250, lng: 77.5750 },
    "Rajajinagar": { lat: 12.9985, lng: 77.5490 },
    "Vijayanagar": { lat: 12.9639, lng: 77.5414 },
    "Banashankari": { lat: 12.9279, lng: 77.5592 },
    "JP Nagar": { lat: 12.9044, lng: 77.5857 },
    "Wilson Garden": { lat: 12.9500, lng: 77.5900 },
    "Ashok Nagar": { lat: 12.9750, lng: 77.5950 },
    "Ulsoor": { lat: 12.9750, lng: 77.6150 },
    "HAL Airport Road": { lat: 12.9500, lng: 77.6650 },
    "Domlur": { lat: 12.9583, lng: 77.6400 },
    "Kasturi Nagar": { lat: 12.9950, lng: 77.6550 },
    "CV Raman Nagar": { lat: 12.9750, lng: 77.6750 },
    "KR Puram": { lat: 13.0000, lng: 77.7000 }
  },
  
  // Hyderabad Areas
  Hyderabad: {
    "HITEC City": { lat: 17.4460, lng: 78.3730 },
    "Gachibowli": { lat: 17.4401, lng: 78.3530 },
    "Banjara Hills": { lat: 17.4156, lng: 78.4370 },
    "Jubilee Hills": { lat: 17.4250, lng: 78.4050 },
    "Kondapur": { lat: 17.4650, lng: 78.3650 },
    "Madhapur": { lat: 17.4500, lng: 78.3800 },
    "Ameerpet": { lat: 17.4350, lng: 78.4450 },
    "Secunderabad": { lat: 17.4399, lng: 78.5000 },
    "Kukatpally": { lat: 17.4850, lng: 78.4150 },
    "Miyapur": { lat: 17.4950, lng: 78.3650 },
    "Kothaguda": { lat: 17.4200, lng: 78.3850 },
    "Film Nagar": { lat: 17.4100, lng: 78.4150 },
    "Manikonda": { lat: 17.3950, lng: 78.3750 },
    "Lingampally": { lat: 17.3800, lng: 78.3300 },
    "Banjara Hills Road No 1": { lat: 17.4100, lng: 78.4400 },
    "Road No 2 Banjara Hills": { lat: 17.4150, lng: 78.4450 },
    "Road No 3 Banjara Hills": { lat: 17.4200, lng: 78.4500 },
    "Somajiguda": { lat: 17.4250, lng: 78.4600 },
    "Erragadda": { lat: 17.4400, lng: 78.4700 },
    "Balanagar": { lat: 17.4900, lng: 78.4800 },
    "Moosapet": { lat: 17.4750, lng: 78.4300 },
    "Bharat Nagar": { lat: 17.4600, lng: 78.4400 },
    "S.R.Nagar": { lat: 17.3800, lng: 78.4400 },
    "Panjagutta": { lat: 17.4300, lng: 78.4500 },
    "Khairatabad": { lat: 17.4050, lng: 78.4650 },
    "Attapur": { lat: 17.3650, lng: 78.4250 },
    "Charminar": { lat: 17.3616, lng: 78.4747 },
    "Golconda": { lat: 17.3833, lng: 78.3967 },
    "Falaknuma": { lat: 17.3400, lng: 78.4700 },
    "Chandanagar": { lat: 17.4900, lng: 78.3300 }
  },
  
  // Chennai Areas
  Chennai: {
    "T. Nagar": { lat: 13.0390, lng: 80.2340 },
    "Anna Nagar": { lat: 13.0850, lng: 80.2150 },
    "Velachery": { lat: 12.9781, lng: 80.2219 },
    "Thoraipakkam": { lat: 12.9500, lng: 80.2400 },
    "OMR": { lat: 12.9200, lng: 80.2300 },
    "Guindy": { lat: 13.0100, lng: 80.2150 },
    "Adyar": { lat: 13.0050, lng: 80.2550 },
    "Besant Nagar": { lat: 13.0000, lng: 80.2650 },
    "Mylapore": { lat: 13.0350, lng: 80.2700 },
    "Triplicane": { lat: 13.0650, lng: 80.2800 },
    "Egmore": { lat: 13.0750, lng: 80.2550 },
    "Royapuram": { lat: 13.0950, lng: 80.2900 },
    "Perambur": { lat: 13.1100, lng: 80.2350 },
    "Kodambakkam": { lat: 13.0500, lng: 80.2250 },
    "Nungambakkam": { lat: 13.0650, lng: 80.2400 },
    "Alwarpet": { lat: 13.0300, lng: 80.2500 },
    "Kotturpuram": { lat: 13.0200, lng: 80.2450 },
    "Saidapet": { lat: 13.0150, lng: 80.2250 },
    "Teynampet": { lat: 13.0400, lng: 80.2450 },
    "Chetpet": { lat: 13.0600, lng: 80.2500 },
    "Padi": { lat: 13.1050, lng: 80.1900 },
    "Ambattur": { lat: 13.1150, lng: 80.1550 },
    "Porur": { lat: 13.0350, lng: 80.1650 },
    "Ramapuram": { lat: 13.0500, lng: 80.1750 },
    "Poonamallee": { lat: 13.0700, lng: 80.1200 },
    "Red Hills": { lat: 13.2000, lng: 80.1800 },
    "Pallavaram": { lat: 12.9650, lng: 80.1500 },
    "Medavakkam": { lat: 12.9300, lng: 80.1900 },
    "Selaiyur": { lat: 12.9200, lng: 80.2000 },
    "Chromepet": { lat: 12.9500, lng: 80.1400 }
  },
  
  // Kolkata Areas
  Kolkata: {
    "Park Street": { lat: 22.5450, lng: 88.3550 },
    "Salt Lake": { lat: 22.5850, lng: 88.4150 },
    "Ballygunge": { lat: 22.5250, lng: 88.3650 },
    "Jadavpur": { lat: 22.4950, lng: 88.3750 },
    "Gariahat": { lat: 22.5150, lng: 88.3600 },
    "Tollygunge": { lat: 22.4900, lng: 88.3550 },
    "Behala": { lat: 22.4950, lng: 88.3250 },
    "Howrah": { lat: 22.5850, lng: 88.3100 },
    "Dankuni": { lat: 22.6350, lng: 88.2800 },
    "Barasat": { lat: 22.2400, lng: 88.4550 },
    "Dumdum": { lat: 22.6250, lng: 88.4300 },
    "Baguiati": { lat: 22.5750, lng: 88.4350 },
    "VIP Road": { lat: 22.5650, lng: 88.4450 },
    "New Town": { lat: 22.5750, lng: 88.4900 },
    "Rajarhat": { lat: 22.6000, lng: 88.4700 },
    "Kolkata Airport": { lat: 22.6500, lng: 88.4400 },
    "Dhakuria": { lat: 22.5050, lng: 88.3850 },
    "Lake Gardens": { lat: 22.5250, lng: 88.3450 },
    "Alipore": { lat: 22.5350, lng: 88.3400 },
    "Kalighat": { lat: 22.5300, lng: 88.3600 },
    "Esplanade": { lat: 22.5650, lng: 88.3600 },
    "Bowbazar": { lat: 22.5700, lng: 88.3650 },
    "College Street": { lat: 22.5750, lng: 88.3700 },
    "Sealdah": { lat: 22.5650, lng: 88.3800 },
    "Park Circus": { lat: 22.5350, lng: 88.3750 },
    "Elgin": { lat: 22.5500, lng: 88.3700 },
    "Burrabazar": { lat: 22.5800, lng: 88.3700 },
    "Shyambazar": { lat: 22.5950, lng: 88.3750 },
    "Hatibagan": { lat: 22.6000, lng: 88.3850 },
    "Narkeldanga": { lat: 22.5850, lng: 88.3950 }
  }
};

// Helper function to get area coordinates
export function getAreaCoordinates(city, area) {
  if (areaCoordinates[city] && areaCoordinates[city][area]) {
    return areaCoordinates[city][area];
  }
  return null;
}

// Helper function to get all areas for a city
export function getAreasForCity(city) {
  if (areaCoordinates[city]) {
    return Object.keys(areaCoordinates[city]);
  }
  return [];
}

// Helper function to check if area exists
export function areaExists(city, area) {
  return areaCoordinates[city] && areaCoordinates[city][area] !== undefined;
}