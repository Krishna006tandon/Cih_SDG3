// Mock data for Indian states, cities, and pollution levels

export interface CityData {
  name: string;
  state: string;
  lat: number;
  lng: number;
  pm25: number;
  pm10: number;
  aqi: number;
}

export interface StateInfo {
  name: string;
  cities: string[];
}

export const states: StateInfo[] = [
  {
    name: "Delhi",
    cities: ["New Delhi", "Dwarka", "Rohini", "Shahdara"]
  },
  {
    name: "Maharashtra",
    cities: ["Mumbai", "Pune", "Nagpur", "Thane"]
  },
  {
    name: "Karnataka",
    cities: ["Bangalore", "Mysore", "Hubli", "Mangalore"]
  },
  {
    name: "Tamil Nadu",
    cities: ["Chennai", "Coimbatore", "Madurai", "Salem"]
  },
  {
    name: "West Bengal",
    cities: ["Kolkata", "Howrah", "Durgapur", "Asansol"]
  },
  {
    name: "Gujarat",
    cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]
  },
  {
    name: "Uttar Pradesh",
    cities: ["Lucknow", "Kanpur", "Agra", "Varanasi"]
  },
  {
    name: "Rajasthan",
    cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota"]
  },
  {
    name: "Punjab",
    cities: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"]
  },
  {
    name: "Kerala",
    cities: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"]
  }
];

export const citiesData: CityData[] = [
  // Delhi - High pollution
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, pm25: 178, pm10: 285, aqi: 234 },
  { name: "Dwarka", state: "Delhi", lat: 28.5921, lng: 77.0460, pm25: 162, pm10: 268, aqi: 218 },
  { name: "Rohini", state: "Delhi", lat: 28.7495, lng: 77.0634, pm25: 171, pm10: 278, aqi: 227 },
  { name: "Shahdara", state: "Delhi", lat: 28.6704, lng: 77.2866, pm25: 185, pm10: 291, aqi: 241 },
  
  // Maharashtra - Moderate to high
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, pm25: 98, pm10: 156, aqi: 142 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pm25: 87, pm10: 142, aqi: 128 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, pm25: 112, pm10: 178, aqi: 162 },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781, pm25: 92, pm10: 148, aqi: 135 },
  
  // Karnataka - Moderate
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, pm25: 76, pm10: 124, aqi: 112 },
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394, pm25: 58, pm10: 95, aqi: 87 },
  { name: "Hubli", state: "Karnataka", lat: 15.3647, lng: 75.1240, pm25: 68, pm10: 108, aqi: 98 },
  { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560, pm25: 52, pm10: 84, aqi: 78 },
  
  // Tamil Nadu - Moderate
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, pm25: 82, pm10: 132, aqi: 118 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, pm25: 71, pm10: 115, aqi: 104 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, pm25: 78, pm10: 126, aqi: 112 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460, pm25: 73, pm10: 118, aqi: 106 },
  
  // West Bengal - High
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, pm25: 134, pm10: 218, aqi: 186 },
  { name: "Howrah", state: "West Bengal", lat: 22.5958, lng: 88.2636, pm25: 128, pm10: 208, aqi: 178 },
  { name: "Durgapur", state: "West Bengal", lat: 23.5204, lng: 87.3119, pm25: 142, pm10: 228, aqi: 195 },
  { name: "Asansol", state: "West Bengal", lat: 23.6739, lng: 86.9524, pm25: 148, pm10: 236, aqi: 202 },
  
  // Gujarat - Moderate to high
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, pm25: 105, pm10: 168, aqi: 152 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, pm25: 94, pm10: 152, aqi: 138 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, pm25: 98, pm10: 158, aqi: 143 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, pm25: 89, pm10: 144, aqi: 131 },
  
  // Uttar Pradesh - Very high
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, pm25: 156, pm10: 252, aqi: 212 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, pm25: 192, pm10: 305, aqi: 248 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, pm25: 167, pm10: 268, aqi: 223 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, pm25: 174, pm10: 278, aqi: 231 },
  
  // Rajasthan - High
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pm25: 118, pm10: 192, aqi: 168 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, pm25: 112, pm10: 182, aqi: 162 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, pm25: 95, pm10: 154, aqi: 139 },
  { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648, pm25: 108, pm10: 175, aqi: 157 },
  
  // Punjab - High
  { name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794, pm25: 125, pm10: 202, aqi: 174 },
  { name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573, pm25: 138, pm10: 224, aqi: 189 },
  { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, pm25: 132, pm10: 215, aqi: 183 },
  { name: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762, pm25: 129, pm10: 209, aqi: 179 },
  
  // Kerala - Good to moderate
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, pm25: 42, pm10: 68, aqi: 62 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, pm25: 38, pm10: 62, aqi: 56 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804, pm25: 45, pm10: 72, aqi: 66 },
  { name: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144, pm25: 41, pm10: 66, aqi: 60 }
];

export const getHealthRisk = (pm25: number): { level: string; color: string; bgColor: string } => {
  if (pm25 <= 50) return { level: "Good", color: "#10b981", bgColor: "#d1fae5" };
  if (pm25 <= 100) return { level: "Moderate", color: "#f59e0b", bgColor: "#fef3c7" };
  if (pm25 <= 150) return { level: "Unhealthy for Sensitive", color: "#f97316", bgColor: "#ffedd5" };
  if (pm25 <= 200) return { level: "Unhealthy", color: "#ef4444", bgColor: "#fee2e2" };
  if (pm25 <= 300) return { level: "Very Unhealthy", color: "#dc2626", bgColor: "#fecaca" };
  return { level: "Hazardous", color: "#991b1b", bgColor: "#fca5a5" };
};

export const getCityData = (cityName: string): CityData | undefined => {
  return citiesData.find(c => c.name === cityName);
};

// Generate PM2.5 trend data for charts
export const generateTrendData = (basePM25: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => {
    // Simulate seasonal variation - higher in winter months (Oct-Feb)
    const seasonalFactor = [1.4, 1.5, 1.2, 0.9, 0.8, 0.7, 0.75, 0.8, 0.85, 1.1, 1.3, 1.45];
    const pm25 = Math.round(basePM25 * seasonalFactor[index]);
    const pm10 = Math.round(pm25 * 1.6);
    return {
      month,
      pm25,
      pm10
    };
  });
};