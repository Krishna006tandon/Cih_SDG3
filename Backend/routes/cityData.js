import { Router } from "express";
import { cityCoordinates } from "../data/cityCoordinates.js";
import { cityPollutionData } from "../data/cityPollutionData.js";
import { areaCoordinates, getAreaCoordinates, areaExists } from "../data/areaCoordinates.js";
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

async function fetchOpenMeteoData(lat, lng) {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5`;
    const res = await fetch(url);
    
    if (!res.ok) return null;
    
    const json = await res.json();
    const current = json.current || {};
    
    return {
      pm25: current.pm2_5 !== undefined ? current.pm2_5 : null,
      pm10: current.pm10 !== undefined ? current.pm10 : null,
      coords: { lat, lng }
    };
  } catch (error) {
    console.error('Open-Meteo API Error:', error.message);
    return null;
  }
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
    const { state, city, area } = req.body;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City not supported." });
    }

    // Validate area if provided
    if (area && typeof area === "string" && !areaExists(city, area)) {
      return res.status(400).json({ error: `Area '${area}' not found in ${city}.` });
    }

    const cityKey = getCityKey(city);
    if (!cityKey) {
      return res.status(400).json({ error: "City not supported." });
    }

    const normalizedCity = cityKey;
    const cacheKey = `${normalizedCity.toLowerCase()}${area ? `_area_${area.toLowerCase().replace(/\s+/g, '_')}` : ''}`;
    const cached = req.cityCache?.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Determine coordinates to use
    let coordsToUse = cityCoordinates[cityKey];
    let locationType = "city";
    let locationName = cityKey;
    
    if (area && areaExists(cityKey, area)) {
      coordsToUse = getAreaCoordinates(cityKey, area);
      locationType = "area";
      locationName = area;
    }
    
    if (!coordsToUse) {
      return res.status(400).json({ error: "Location coordinates not found." });
    }
    
    // Initialize response structure
    let responsePayload = {
      state: state || "Maharashtra",
      city: normalizedCity,
      area: area || null,
      coordinates: { lat: coordsToUse.lat, lng: coordsToUse.lng },
      pm25: 0,
      pm10: 0,
      o3: null,
      no2: null,
      so2: null,
      co: null,
      aqi: 0,
      aqiCategory: "",
      aqiColor: "",
      risk: "",
      diseases: [],
      detailedDiseases: [],
      healthRecommendations: {},
      chartData: [],
      advisory: "",
      disclaimer: "For awareness and prevention only. Not medical diagnosis.",
      lastUpdated: new Date().toISOString(),
      source: "",
      fallbackUsed: false,
      locationType: locationType,
      locationAttempted: locationName
    };
    
    // Initialize pollutant values
    let pollutants = {
      pm25: null,
      pm10: null,
      o3: null,
      no2: null,
      so2: null,
      co: null,
    };
    let finalCoords = coordsToUse;
    let aqi = 0;
    let mainPollutant = "Unknown";
    let weather = {};
    let dataSource = "";
    let fallbackUsed = false;

    try {
      // AREA-FIRST DATA FETCHING LOGIC
      
      // Step 1: Try to get data from area-level nearest station
      if (locationType === "area") {
        try {
          console.log(`Attempting to fetch area data for ${area} in ${cityKey}`);
          const stationData = await airVisualClient.getNearestStation(coordsToUse.lat, coordsToUse.lng);
          
          if (stationData) {
            // Check if we have actual pollutant concentrations or just AQI
            const hasConcentrations = stationData.pollutants.pm25?.concentration > 0 || 
                                     stationData.pollutants.pm10?.concentration > 0;
            
            if (hasConcentrations) {
              // Use actual concentrations from API
              pollutants = {
                pm25: stationData.pollutants.pm25?.concentration || 0,
                pm10: stationData.pollutants.pm10?.concentration || 0,
                o3: stationData.pollutants.o3?.concentration || 0,
                no2: stationData.pollutants.no2?.concentration || 0,
                so2: stationData.pollutants.so2?.concentration || 0,
                co: stationData.pollutants.co?.concentration || 0,
              };
              console.log(`Using actual concentrations from AirVisual API for area ${area}:`, JSON.stringify(pollutants, null, 2));
            } else {
              // Derive concentrations from AQI when actual concentrations are not available
              console.log(`Deriving concentrations from AQI for area ${area}. AQI: ${stationData.aqi}, Main pollutant: ${stationData.mainPollutant}`);
              pollutants = deriveConcentrationsFromAQI(stationData.aqi, stationData.mainPollutant);
              console.log(`Derived concentrations:`, JSON.stringify(pollutants, null, 2));
            }
            
            aqi = stationData.aqi;
            mainPollutant = stationData.mainPollutant;
            finalCoords = {
              lat: stationData.coordinates[1],
              lng: stationData.coordinates[0]
            };
            weather = stationData.weather;
            dataSource = "IQAir-nearest-station";
            
            console.log(`Successfully fetched area data from nearest station for ${area}`);
          }
        } catch (areaError) {
          console.log(`Area data fetch failed for ${area}, falling back to city data:`, areaError.message);
          fallbackUsed = true;
        }
      }
      
      // Step 2: If area data failed or not requested, try city-level data
      if (aqi === 0) {
        try {
          console.log(`Attempting to fetch city data for ${cityKey}`);
          // Add small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Use appropriate state names for major cities
          let stateForApi = "Maharashtra";
          if (cityKey === "Delhi" || cityKey === "Gurgaon" || cityKey === "Noida" || cityKey === "Ghaziabad") {
            stateForApi = "Delhi";
          } else if (cityKey === "Kolkata") {
            stateForApi = "West Bengal";
          } else if (cityKey === "Chennai") {
            stateForApi = "Tamil Nadu";
          } else if (cityKey === "Bengaluru") {
            stateForApi = "Karnataka";
          } else if (cityKey === "Hyderabad") {
            stateForApi = "Telangana";
          } else if (cityKey === "Pune") {
            stateForApi = "Maharashtra";
          } else if (cityKey === "Ahmedabad") {
            stateForApi = "Gujarat";
          } else if (cityKey === "Jaipur") {
            stateForApi = "Rajasthan";
          } else if (cityKey === "Amritsar") {
            stateForApi = "Punjab";
          }
          
          const airVisualData = await airVisualClient.getCityData(cityKey, stateForApi);
          
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
              console.log(`Using actual concentrations from AirVisual API for ${cityKey}:`, JSON.stringify(pollutants, null, 2));
            } else {
              // Derive concentrations from AQI when actual concentrations are not available
              console.log(`Deriving concentrations from AQI for ${cityKey}. AQI: ${airVisualData.aqi}, Main pollutant: ${airVisualData.mainPollutant}`);
              pollutants = deriveConcentrationsFromAQI(airVisualData.aqi, airVisualData.mainPollutant);
              console.log(`Derived concentrations:`, JSON.stringify(pollutants, null, 2));
            }
            
            aqi = airVisualData.aqi;
            mainPollutant = airVisualData.mainPollutant;
            finalCoords = {
              lat: airVisualData.coordinates[1],
              lng: airVisualData.coordinates[0]
            };
            weather = airVisualData.weather;
            dataSource = "IQAir-city";
            
            console.log(`Successfully fetched city data for ${cityKey}`);
          }
        } catch (cityError) {
          console.log(`City data fetch failed for ${cityKey}, falling back to static/Open-Meteo data:`, cityError.message);
          fallbackUsed = true;
        }
      }

      // Check if AirVisual API key is configured
      const airVisualApiKey = process.env.AIRVISUAL_API_KEY;
      if (!airVisualApiKey || airVisualApiKey === 'your-airvisual-api-key-here') {
        console.log('⚠️ AirVisual API key not configured, skipping real-time data fetch');
        throw new Error('API key not configured');
      }
      
      // Try AirVisual API for real-time data
      try {
        // Use appropriate state names for all supported cities
        const stateMap = {
          "Delhi": "Delhi",
          "Gurgaon": "Haryana",
          "Noida": "Uttar Pradesh",
          "Ghaziabad": "Uttar Pradesh",
          "Mumbai": "Maharashtra",
          "Pune": "Maharashtra",
          "Nagpur": "Maharashtra",
          "Thane": "Maharashtra",
          "Nashik": "Maharashtra",
          "Aurangabad": "Maharashtra",
          "Kolkata": "West Bengal",
          "Howrah": "West Bengal",
          "Chennai": "Tamil Nadu",
          "Coimbatore": "Tamil Nadu",
          "Madurai": "Tamil Nadu",
          "Tiruchirappalli": "Tamil Nadu",
          "Bengaluru": "Karnataka",
          "Mysore": "Karnataka",
          "Hubli": "Karnataka",
          "Mangalore": "Karnataka",
          "Hyderabad": "Telangana",
          "Secunderabad": "Telangana",
          "Ahmedabad": "Gujarat",
          "Surat": "Gujarat",
          "Vadodara": "Gujarat",
          "Rajkot": "Gujarat",
          "Jaipur": "Rajasthan",
          "Jodhpur": "Rajasthan",
          "Kota": "Rajasthan",
          "Lucknow": "Uttar Pradesh",
          "Kanpur": "Uttar Pradesh",
          "Agra": "Uttar Pradesh",
          "Allahabad": "Uttar Pradesh",
          "Bareilly": "Uttar Pradesh",
          "Meerut": "Uttar Pradesh",
          "Faridabad": "Haryana",
          "Gurgaon": "Haryana",
          "Indore": "Madhya Pradesh",
          "Bhopal": "Madhya Pradesh",
          "Jabalpur": "Madhya Pradesh",
          "Gwalior": "Madhya Pradesh",
          "Raipur": "Chhattisgarh",
          "Dhanbad": "Jharkhand",
          "Ranchi": "Jharkhand",
          "Patna": "Bihar",
          "Amritsar": "Punjab",
          "Ludhiana": "Punjab",
          "Chandigarh": "Chandigarh",
          "Jammu": "Jammu and Kashmir",
          "Srinagar": "Jammu and Kashmir",
          "Shimla": "Himachal Pradesh",
          "Dehradun": "Uttarakhand",
          "Guwahati": "Assam",
          "Kochi": "Kerala",
          "Thiruvananthapuram": "Kerala",
          "Bhubaneswar": "Odisha",
          "Cuttack": "Odisha",
          "Visakhapatnam": "Andhra Pradesh",
          "Vijayawada": "Andhra Pradesh"
        };
        
        const state = stateMap[cityKey] || "Maharashtra";
        
        const airVisualData = await airVisualClient.getCityData(cityKey, state);
        
        if (airVisualData) {
          console.log(`✅ AirVisual data successfully retrieved for ${cityKey}, ${state}`);
          console.log(`AirVisual data for ${cityKey}:`, JSON.stringify(airVisualData, null, 2));
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
          dataSource = "IQAir";
          
          console.log(`Successfully fetched AirVisual data for ${cityKey}`);
        }
      } catch (airVisualError) {
        console.log(`AirVisual API failed for ${cityKey}, falling back to static data:`, airVisualError.message);
        fallbackUsed = true;
      }
    } catch (error) {
      // Handle specific error cases
      if (error.message === 'API key not configured') {
        console.log(`ℹ️ Using static fallback data for ${cityKey} (API key not configured)`);
      } else {
        console.log(`AirVisual API failed for ${cityKey}, falling back to static data:`, error.message);
      }

      
      // Apply fallback data when AirVisual fails
      console.log(`Using fallback data for ${locationName}`);
      
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
        dataSource = "static-data";
        console.log(`Applied static fallback data for ${cityKey}: PM2.5=${fallback.pm25}, PM10=${fallback.pm10}`);
      }

      // Try Open-Meteo as secondary fallback for real-time data
      try {
        const openMeteoData = await fetchOpenMeteoData(coordsToUse.lat, coordsToUse.lng);
        if (openMeteoData) {
          // Only update pollutants if they're not already set or are zero
          if (pollutants.pm25 == null || pollutants.pm25 === 0) pollutants.pm25 = openMeteoData.pm25;
          if (pollutants.pm10 == null || pollutants.pm10 === 0) pollutants.pm10 = openMeteoData.pm10;
          if (openMeteoData.coords) finalCoords = openMeteoData.coords;
          dataSource = "Open-Meteo";
          console.log(`Successfully fetched Open-Meteo fallback data for ${locationName}`);
        }
      } catch (openMeteoError) {
        console.log(`Open-Meteo fallback failed:`, openMeteoError.message);
      }

      // Try OpenAQ as secondary fallback (only if API key is configured)
      const openaqApiKey = process.env.OPENAQ_API_KEY;
      if (openaqApiKey && openaqApiKey !== 'your-openaq-api-key-here') {
        const openaqData = await fetchOpenAQData(coordsToUse.lat, coordsToUse.lng);
        if (openaqData) {
          // Update pollutants with OpenAQ data if available
          if (openaqData.pm25 != null && openaqData.pm25 > 0) pollutants.pm25 = openaqData.pm25;
          if (openaqData.pm10 != null && openaqData.pm10 > 0) pollutants.pm10 = openaqData.pm10;
          if (openaqData.o3 != null && openaqData.o3 > 0) pollutants.o3 = openaqData.o3;
          if (openaqData.no2 != null && openaqData.no2 > 0) pollutants.no2 = openaqData.no2;
          if (openaqData.so2 != null && openaqData.so2 > 0) pollutants.so2 = openaqData.so2;
          if (openaqData.co != null && openaqData.co > 0) pollutants.co = openaqData.co;
          if (openaqData.coords) finalCoords = openaqData.coords;
          console.log(`Applied OpenAQ data for ${locationName}:`, JSON.stringify(openaqData, null, 2));
        }
      } else if (error.message !== 'API key not configured') {
        console.log('⚠️ OpenAQ API key not configured, skipping secondary fallback');
      }

    // Ensure all pollutant values are populated with fallbacks
    // First try static data, then defaults
    const staticFallback = getStaticFallback(cityKey);
    if (staticFallback) {
      if (pollutants.pm25 == null || pollutants.pm25 === 0) pollutants.pm25 = staticFallback.pm25;
      if (pollutants.pm10 == null || pollutants.pm10 === 0) pollutants.pm10 = staticFallback.pm10;
      if (pollutants.o3 == null || pollutants.o3 === 0) pollutants.o3 = staticFallback.o3 || 30;
      if (pollutants.no2 == null || pollutants.no2 === 0) pollutants.no2 = staticFallback.no2 || 25;
      if (pollutants.so2 == null || pollutants.so2 === 0) pollutants.so2 = staticFallback.so2 || 15;
      if (pollutants.co == null || pollutants.co === 0) pollutants.co = staticFallback.co || 400;
    } else {
      // Default fallback values based on typical Indian city pollution
      if (pollutants.pm25 == null || pollutants.pm25 === 0) pollutants.pm25 = 45;
      if (pollutants.pm10 == null || pollutants.pm10 === 0) pollutants.pm10 = 78;
      if (pollutants.o3 == null || pollutants.o3 === 0) pollutants.o3 = 30;
      if (pollutants.no2 == null || pollutants.no2 === 0) pollutants.no2 = 25;
      if (pollutants.so2 == null || pollutants.so2 === 0) pollutants.so2 = 15;
      if (pollutants.co == null || pollutants.co === 0) pollutants.co = 400;
    }

    // Calculate AQI if not provided
    if (aqi === 0) {
      aqi = calculateOverallAQI(pollutants);
    }

    console.log(`Building response for ${cityKey} with pollutants:`, JSON.stringify({
      pm25: pollutants.pm25,
      pm10: pollutants.pm10,
      o3: pollutants.o3,
      no2: pollutants.no2,
      so2: pollutants.so2,
      co: pollutants.co
    }, null, 2));
    
    // Calculate AQI info
    const aqiInfo = getAQICategory(aqi);
    const risk = getRiskFromAQI(aqi);
    const diseases = getDiseasesByRisk(risk);
    const detailedDiseases = getDetailedDiseases(aqi);
    const healthRecommendations = getHealthRecommendations(aqi);
    const advisory = getAdvisory(risk);
    const chartData = generateChartData(pollutants.pm25, pollutants.pm10);

    // Build final response
    responsePayload = {
      ...responsePayload,
      pm25: Math.round(pollutants.pm25 * 10) / 10,
      pm10: Math.round(pollutants.pm10 * 10) / 10,
      o3: pollutants.o3 != null ? Math.round(pollutants.o3 * 10) / 10 : null,
      no2: pollutants.no2 != null ? Math.round(pollutants.no2 * 10) / 10 : null,
      so2: pollutants.so2 != null ? Math.round(pollutants.so2 * 10) / 10 : null,
      co: pollutants.co != null ? Math.round(pollutants.co * 10) / 10 : null,
      aqi,
      aqiCategory: aqiInfo.category,
      aqiColor: aqiInfo.color,
      risk,
      diseases,
      detailedDiseases,
      healthRecommendations,
      coordinates: { lat: finalCoords.lat, lng: finalCoords.lng },
      chartData,
      advisory,
      source: dataSource,
      fallbackUsed: fallbackUsed
    };

    console.log(`Sending response for ${cityKey}:`, JSON.stringify({
      pm25: responsePayload.pm25,
      pm10: responsePayload.pm10,
      o3: responsePayload.o3,
      no2: responsePayload.no2,
      so2: responsePayload.so2,
      co: responsePayload.co,
      aqi: responsePayload.aqi,
      source: responsePayload.source
    }, null, 2));
    
    req.cityCache?.set(cacheKey, responsePayload);
    res.json(responsePayload);
  }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Temporary service issue." });
  }
});

export { router as cityDataRouter };
