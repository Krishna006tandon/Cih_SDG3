// Vercel API route for heatmap data
// This replicates the backend heatmap functionality

import { cityCoordinates } from '../data/cityCoordinates.js';
import { cityPollutionData } from '../data/cityPollutionData.js';

function getRiskColor(risk) {
  const colors = { High: "#ef4444", Medium: "#eab308", Low: "#22c55e" };
  return colors[risk] || colors.Low;
}

// Simple risk level function
function getRiskLevel(pm25, aqi) {
  if (aqi <= 100) return "Low";
  if (aqi <= 200) return "Medium";
  return "High";
}

// Simple AQI calculation
function calculateOverallAQI(pollutants) {
  const pm25Aqi = Math.round((pollutants.pm25 / 100) * 100);
  const pm10Aqi = Math.round((pollutants.pm10 / 150) * 100);
  return Math.max(pm25Aqi, pm10Aqi, 20);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
    res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Temporary service issue." });
  }
}