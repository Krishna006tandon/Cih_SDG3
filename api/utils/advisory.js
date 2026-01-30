/**
 * City-wise advisory based on risk level
 */
export function getAdvisory(risk) {
  const advisories = {
    High: "Avoid outdoor activities. Wear N95 masks when outside. Children and elderly should stay indoors. Keep windows closed.",
    Medium: "Limit outdoor activities during peak pollution hours. Sensitive individuals should take precautions.",
    Low: "Air quality is acceptable. Normal outdoor activities are fine for most people.",
  };
  return advisories[risk] || advisories.Low;
}
