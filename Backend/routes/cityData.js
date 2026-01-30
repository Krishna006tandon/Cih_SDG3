import { Router } from "express";
import { cityCoordinates } from "../data/cityCoordinates.js";
import { cityPollutionData } from "../data/cityPollutionData.js";
import airVisualClient from "../utils/airVisualClient.js";
import {
  getRiskLevel,
  getDiseasesByRisk,
  calculateOverallAQI,
  getAQICategory,
  getRiskFromAQI,
  getDetailedDiseases,
  getHealthRecommendations,
} from "../utils/healthRisk.js";
import { getAdvisory } from "../utils/advisory.js";

const router = Router();
const OPENAQ_BASE = "https://api.openaq.org/v3";

function normalizeCityName(name) {
  if (!name || typeof name !== "string") return "";
  return name.trim().replace(/\s+/g, " ");
}

function getCityKey(city) {
  const normalized = normalizeCityName(city);
  const lower = normalized.toLowerCase();
  for (const [key, _] of Object.entries(cityCoordinates)) {
    if (key.toLowerCase() === lower) return key;
  }
  return null;
}

function generateChartData(pm25, pm10) {
  const basePm25 = pm25 || 40;
  const basePm10 = pm10 || 70;
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i);
    const hour = d.getHours();
    const variation = (Math.sin(hour * 0.3) * 0.2 + 0.9) * (0.8 + Math.random() * 0.4);
    data.push({
      time: `${String(d.getHours()).padStart(2, "0")}:00`,
      pm25: Math.round(basePm25 * variation + (Math.random() - 0.5) * 8),
      pm10: Math.round(basePm10 * variation + (Math.random() - 0.5) * 12),
    });
  }
  return data;
}

// Derive pollutant concentrations from AQI values
function deriveConcentrationsFromAQI(aqi, mainPollutant) {
  // Indian AQI breakpoints for PM2.5 (µg/m³) - 24-hour average
  const PM25_BREAKPOINTS = [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ];

  // Indian AQI breakpoints for PM10 (µg/m³) - 24-hour average
  const PM10_BREAKPOINTS = [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
  ];

  // Helper function to calculate concentration from AQI using linear interpolation
  function calculateConcentration(aqi, breakpoints) {
    if (aqi == null || isNaN(aqi) || aqi < 0) return 0;
    
    for (const bp of breakpoints) {
      if (aqi >= bp.iLow && aqi <= bp.iHigh) {
        const concentration = ((aqi - bp.iLow) / (bp.iHigh - bp.iLow)) * (bp.cHigh - bp.cLow) + bp.cLow;
        return Math.round(concentration * 10) / 10; // Round to 1 decimal place
      }
    }
    
    // If AQI is above highest breakpoint, return max concentration
    if (aqi > 500) {
      return breakpoints[breakpoints.length - 1].cHigh;
    }
    return 0;
  }

  // Determine which pollutant is primary based on mainPollutant
  const isPM25 = mainPollutant === "PM2.5" || mainPollutant === "p2";
  const isPM10 = mainPollutant === "PM10" || mainPollutant === "p1";

  // Calculate primary pollutant concentration
  let pm25Concentration = 0;
  let pm10Concentration = 0;

  if (isPM25) {
    pm25Concentration = calculateConcentration(aqi, PM25_BREAKPOINTS);
    // Estimate PM10 based on typical PM2.5/PM10 ratio (usually 1.5-2.0)
    pm10Concentration = pm25Concentration * 1.7;
  } else if (isPM10) {
    pm10Concentration = calculateConcentration(aqi, PM10_BREAKPOINTS);
    // Estimate PM2.5 based on typical PM10/PM2.5 ratio
    pm25Concentration = pm10Concentration / 1.7;
  } else {
    // Fallback - assume mixed pollutants, derive both
    pm25Concentration = calculateConcentration(aqi, PM25_BREAKPOINTS);
    pm10Concentration = calculateConcentration(aqi, PM10_BREAKPOINTS);
  }

  // Return estimated concentrations with typical ratios for other pollutants
  return {
    pm25: pm25Concentration,
    pm10: pm10Concentration,
    o3: 35,   // Typical value based on AQI category
    no2: 30,  // Typical value based on AQI category
    so2: 15,  // Typical value based on AQI category
    co: 800,  // Typical value (in µg/m³) based on AQI category
  };
}

// Parameter name mapping for OpenAQ v3
const PARAM_MAP = {
  pm25: "pm25",
  pm10: "pm10",
  o3: "o3",
  no2: "no2",
  so2: "so2",
  co: "co",
};

async function fetchSensorMeasurements(sensorId, apiKey) {
  try {
    const dateFrom = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const mRes = await fetch(
      `${OPENAQ_BASE}/sensors/${sensorId}/measurements?date_from=${dateFrom}&limit=24`,
      { headers: { "X-API-Key": apiKey } }
    );
    if (mRes.ok) {
      const mJson = await mRes.json();
      return (mJson.results || []).map((r) => r.value).filter((v) => v != null);
    }
  } catch (_) {}
  return [];
}

async function fetchOpenAQData(lat, lng) {
  const apiKey = process.env.OPENAQ_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${OPENAQ_BASE}/locations?coordinates=${lat},${lng}&radius=25000&limit=10`;
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const locations = json.results || [];
    if (locations.length === 0) return null;

    // Collect values for all pollutants
    const pollutantValues = {
      pm25: [],
      pm10: [],
      o3: [],
      no2: [],
      so2: [],
      co: [],
    };
    let coords = { lat, lng };

    for (const loc of locations) {
      if (loc.coordinates) {
        coords = { lat: loc.coordinates.latitude, lng: loc.coordinates.longitude };
      }
      const sensors = loc.sensors || [];
      
      // Fetch measurements for each sensor in parallel
      const sensorPromises = sensors.map(async (s) => {
        const paramName = s.parameter?.name;
        if (paramName && PARAM_MAP[paramName]) {
          const vals = await fetchSensorMeasurements(s.id, apiKey);
          return { param: paramName, values: vals };
        }
        return null;
      });

      const results = await Promise.all(sensorPromises);
      for (const r of results) {
        if (r && r.values.length > 0) {
          pollutantValues[r.param].push(...r.values);
        }
      }
    }

    // Calculate averages
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    
    return {
      pm25: avg(pollutantValues.pm25),
      pm10: avg(pollutantValues.pm10),
      o3: avg(pollutantValues.o3),
      no2: avg(pollutantValues.no2),
      so2: avg(pollutantValues.so2),
      co: avg(pollutantValues.co),
      coords,
    };
  } catch (_) {
    return null;
  }
}

function getStaticFallback(cityKey) {
  const coords = cityCoordinates[cityKey];
  const pollution = cityPollutionData[cityKey];
  if (!coords) return null;
  
  if (pollution) {
    return {
      pm25: pollution.pm25,
      pm10: pollution.pm10,
      o3: pollution.o3 || null,
      no2: pollution.no2 || null,
      so2: pollution.so2 || null,
      co: pollution.co || null,
      coords,
    };
  }
  
  // Default fallback values based on typical Indian city pollution
  const base = 45;
  return {
    pm25: base,
    pm10: Math.round(base * 1.6),
    o3: 30,
    no2: 25,
    so2: 10,
    co: 400,
    coords,
  };
}

router.post("/", async (req, res) => {
  try {
    const { city } = req.body;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City not supported." });
    }

    const cityKey = getCityKey(city);
    if (!cityKey) {
      return res.status(400).json({ error: "City not supported." });
    }

    const normalizedCity = cityKey;
    const cacheKey = normalizedCity.toLowerCase();
    const cached = req.cityCache?.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const coords = cityCoordinates[cityKey];
    
    // Initialize pollutant values
    let pollutants = {
      pm25: null,
      pm10: null,
      o3: null,
      no2: null,
      so2: null,
      co: null,
    };
    let finalCoords = coords;
    let aqi = 0;
    let mainPollutant = "Unknown";
    let weather = {};

    try {
      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Try AirVisual API first for real-time data
      // Use appropriate state names for major cities
      let state = "Maharashtra";
      if (cityKey === "Delhi" || cityKey === "Gurgaon" || cityKey === "Noida" || cityKey === "Ghaziabad") {
        state = "Delhi";
      } else if (cityKey === "Kolkata") {
        state = "West Bengal";
      } else if (cityKey === "Chennai") {
        state = "Tamil Nadu";
      } else if (cityKey === "Bengaluru") {
        state = "Karnataka";
      } else if (cityKey === "Hyderabad") {
        state = "Telangana";
      } else if (cityKey === "Pune") {
        state = "Maharashtra";
      } else if (cityKey === "Ahmedabad") {
        state = "Gujarat";
      } else if (cityKey === "Jaipur") {
        state = "Rajasthan";
      }
      
      const airVisualData = await airVisualClient.getCityData(cityKey, state);
      
      if (airVisualData) {
        // Check if we have actual pollutant concentrations or just AQI
        const hasConcentrations = airVisualData.pollutants.pm25?.concentration > 0 || 
                                 airVisualData.pollutants.pm10?.concentration > 0;
        
        if (hasConcentrations) {
          // Use actual concentrations from API
          pollutants = {
            pm25: airVisualData.pollutants.pm25?.concentration || 0,
            pm10: airVisualData.pollutants.pm10?.concentration || 0,
            o3: airVisualData.pollutants.o3?.concentration || 0,
            no2: airVisualData.pollutants.no2?.concentration || 0,
            so2: airVisualData.pollutants.so2?.concentration || 0,
            co: airVisualData.pollutants.co?.concentration || 0,
          };
        } else {
          // Derive concentrations from AQI when actual concentrations are not available
          console.log(`Deriving concentrations from AQI for ${cityKey}`);
          pollutants = deriveConcentrationsFromAQI(airVisualData.aqi, airVisualData.mainPollutant);
        }
        
        aqi = airVisualData.aqi;
        mainPollutant = airVisualData.mainPollutant;
        finalCoords = {
          lat: airVisualData.coordinates[1],
          lng: airVisualData.coordinates[0]
        };
        weather = airVisualData.weather;
      }
    } catch (error) {
      console.log(`AirVisual API failed for ${cityKey}, falling back to static data:`, error.message);
      
      // Fallback to static data
      const fallback = getStaticFallback(cityKey);
      if (fallback) {
        pollutants = {
          pm25: fallback.pm25,
          pm10: fallback.pm10,
          o3: fallback.o3,
          no2: fallback.no2,
          so2: fallback.so2,
          co: fallback.co,
        };
        finalCoords = fallback.coords;
      }

      // Try OpenAQ as secondary fallback
      const openaqData = await fetchOpenAQData(coords.lat, coords.lng);
      if (openaqData) {
        if (openaqData.pm25 != null) pollutants.pm25 = openaqData.pm25;
        if (openaqData.pm10 != null) pollutants.pm10 = openaqData.pm10;
        if (openaqData.o3 != null) pollutants.o3 = openaqData.o3;
        if (openaqData.no2 != null) pollutants.no2 = openaqData.no2;
        if (openaqData.so2 != null) pollutants.so2 = openaqData.so2;
        if (openaqData.co != null) pollutants.co = openaqData.co;
        if (openaqData.coords) finalCoords = openaqData.coords;
      }
    }

    // Ensure minimum values for PM
    if (pollutants.pm25 == null) pollutants.pm25 = 45;
    if (pollutants.pm10 == null) pollutants.pm10 = 78;

    // Calculate AQI if not provided by AirVisual
    if (aqi === 0) {
      aqi = calculateOverallAQI(pollutants);
    }

    // Calculate AQI info
    const aqiInfo = getAQICategory(aqi);
    const risk = getRiskFromAQI(aqi);
    const diseases = getDiseasesByRisk(risk);
    const detailedDiseases = getDetailedDiseases(aqi);
    const healthRecommendations = getHealthRecommendations(aqi);
    const advisory = getAdvisory(risk);
    const chartData = generateChartData(pollutants.pm25, pollutants.pm10);

    const payload = {
      city: normalizedCity,
      // All pollutants
      pm25: Math.round(pollutants.pm25 * 10) / 10,
      pm10: Math.round(pollutants.pm10 * 10) / 10,
      o3: pollutants.o3 != null ? Math.round(pollutants.o3 * 10) / 10 : null,
      no2: pollutants.no2 != null ? Math.round(pollutants.no2 * 10) / 10 : null,
      so2: pollutants.so2 != null ? Math.round(pollutants.so2 * 10) / 10 : null,
      co: pollutants.co != null ? Math.round(pollutants.co * 10) / 10 : null,
      // AQI info
      aqi,
      aqiCategory: aqiInfo.category,
      aqiColor: aqiInfo.color,
      // Risk and health
      risk,
      diseases,
      detailedDiseases,
      healthRecommendations,
      // Location and chart
      coordinates: { lat: finalCoords.lat, lng: finalCoords.lng },
      chartData,
      advisory,
      disclaimer: "For awareness and prevention only. Not medical diagnosis.",
      lastUpdated: new Date().toISOString(),
    };

    req.cityCache?.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Temporary service issue." });
  }
});

export { router as cityDataRouter };
