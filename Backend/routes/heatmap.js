import { Router } from "express";
import { cityCoordinates } from "../data/cityCoordinates.js";
import { cityPollutionData } from "../data/cityPollutionData.js";
import airVisualClient from "../utils/airVisualClient.js";
import { getRiskLevel, calculateOverallAQI } from "../utils/healthRisk.js";

const router = Router();

function getRiskColor(risk) {
  const colors = { High: "#ef4444", Medium: "#eab308", Low: "#22c55e" };
  return colors[risk] || colors.Low;
}

router.get("/", async (req, res) => {
  try {
    const cacheKey = "heatmap-all";
    const cached = req.heatmapCache?.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Use static data for heatmap to avoid rate limiting
    const points = Object.entries(cityCoordinates).map(([name, coords]) => {
      const pollution = cityPollutionData[name];
      const pm25 = pollution ? pollution.pm25 : 45;
      const pollutants = {
        pm25: pm25,
        pm10: pollution?.pm10 || 78,
        o3: pollution?.o3 || 30,
        no2: pollution?.no2 || 25,
        so2: pollution?.so2 || 10,
        co: pollution?.co || 400
      };
      const aqi = calculateOverallAQI(pollutants);
      const risk = getRiskLevel(pm25, aqi);
      return {
        city: name,
        lat: coords.lat,
        lng: coords.lng,
        pm25,
        aqi,
        risk,
        color: getRiskColor(risk),
      };
    });

    const payload = { points };
    req.heatmapCache?.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Temporary service issue." });
  }
});

export { router as heatmapRouter };
