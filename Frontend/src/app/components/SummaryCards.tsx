import { Wind, Activity, AlertCircle } from "lucide-react";
import { getHealthRisk } from "@/data/indiaData";

interface SummaryCardsProps {
  pm25: number;
  pm10: number;
}

export function SummaryCards({ pm25, pm10 }: SummaryCardsProps) {
  const healthRisk = getHealthRisk(pm25);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* PM2.5 Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#088395]">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-[#7AB2B2] bg-opacity-20 p-3 rounded-lg">
            <Wind className="h-6 w-6 text-[#088395]" />
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">μg/m³</span>
        </div>
        <p className="text-sm text-gray-600 mb-1">PM2.5 Level</p>
        <p className="text-3xl font-bold text-[#09637E]">{pm25}</p>
        <p className="text-xs text-gray-500 mt-2">Fine particulate matter</p>
      </div>

      {/* PM10 Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#088395]">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-[#7AB2B2] bg-opacity-20 p-3 rounded-lg">
            <Activity className="h-6 w-6 text-[#088395]" />
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">μg/m³</span>
        </div>
        <p className="text-sm text-gray-600 mb-1">PM10 Level</p>
        <p className="text-3xl font-bold text-[#09637E]">{pm10}</p>
        <p className="text-xs text-gray-500 mt-2">Coarse particulate matter</p>
      </div>

      {/* Health Risk Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: healthRisk.color }}>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: healthRisk.bgColor }}>
            <AlertCircle className="h-6 w-6" style={{ color: healthRisk.color }} />
          </div>
          <span 
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ 
              backgroundColor: healthRisk.bgColor, 
              color: healthRisk.color 
            }}
          >
            AQI
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">Health Risk</p>
        <p className="text-2xl font-bold" style={{ color: healthRisk.color }}>
          {healthRisk.level}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {pm25 <= 50 && "Air quality is satisfactory"}
          {pm25 > 50 && pm25 <= 100 && "Acceptable for most people"}
          {pm25 > 100 && pm25 <= 150 && "Sensitive groups may be affected"}
          {pm25 > 150 && pm25 <= 200 && "Everyone may experience effects"}
          {pm25 > 200 && pm25 <= 300 && "Health alert for everyone"}
          {pm25 > 300 && "Emergency conditions"}
        </p>
      </div>
    </div>
  );
}