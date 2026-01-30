import { Router } from "express";
import { cityCoordinates } from "../data/cityCoordinates.js";
import { cityPollutionData } from "../data/cityPollutionData.js";
import { getRiskLevel, getDiseasesByRisk } from "../utils/healthRisk.js";
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

async function fetchOpenAQData(lat, lng) {
  const apiKey = process.env.OPENAQ_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${OPENAQ_BASE}/locations?coordinates=${lat},${lng}&radius=25000&limit=5`;
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const locations = json.results || [];
    if (locations.length === 0) return null;

    let pm25Values = [];
    let pm10Values = [];
    let coords = { lat, lng };

    for (const loc of locations) {
      if (loc.coordinates) {
        coords = { lat: loc.coordinates.latitude, lng: loc.coordinates.longitude };
      }
      const sensors = loc.sensors || [];
      for (const s of sensors) {
        const param = s.parameter?.name;
        if (param === "pm25") {
          try {
            const mRes = await fetch(
              `${OPENAQ_BASE}/sensors/${s.id}/measurements?date_from=${new Date(Date.now() - 86400000).toISOString().split("T")[0]}&limit=24`,
              { headers: { "X-API-Key": apiKey } }
            );
            if (mRes.ok) {
              const mJson = await mRes.json();
              const vals = (mJson.results || []).map((r) => r.value).filter((v) => v != null);
              pm25Values.push(...vals);
            }
          } catch (_) {}
        } else if (param === "pm10") {
          try {
            const mRes = await fetch(
              `${OPENAQ_BASE}/sensors/${s.id}/measurements?date_from=${new Date(Date.now() - 86400000).toISOString().split("T")[0]}&limit=24`,
              { headers: { "X-API-Key": apiKey } }
            );
            if (mRes.ok) {
              const mJson = await mRes.json();
              const vals = (mJson.results || []).map((r) => r.value).filter((v) => v != null);
              pm10Values.push(...vals);
            }
          } catch (_) {}
        }
      }
    }

    const pm25 = pm25Values.length ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length : null;
    const pm10 = pm10Values.length ? pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length : null;

    return { pm25, pm10, coords };
  } catch (_) {
    return null;
  }
}

function getStaticFallback(cityKey) {
  const coords = cityCoordinates[cityKey];
  const pollution = cityPollutionData[cityKey];
  if (!coords) return null;
  if (pollution) {
    return { pm25: pollution.pm25, pm10: pollution.pm10, coords };
  }
  const base = 45;
  return { pm25: base, pm10: Math.round(base * 1.6), coords };
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
    let pm25 = null;
    let pm10 = null;
    let finalCoords = coords;

    // Use static data first for hackathon stability
    const fallback = getStaticFallback(cityKey);
    if (fallback) {
      pm25 = fallback.pm25;
      pm10 = fallback.pm10;
      finalCoords = fallback.coords;
    }

    // Optionally try OpenAQ for real-time data (fallback to static if API fails)
    const openaqData = await fetchOpenAQData(coords.lat, coords.lng);
    if (openaqData && openaqData.pm25 != null && openaqData.pm10 != null) {
      pm25 = openaqData.pm25;
      pm10 = openaqData.pm10;
      if (openaqData.coords) finalCoords = openaqData.coords;
    }

    if (pm25 == null) pm25 = 45;
    if (pm10 == null) pm10 = 78;

    const risk = getRiskLevel(pm25);
    const diseases = getDiseasesByRisk(risk);
    const advisory = getAdvisory(risk);
    const chartData = generateChartData(pm25, pm10);

    const payload = {
      city: normalizedCity,
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm10 * 10) / 10,
      risk,
      diseases,
      coordinates: { lat: finalCoords.lat, lng: finalCoords.lng },
      chartData,
      advisory,
      disclaimer: "For awareness and prevention only. Not medical diagnosis.",
    };

    req.cityCache?.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Temporary service issue." });
  }
});

export { router as cityDataRouter };
