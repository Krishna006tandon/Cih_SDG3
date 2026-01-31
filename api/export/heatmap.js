// Vercel API route for heatmap data export
import { cityCoordinates } from '../data/cityCoordinates.js';
import { cityPollutionData } from '../data/cityPollutionData.js';

// Simple AQI calculation function
function calculateOverallAQI(pollutants) {
  const pm25Aqi = Math.round((pollutants.pm25 / 100) * 100);
  const pm10Aqi = Math.round((pollutants.pm10 / 150) * 100);
  return Math.max(pm25Aqi, pm10Aqi, 20);
}

// Simple AQI category function
function getAQICategory(aqi) {
  if (aqi <= 50) return { category: "Good", color: "#22c55e" };
  if (aqi <= 100) return { category: "Satisfactory", color: "#84cc16" };
  if (aqi <= 200) return { category: "Moderate", color: "#eab308" };
  if (aqi <= 300) return { category: "Poor", color: "#f97316" };
  if (aqi <= 400) return { category: "Very Poor", color: "#ef4444" };
  return { category: "Severe", color: "#7e22ce" };
}

// Simple risk function
function getRiskFromAQI(aqi) {
  if (aqi <= 100) return "Low";
  if (aqi <= 200) return "Medium";
  return "High";
}

// Helper function to generate CSV data for heatmap
function generateHeatmapCSVData(data) {
  const headers = ['city', 'latitude', 'longitude', 'pm25', 'pm10', 'aqi', 'risk', 'color', 'timestamp'];
  
  const rows = data.points.map(point => [
    point.city,
    point.lat,
    point.lng,
    point.pm25,
    point.pm10 || "N/A",
    point.aqi || "N/A",
    point.risk,
    point.color,
    point.timestamp || new Date().toISOString()
  ]);
  
  return headers.join(',') + '\n' + 
         rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
}

// Generate sample heatmap data
function generateHeatmapData(state) {
  let cities = Object.entries(cityCoordinates);
  
  // Filter by state if provided
  if (state) {
    // Simple state filtering - you'd want a more comprehensive mapping
    const stateCities = {
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
      "Delhi": ["Delhi", "Gurgaon", "Noida", "Ghaziabad"],
      "Karnataka": ["Bengaluru", "Mysore"],
      "Tamil Nadu": ["Chennai", "Coimbatore"],
      "West Bengal": ["Kolkata"],
      "Telangana": ["Hyderabad"],
      "Gujarat": ["Ahmedabad", "Surat"],
      "Rajasthan": ["Jaipur", "Jodhpur"],
      "Punjab": ["Amritsar"],
      "Uttar Pradesh": ["Lucknow", "Kanpur"]
    };
    
    const stateCityList = stateCities[state] || [];
    cities = cities.filter(([name]) => 
      stateCityList.some(c => c.toLowerCase() === name.toLowerCase())
    );
  }
  
  const points = cities.map(([name, coords]) => {
    // Generate sample data for each city
    const pollution = cityPollutionData[name] || {
      pm25: 45 + Math.random() * 100,
      pm10: 78 + Math.random() * 120,
      o3: 20 + Math.random() * 40,
      no2: 20 + Math.random() * 30,
      so2: 10 + Math.random() * 20,
      co: 300 + Math.random() * 600
    };
    
    const aqi = calculateOverallAQI(pollution);
    const aqiInfo = getAQICategory(aqi);
    const risk = getRiskFromAQI(aqi);
    
    return {
      city: name,
      lat: coords.lat,
      lng: coords.lng,
      pm25: Math.round(pollution.pm25),
      pm10: Math.round(pollution.pm10),
      aqi: aqi,
      aqiCategory: aqiInfo.category,
      risk: risk,
      color: risk === "High" ? "#ef4444" : risk === "Medium" ? "#eab308" : "#22c55e",
      timestamp: new Date().toISOString()
    };
  });
  
  return { points };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { state, format = "csv" } = req.query;
    
    // Generate heatmap data
    const data = generateHeatmapData(state);
    
    if (format === "json") {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=heatmap_data${state ? `_${state}` : ''}.json`);
      return res.status(200).json({
        success: true,
        count: data.points.length,
        filter: state || "all",
        timestamp: new Date().toISOString(),
        data: data
      });
    } else {
      // Default to CSV
      const csv = generateHeatmapCSVData(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=heatmap_data${state ? `_${state}` : ''}.csv`);
      return res.status(200).send(csv);
    }
    
  } catch (error) {
    console.error("Heatmap export error:", error);
    res.status(500).json({ error: "Failed to export heatmap data" });
  }
}