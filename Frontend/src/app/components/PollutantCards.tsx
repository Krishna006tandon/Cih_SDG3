import { Wind, Droplets, Cloud, Flame, Factory, Sun } from "lucide-react";

interface PollutantCardsProps {
  pm25: number;
  pm10: number;
  o3: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  city: string;
}

const pollutantInfo = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³", description: "Fine particles", icon: Wind, color: "#09637E" },
  { key: "pm10", label: "PM10", unit: "µg/m³", description: "Coarse particles", icon: Droplets, color: "#088395" },
  { key: "so2", label: "SO₂", unit: "µg/m³", description: "Sulphur dioxide", icon: Factory, color: "#7c3aed" },
  { key: "co", label: "CO", unit: "µg/m³", description: "Carbon monoxide", icon: Flame, color: "#ef4444" },
  { key: "no2", label: "NO₂", unit: "µg/m³", description: "Nitrogen dioxide", icon: Cloud, color: "#f97316" },
  { key: "o3", label: "O₃", unit: "µg/m³", description: "Ozone", icon: Sun, color: "#eab308" },
];

export function PollutantCards({ pm25, pm10, o3, no2, so2, co, city }: PollutantCardsProps) {
  const values: Record<string, number | null> = { pm25, pm10, o3, no2, so2, co };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30">
      <h2 className="text-lg font-bold text-[#09637E] mb-4">
        Primary Air Pollutants
        <span className="text-sm font-normal text-gray-500 ml-2">({city})</span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pollutantInfo.map((pollutant, index) => {
          const Icon = pollutant.icon;
          const value = values[pollutant.key];
          
          return (
            <div
              key={pollutant.key}
              className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-md transition-all hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: `${pollutant.color}15` }}
              >
                <Icon className="h-6 w-6" style={{ color: pollutant.color }} />
              </div>
              
              <div className="text-2xl font-bold text-gray-800 tabular-nums">
                {value !== null ? Math.round(value) : "N/A"}
              </div>
              
              <div className="text-xs text-gray-500">{pollutant.unit}</div>
              
              <div
                className="text-sm font-medium mt-1"
                style={{ color: pollutant.color }}
              >
                {pollutant.label}
              </div>
              
              <div className="text-xs text-gray-400">{pollutant.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
