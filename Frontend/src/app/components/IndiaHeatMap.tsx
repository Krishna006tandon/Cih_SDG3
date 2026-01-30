import { useState } from "react";
import { MapPin } from "lucide-react";
import { citiesData, getHealthRisk } from "@/data/indiaData";

export function IndiaHeatMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Simplified India map representation using relative positioning
  const getCityPosition = (lat: number, lng: number) => {
    // Normalize coordinates to fit within container (simplified projection)
    // India bounds: lat ~8-35, lng ~68-97
    const x = ((lng - 68) / (97 - 68)) * 100;
    const y = ((35 - lat) / (35 - 8)) * 100;
    return { x, y };
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-[#09637E] mb-2">India Air Quality Heat Map</h3>
        <p className="text-sm text-gray-600">Hover over cities to view detailed pollution data</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-700">Good (0-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-700">Moderate (51-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-gray-700">Unhealthy (101-150)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-700">Very Unhealthy (151+)</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[500px] bg-gradient-to-br from-[#EBF4F6] to-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {/* India outline background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="h-32 w-32 text-gray-200" />
        </div>

        {/* City markers */}
        {citiesData.map((city) => {
          const pos = getCityPosition(city.lat, city.lng);
          const risk = getHealthRisk(city.pm25);
          const isHovered = hoveredCity === city.name;

          return (
            <div
              key={city.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isHovered ? 50 : 10
              }}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Marker dot */}
              <div
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  isHovered ? 'scale-150' : 'scale-100'
                }`}
                style={{ backgroundColor: risk.color }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] border border-gray-200">
                  <p className="font-semibold text-[#09637E] mb-2">{city.name}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">PM2.5:</span>
                      <span className="font-medium text-gray-900">{city.pm25} μg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PM10:</span>
                      <span className="font-medium text-gray-900">{city.pm10} μg/m³</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-200 mt-2">
                      <span className="text-gray-600">Risk:</span>
                      <span
                        className="font-medium px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: risk.bgColor,
                          color: risk.color
                        }}
                      >
                        {risk.level}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}