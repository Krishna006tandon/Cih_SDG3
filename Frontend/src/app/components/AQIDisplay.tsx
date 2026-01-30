import { Activity } from "lucide-react";

interface AQIDisplayProps {
  aqi: number | null;
  aqiCategory: string;
  aqiColor: string;
  city: string;
}

const aqiRanges = [
  { label: "Good", max: 50, color: "#22c55e" },
  { label: "Satisfactory", max: 100, color: "#84cc16" },
  { label: "Moderate", max: 200, color: "#eab308" },
  { label: "Poor", max: 300, color: "#f97316" },
  { label: "Very Poor", max: 400, color: "#ef4444" },
  { label: "Severe", max: 500, color: "#991b1b" },
];

function getAQIPercentage(aqi: number | null): number {
  if (aqi === null) return 0;
  // Scale: 0-500 mapped to 0-100%
  return Math.min((aqi / 500) * 100, 100);
}

export function AQIDisplay({ aqi, aqiCategory, aqiColor, city }: AQIDisplayProps) {
  const percentage = getAQIPercentage(aqi);

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* AQI Value Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-[#09637E]" />
            <span className="text-sm font-medium text-[#09637E]">Live AQI</span>
          </div>
          
          <div
            className="text-6xl font-bold mb-2 tabular-nums"
            style={{ color: aqiColor }}
          >
            {aqi ?? "N/A"}
          </div>
          
          <div className="text-sm text-gray-500 mb-2">(AQI-IN)</div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Air Quality is</span>
            <span
              className="font-bold px-3 py-1 rounded-full text-white text-sm"
              style={{ backgroundColor: aqiColor }}
            >
              {aqiCategory}
            </span>
          </div>
        </div>

        {/* Gauge Section */}
        <div className="flex-1">
          <h3 className="text-center text-sm font-medium text-gray-600 mb-4">
            {city} Air Quality Index
          </h3>
          
          {/* AQI Scale Bar */}
          <div className="relative">
            {/* Scale Labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
            </div>
            
            {/* Gradient Bar */}
            <div className="h-6 rounded-full overflow-hidden flex">
              {aqiRanges.map((range, i) => (
                <div
                  key={range.label}
                  className="flex-1 transition-all"
                  style={{ backgroundColor: range.color }}
                />
              ))}
            </div>
            
            {/* Pointer */}
            {aqi !== null && (
              <div
                className="absolute -bottom-2 transform -translate-x-1/2 transition-all duration-500"
                style={{ left: `${percentage}%` }}
              >
                <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800" />
              </div>
            )}
            
            {/* Category Labels */}
            <div className="flex justify-between text-xs mt-3">
              {aqiRanges.map((range) => (
                <span
                  key={range.label}
                  className="flex-1 text-center font-medium"
                  style={{ color: range.color }}
                >
                  {range.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AQIDisplay;
