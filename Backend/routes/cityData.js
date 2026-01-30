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
        pollutants = {
          pm25: airVisualData.pollutants.pm25?.concentration || 0,
          pm10: airVisualData.pollutants.pm10?.concentration || 0,
          o3: airVisualData.pollutants.o3?.concentration || 0,
          no2: airVisualData.pollutants.no2?.concentration || 0,
          so2: airVisualData.pollutants.so2?.concentration || 0,
          co: airVisualData.pollutants.co?.concentration || 0,
        };
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
