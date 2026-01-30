/**
 * Health risk calculation based on PM2.5 (SDG-3 core)
 * PM2.5 > 60 = High, 30-60 = Medium, < 30 = Low
 */
export function getRiskLevel(pm25) {
  const val = Number(pm25);
  if (isNaN(val) || val < 0) return "Low";
  if (val > 60) return "High";
  if (val >= 30) return "Medium";
  return "Low";
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
