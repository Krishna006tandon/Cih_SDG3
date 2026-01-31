import { Router } from "express";
import { cityCoordinates } from "../data/cityCoordinates.js";
import { cityPollutionData } from "../data/cityPollutionData.js";
import airVisualClient from "../utils/airVisualClient.js";
import { getRiskLevel, calculateOverallAQI, getAQICategory, getDiseasesByRisk, getDetailedDiseases, getHealthRecommendations } from "../utils/healthRisk.js";

const router = Router();

// State to cities mapping for India
const STATE_CITIES = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Delhi": ["Delhi", "Gurgaon", "Noida", "Ghaziabad"],
  "Karnataka": ["Bengaluru"],
  "Tamil Nadu": ["Chennai"],
  "West Bengal": ["Kolkata"],
  "Telangana": ["Hyderabad"],
  "Gujarat": ["Ahmedabad"],
  "Rajasthan": ["Jaipur"],
  "Punjab": ["Amritsar"],
  "Uttar Pradesh": ["Lucknow", "Varanasi"],
  "Madhya Pradesh": ["Bhopal", "Indore"],
};

function getRiskColor(risk) {
  const colors = { High: "#ef4444", Medium: "#eab308", Low: "#22c55e" };
  return colors[risk] || colors.Low;
}

function getRespiratoryRiskDetails(risk) {
  const details = {
    High: {
      level: "Severe",
      description: "Emergency respiratory danger - Bronchitis, COPD, Heart issues",
      recommendations: ["Stay indoors", "Use air purifier", "Wear N95 mask if going out", "Seek medical attention if symptoms worsen"]
    },
    Medium: {
      level: "Moderate",
      description: "Asthma irritation possible - Sensitive groups at risk",
      recommendations: ["Limit outdoor activities", "Keep windows closed", "Use mask if sensitive"]
    },
    Low: {
      level: "Low",
      description: "Normal breathing - Safe for most activities",
      recommendations: ["Air quality is acceptable", "Enjoy outdoor activities"]
    }
  };
  return details[risk] || details.Low;
}

// Helper to generate point data with real AQI fetching
async function generatePointData(name, coords) {
  try {
    // Try to get real data from AirVisual API
    const cityData = await airVisualClient.getNearestCity(coords.lat, coords.lng);
    
    if (cityData && cityData.aqi !== undefined) {
      // Use real AQI data
      const pm25 = cityData.pollutants.pm25?.concentration || 45;
      const pm10 = cityData.pollutants.pm10?.concentration || Math.round(pm25 * 1.7);
      const pollutants = {
        pm25: pm25,
        pm10: pm10,
        o3: cityData.pollutants.o3?.concentration || 30,
        no2: cityData.pollutants.no2?.concentration || 25,
        so2: cityData.pollutants.so2?.concentration || 10,
        co: cityData.pollutants.co?.concentration || 400
      };
      
      const aqi = cityData.aqi;
      const aqiInfo = getAQICategory(aqi);
      const risk = getRiskLevel(pm25, aqi);
      const respiratoryRisk = getRespiratoryRiskDetails(risk);
      
      return {
        city: name,
        lat: coords.lat,
        lng: coords.lng,
        pm25,
        pm10,
        aqi,
        aqiCategory: aqiInfo.category,
        risk,
        color: getRiskColor(risk),
        respiratoryRisk,
        pollutants,
        timestamp: new Date().toISOString(),
        source: 'real-time'
      };
    }
  } catch (error) {
    console.log(`Failed to fetch real data for ${name}, falling back to static data`);
  }
  
  // Fallback to static data
  const pollution = cityPollutionData[name];
  const pm25 = pollution ? pollution.pm25 : 45;
  const pm10 = pollution?.pm10 || Math.round(pm25 * 1.7);
  const pollutants = {
    pm25: pm25,
    pm10: pm10,
    o3: pollution?.o3 || 30,
    no2: pollution?.no2 || 25,
    so2: pollution?.so2 || 10,
    co: pollution?.co || 400
  };
  const aqi = calculateOverallAQI(pollutants);
  const aqiInfo = getAQICategory(aqi);
  const risk = getRiskLevel(pm25, aqi);
  const respiratoryRisk = getRespiratoryRiskDetails(risk);
  
  return {
    city: name,
    lat: coords.lat,
    lng: coords.lng,
    pm25,
    pm10,
    aqi,
    aqiCategory: aqiInfo.category,
    risk,
    color: getRiskColor(risk),
    respiratoryRisk,
    pollutants,
    timestamp: new Date().toISOString(),
    source: 'static'
  };
}

/**
 * GET /api/heatmap
 * Returns heatmap data for all cities or filtered by state
 * Query params: state (optional) - Filter by Indian state
 * 
 * Urban Planner API - Returns JSON with location, AQI, pollution category, respiratory risk
 */
router.get("/", async (req, res) => {
  try {
    const { state } = req.query;
    const cacheKey = state ? `heatmap-${state.toLowerCase()}` : "heatmap-all";
    
    const cached = req.heatmapCache?.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let cities = Object.entries(cityCoordinates);
    
    // Filter by state if provided
    if (state) {
      const normalizedState = Object.keys(STATE_CITIES).find(
        s => s.toLowerCase() === state.toLowerCase()
      );
      
      if (normalizedState && STATE_CITIES[normalizedState]) {
        const stateCities = STATE_CITIES[normalizedState];
        cities = cities.filter(([name]) => 
          stateCities.some(c => c.toLowerCase() === name.toLowerCase())
        );
      }
    }

    const points = [];
    for (const [name, coords] of cities) {
      const pointData = await generatePointData(name, coords);
      points.push(pointData);
    }

    const payload = {
      success: true,
      count: points.length,
      filter: state || "all",
      timestamp: new Date().toISOString(),
      data: { points },
      // Urban Planner metadata
      metadata: {
        source: "SDG-3 Air Quality Dashboard",
        refreshInterval: "5 minutes",
        availableStates: Object.keys(STATE_CITIES),
        apiVersion: "1.0"
      }
    };
    
    req.heatmapCache?.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Temporary service issue." });
  }
});

/**
 * GET /api/heatmap/states
 * Returns list of available states for filtering
 */
router.get("/states", (req, res) => {
  res.json({
    success: true,
    states: Object.keys(STATE_CITIES),
    totalCities: Object.keys(cityCoordinates).length
  });
});

export { router as heatmapRouter };
