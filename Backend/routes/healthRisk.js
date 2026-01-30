import { Router } from "express";
import { cityCoordinates } from "../data/cityCoordinates.js";
import { cityPollutionData } from "../data/cityPollutionData.js";
import {
  getRiskLevel,
  calculateOverallAQI,
  getAQICategory,
  getDiseasesByRisk,
  getDetailedDiseases,
  getHealthRecommendations,
} from "../utils/healthRisk.js";

const router = Router();

/**
 * Urban Planner API - Health Risk Endpoint
 * GET /api/health-risk?city=Delhi
 * 
 * Returns comprehensive health risk data for a specific city
 * including respiratory risk assessment and recommendations
 */

function getCityKey(city) {
  if (!city || typeof city !== "string") return null;
  const normalized = city.trim().toLowerCase();
  for (const [key] of Object.entries(cityCoordinates)) {
    if (key.toLowerCase() === normalized) return key;
  }
  return null;
}

function getRespiratoryRiskAssessment(aqi, risk) {
  const assessments = {
    High: {
      level: "Emergency",
      severity: 5,
      affectedConditions: [
        { name: "Asthma", riskMultiplier: 3.5, status: "Critical" },
        { name: "COPD", riskMultiplier: 4.0, status: "Critical" },
        { name: "Bronchitis", riskMultiplier: 3.0, status: "High" },
        { name: "Heart Disease", riskMultiplier: 2.5, status: "High" },
        { name: "Stroke Risk", riskMultiplier: 2.0, status: "Elevated" },
      ],
      vulnerableGroups: ["Children under 5", "Elderly 60+", "Pregnant women", "Pre-existing respiratory conditions"],
      immediateActions: [
        "Stay indoors with air purification",
        "Avoid all outdoor physical activity",
        "Keep emergency medications accessible",
        "Seek medical attention if symptoms worsen"
      ],
      longTermRisk: "Prolonged exposure increases chronic respiratory disease risk by 40-60%"
    },
    Medium: {
      level: "Moderate",
      severity: 3,
      affectedConditions: [
        { name: "Asthma", riskMultiplier: 2.0, status: "Elevated" },
        { name: "Allergies", riskMultiplier: 2.5, status: "High" },
        { name: "Bronchitis", riskMultiplier: 1.5, status: "Moderate" },
        { name: "Sinus Issues", riskMultiplier: 2.0, status: "Elevated" },
      ],
      vulnerableGroups: ["Sensitive individuals", "Athletes", "Outdoor workers"],
      immediateActions: [
        "Limit prolonged outdoor activities",
        "Use mask if going outdoors",
        "Keep windows closed during peak hours"
      ],
      longTermRisk: "Moderate exposure may cause temporary respiratory irritation"
    },
    Low: {
      level: "Safe",
      severity: 1,
      affectedConditions: [
        { name: "General Population", riskMultiplier: 1.0, status: "Normal" },
      ],
      vulnerableGroups: [],
      immediateActions: [
        "Air quality is acceptable",
        "Enjoy outdoor activities normally"
      ],
      longTermRisk: "No significant health impact expected"
    }
  };
  
  return assessments[risk] || assessments.Low;
}

/**
 * GET /api/health-risk
 * Query params: city (required) - City name
 * 
 * Returns detailed health risk assessment for urban planners
 */
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        error: "City parameter is required",
        example: "/api/health-risk?city=Delhi"
      });
    }

    const cityKey = getCityKey(city);
    if (!cityKey) {
      return res.status(404).json({
        success: false,
        error: "City not found",
        availableCities: Object.keys(cityCoordinates),
        suggestion: "Check spelling or try a major Indian city"
      });
    }

    // Get cached data if available
    const cacheKey = `health-risk-${cityKey.toLowerCase()}`;
    const cached = req.heatmapCache?.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const coords = cityCoordinates[cityKey];
    const pollution = cityPollutionData[cityKey];
    
    // Calculate pollutant values
    const pm25 = pollution?.pm25 || 45;
    const pm10 = pollution?.pm10 || Math.round(pm25 * 1.7);
    const pollutants = {
      pm25,
      pm10,
      o3: pollution?.o3 || 30,
      no2: pollution?.no2 || 25,
      so2: pollution?.so2 || 10,
      co: pollution?.co || 400
    };
    
    const aqi = calculateOverallAQI(pollutants);
    const aqiInfo = getAQICategory(aqi);
    const risk = getRiskLevel(pm25, aqi);
    const diseases = getDiseasesByRisk(risk);
    const detailedDiseases = getDetailedDiseases(aqi);
    const recommendations = getHealthRecommendations(aqi);
    const respiratoryAssessment = getRespiratoryRiskAssessment(aqi, risk);

    const payload = {
      success: true,
      timestamp: new Date().toISOString(),
      city: {
        name: cityKey,
        coordinates: coords,
        state: getCityState(cityKey)
      },
      airQuality: {
        aqi,
        category: aqiInfo.category,
        color: aqiInfo.color,
        pollutants: {
          pm25: { value: pm25, unit: "µg/m³", status: getPollutantStatus(pm25, "pm25") },
          pm10: { value: pm10, unit: "µg/m³", status: getPollutantStatus(pm10, "pm10") },
          o3: { value: pollutants.o3, unit: "µg/m³", status: getPollutantStatus(pollutants.o3, "o3") },
          no2: { value: pollutants.no2, unit: "µg/m³", status: getPollutantStatus(pollutants.no2, "no2") },
          so2: { value: pollutants.so2, unit: "µg/m³", status: getPollutantStatus(pollutants.so2, "so2") },
          co: { value: pollutants.co, unit: "µg/m³", status: getPollutantStatus(pollutants.co, "co") },
        }
      },
      healthRisk: {
        level: risk,
        respiratoryAssessment,
        affectedDiseases: diseases,
        detailedImpact: detailedDiseases,
        recommendations
      },
      urbanPlanningInsights: {
        greenSpaceRecommendation: getGreenSpaceRecommendation(aqi),
        trafficManagement: getTrafficRecommendation(aqi),
        industrialZoning: getIndustrialRecommendation(aqi),
        publicHealthAlert: aqi > 200
      },
      metadata: {
        source: "SDG-3 Air Quality Health Dashboard",
        dataFreshness: "Real-time (5 min cache)",
        apiVersion: "1.0",
        disclaimer: "For informational purposes only. Not a substitute for medical advice."
      }
    };

    req.heatmapCache?.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error("Health Risk API Error:", err);
    res.status(500).json({ success: false, error: "Service temporarily unavailable" });
  }
});

/**
 * GET /api/health-risk/summary
 * Returns health risk summary for all cities
 */
router.get("/summary", (req, res) => {
  try {
    const summary = Object.entries(cityCoordinates).map(([name, coords]) => {
      const pollution = cityPollutionData[name];
      const pm25 = pollution?.pm25 || 45;
      const aqi = calculateOverallAQI({
        pm25,
        pm10: pollution?.pm10 || pm25 * 1.7,
        o3: pollution?.o3 || 30,
        no2: pollution?.no2 || 25,
        so2: pollution?.so2 || 10,
        co: pollution?.co || 400
      });
      const aqiInfo = getAQICategory(aqi);
      const risk = getRiskLevel(pm25, aqi);
      
      return {
        city: name,
        aqi,
        category: aqiInfo.category,
        riskLevel: risk,
        coordinates: coords
      };
    });

    // Sort by AQI (worst first)
    summary.sort((a, b) => b.aqi - a.aqi);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalCities: summary.length,
      riskDistribution: {
        high: summary.filter(c => c.riskLevel === "High").length,
        medium: summary.filter(c => c.riskLevel === "Medium").length,
        low: summary.filter(c => c.riskLevel === "Low").length
      },
      cities: summary
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Service error" });
  }
});

// Helper functions
function getCityState(city) {
  const stateMap = {
    "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
    "Delhi": "Delhi", "Gurgaon": "Delhi", "Noida": "Delhi", "Ghaziabad": "Delhi",
    "Bengaluru": "Karnataka", "Chennai": "Tamil Nadu", "Kolkata": "West Bengal",
    "Hyderabad": "Telangana", "Ahmedabad": "Gujarat", "Jaipur": "Rajasthan",
    "Amritsar": "Punjab", "Lucknow": "Uttar Pradesh", "Varanasi": "Uttar Pradesh",
    "Bhopal": "Madhya Pradesh", "Indore": "Madhya Pradesh"
  };
  return stateMap[city] || "India";
}

function getPollutantStatus(value, type) {
  const thresholds = {
    pm25: { good: 30, moderate: 60, poor: 90 },
    pm10: { good: 50, moderate: 100, poor: 250 },
    o3: { good: 50, moderate: 100, poor: 168 },
    no2: { good: 40, moderate: 80, poor: 180 },
    so2: { good: 40, moderate: 80, poor: 380 },
    co: { good: 1000, moderate: 2000, poor: 10000 }
  };
  
  const t = thresholds[type] || thresholds.pm25;
  if (value <= t.good) return "Good";
  if (value <= t.moderate) return "Moderate";
  if (value <= t.poor) return "Poor";
  return "Severe";
}

function getGreenSpaceRecommendation(aqi) {
  if (aqi > 200) return "Urgent need for urban green corridors and tree plantation drives";
  if (aqi > 100) return "Increase green cover by 20% in residential areas";
  return "Maintain current green spaces";
}

function getTrafficRecommendation(aqi) {
  if (aqi > 200) return "Implement odd-even scheme, promote public transport";
  if (aqi > 100) return "Encourage carpooling, cycle lanes expansion";
  return "Standard traffic management sufficient";
}

function getIndustrialRecommendation(aqi) {
  if (aqi > 200) return "Review industrial emissions, enforce stricter standards";
  if (aqi > 100) return "Monitor industrial zones, schedule inspections";
  return "Continue regular monitoring";
}

export { router as healthRiskRouter };
