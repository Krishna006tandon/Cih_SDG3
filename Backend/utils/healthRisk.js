/**
 * Indian National Air Quality Index (NAQI) Calculation
 * Reference: Central Pollution Control Board (CPCB), India
 * https://cpcb.nic.in/National-Air-Quality-Index/
 */

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

// Indian AQI breakpoints for O3 (µg/m³) - 8-hour average
const O3_BREAKPOINTS = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
  { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
  { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
  { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
];

// Indian AQI breakpoints for NO2 (µg/m³) - 24-hour average
const NO2_BREAKPOINTS = [
  { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
  { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
  { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
  { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
  { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
  { cLow: 401, cHigh: 800, iLow: 401, iHigh: 500 },
];

// Indian AQI breakpoints for SO2 (µg/m³) - 24-hour average
const SO2_BREAKPOINTS = [
  { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
  { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
  { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
  { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
  { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
  { cLow: 1601, cHigh: 2400, iLow: 401, iHigh: 500 },
];

// Indian AQI breakpoints for CO (mg/m³) - 8-hour average
const CO_BREAKPOINTS = [
  { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
  { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
  { cLow: 2.1, cHigh: 10, iLow: 101, iHigh: 200 },
  { cLow: 10.1, cHigh: 17, iLow: 201, iHigh: 300 },
  { cLow: 17.1, cHigh: 34, iLow: 301, iHigh: 400 },
  { cLow: 34.1, cHigh: 50, iLow: 401, iHigh: 500 },
];

/**
 * Calculate AQI for a single pollutant using linear interpolation
 */
function calculatePollutantAQI(concentration, breakpoints) {
  if (concentration == null || isNaN(concentration) || concentration < 0) return null;
  
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }
  
  // If above highest breakpoint, return max AQI
  const lastBp = breakpoints[breakpoints.length - 1];
  if (concentration > lastBp.cHigh) {
    return 500;
  }
  return null;
}

/**
 * Calculate individual AQI values for each pollutant
 */
export function calculatePollutantAQIs(pollutants) {
  const { pm25, pm10, o3, no2, so2, co } = pollutants;
  
  return {
    pm25: calculatePollutantAQI(pm25, PM25_BREAKPOINTS),
    pm10: calculatePollutantAQI(pm10, PM10_BREAKPOINTS),
    o3: calculatePollutantAQI(o3, O3_BREAKPOINTS),
    no2: calculatePollutantAQI(no2, NO2_BREAKPOINTS),
    so2: calculatePollutantAQI(so2, SO2_BREAKPOINTS),
    co: co != null ? calculatePollutantAQI(co / 1000, CO_BREAKPOINTS) : null, // Convert µg/m³ to mg/m³
  };
}

/**
 * Calculate overall AQI (US-AQI) - the highest individual pollutant AQI
 */
export function calculateOverallAQI(pollutants) {
  const aqis = calculatePollutantAQIs(pollutants);
  const validAQIs = Object.values(aqis).filter(v => v != null);
  
  if (validAQIs.length === 0) return null;
  return Math.max(...validAQIs);
}

/**
 * Get AQI category based on AQI value (Indian NAQI standard)
 */
export function getAQICategory(aqi) {
  if (aqi == null) return { category: "Unknown", color: "#9ca3af" };
  if (aqi <= 50) return { category: "Good", color: "#22c55e" };
  if (aqi <= 100) return { category: "Satisfactory", color: "#84cc16" };
  if (aqi <= 200) return { category: "Moderate", color: "#eab308" };
  if (aqi <= 300) return { category: "Poor", color: "#f97316" };
  if (aqi <= 400) return { category: "Very Poor", color: "#ef4444" };
  return { category: "Severe", color: "#991b1b" };
}

/**
 * Health risk calculation based on PM2.5 or AQI (SDG-3 core)
 * PM2.5 > 60 = High, 30-60 = Medium, < 30 = Low
 * AQI > 100 = High, 50-100 = Medium, < 50 = Low
 */
export function getRiskLevel(pm25, aqi) {
  // If AQI is provided, use it for risk calculation
  if (aqi != null) {
    const aqiVal = Number(aqi);
    if (isNaN(aqiVal) || aqiVal < 0) return "Low";
    if (aqiVal > 100) return "High";
    if (aqiVal >= 50) return "Medium";
    return "Low";
  }
  
  // Fallback to PM2.5 if AQI not available
  const val = Number(pm25);
  if (isNaN(val) || val < 0) return "Low";
  if (val > 60) return "High";
  if (val >= 30) return "Medium";
  return "Low";
}

/**
 * Get risk level from AQI
 */
export function getRiskFromAQI(aqi) {
  if (aqi == null) return "Low";
  if (aqi <= 50) return "Low";
  if (aqi <= 100) return "Low";
  if (aqi <= 150) return "Medium";
  if (aqi <= 200) return "High";
  return "High";
}

/**
 * Disease impact mapping based on risk level
 */
export function getDiseasesByRisk(risk) {
  const mapping = {
    High: ["Asthma", "COPD", "Heart disease", "Stroke"],
    Medium: ["Bronchitis", "Allergies"],
    Low: ["Minimal impact"],
  };
  return mapping[risk] || mapping.Low;
}

/**
 * Get detailed diseases with risk levels for each
 */
export function getDetailedDiseases(aqi) {
  const diseases = [
    { name: "Headaches", icon: "brain", threshold: 100 },
    { name: "Eye Irritation", icon: "eye", threshold: 100 },
    { name: "Pregnancy & Infants", icon: "baby", threshold: 50 },
    { name: "Asthma", icon: "lungs", threshold: 100 },
    { name: "Heart Issues", icon: "heart", threshold: 150 },
    { name: "Allergies", icon: "flower", threshold: 50 },
    { name: "Sinus", icon: "nose", threshold: 100 },
    { name: "Cold/Flu", icon: "thermometer", threshold: 100 },
    { name: "Chronic (COPD)", icon: "wind", threshold: 150 },
  ];

  return diseases.map(d => {
    let risk = "Low";
    if (aqi >= d.threshold + 100) risk = "High";
    else if (aqi >= d.threshold) risk = "Medium";
    return { ...d, risk };
  });
}

/**
 * Get health recommendations based on AQI
 */
export function getHealthRecommendations(aqi) {
  if (aqi == null) return {};

  const recommendations = {
    airPurifier: aqi > 100 ? "Turn On" : "Optional",
    carFilter: aqi > 100 ? "Must" : "Recommended",
    mask: aqi > 150 ? "Must" : aqi > 100 ? "Recommended" : "Optional",
    stayIndoor: aqi > 150 ? "Must" : aqi > 100 ? "Recommended" : "Optional",
  };

  return recommendations;
}
