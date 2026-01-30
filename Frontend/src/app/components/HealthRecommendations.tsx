import React from "react";
import { Shield, Fan, Car, CircleUserRound, Home, AlertTriangle, Check, X } from "lucide-react";

interface HealthRecommendation {
  airPurifier: string;
  carFilter: string;
  mask: string;
  stayIndoor: string;
}

interface HealthRecommendationsProps {
  aqi: number | null;
  aqiCategory: string;
  recommendations: HealthRecommendation;
}

const recommendationItems = [
  { key: "airPurifier", label: "Air Purifier", icon: Fan, description: "Indoor air filtration" },
  { key: "carFilter", label: "Car Filter", icon: Car, description: "Vehicle AC filter" },
  { key: "mask", label: "N95 Mask", icon: CircleUserRound, description: "Respiratory protection" },
  { key: "stayIndoor", label: "Stay Indoor", icon: Home, description: "Limit outdoor exposure" },
];

function getStatusColor(status: string): { bg: string; text: string; icon: React.ReactNode } {
  switch (status) {
    case "Must":
      return { bg: "bg-red-100", text: "text-red-700", icon: <AlertTriangle className="h-4 w-4" /> };
    case "Turn On":
      return { bg: "bg-red-100", text: "text-red-700", icon: <Check className="h-4 w-4" /> };
    case "Recommended":
      return { bg: "bg-amber-100", text: "text-amber-700", icon: <Check className="h-4 w-4" /> };
    case "Optional":
      return { bg: "bg-green-100", text: "text-green-700", icon: <X className="h-4 w-4" /> };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700", icon: null };
  }
}

export function HealthRecommendations({ aqi, aqiCategory, recommendations }: HealthRecommendationsProps) {
  const values: Record<string, string> = {
    airPurifier: recommendations?.airPurifier || "Optional",
    carFilter: recommendations?.carFilter || "Optional",
    mask: recommendations?.mask || "Optional",
    stayIndoor: recommendations?.stayIndoor || "Optional",
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#09637E]" />
          <h2 className="text-lg font-bold text-[#09637E]">Health Recommendations</h2>
        </div>
        <span className="text-sm text-gray-500">
          Based on current air quality: <span className="font-medium">{aqiCategory}</span> · AQI {aqi ?? "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendationItems.map((item, index) => {
          const Icon = item.icon;
          const status = values[item.key];
          const statusStyle = getStatusColor(status);

          return (
            <div
              key={item.key}
              className={`rounded-xl p-4 text-center transition-all hover:shadow-md ${statusStyle.bg}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-white shadow-sm">
                <Icon className={`h-7 w-7 ${statusStyle.text}`} />
              </div>
              
              <div className={`text-sm font-medium ${statusStyle.text}`}>
                {item.label}
              </div>
              
              <div className={`text-lg font-bold mt-1 flex items-center justify-center gap-1 ${statusStyle.text}`}>
                {statusStyle.icon}
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {aqi !== null && aqi > 150 && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Air quality is unhealthy. Take precautions.
              </p>
              <p className="text-xs text-red-600 mt-1">
                Sensitive groups (elderly, children, people with respiratory conditions) should avoid outdoor activities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default HealthRecommendations;
