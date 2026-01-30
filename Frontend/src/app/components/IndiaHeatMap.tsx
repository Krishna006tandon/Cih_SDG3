import { MapPin } from "lucide-react";
import { useMemo } from "react";

interface HeatMapPoint {
  city: string;
  lat: number;
  lng: number;
  pm25: number;
  risk: string;
  color: string;
}

interface IndiaHeatMapProps {
  points: HeatMapPoint[];
  selectedCity?: string;
  selectedCoords?: { lat: number; lng: number };
}

// India bounding box - equirectangular projection
const INDIA = {
  minLat: 8,
  maxLat: 35,
  minLng: 68,
  maxLng: 97,
  width: 400,
  height: 480,
};

function projectToSvg(lat: number, lng: number) {
  const x = ((lng - INDIA.minLng) / (INDIA.maxLng - INDIA.minLng)) * INDIA.width * 0.88 + INDIA.width * 0.06;
  const y = INDIA.height - ((lat - INDIA.minLat) / (INDIA.maxLat - INDIA.minLat)) * INDIA.height * 0.88 - INDIA.height * 0.06;
  return { x, y };
}

export function IndiaHeatMap({
  points,
  selectedCity,
  selectedCoords,
}: IndiaHeatMapProps) {
  const projectedPoints = useMemo(() => {
    return points.map((p) => ({
      ...p,
      ...projectToSvg(p.lat, p.lng),
      isSelected:
        selectedCity === p.city ||
        (selectedCoords &&
          Math.abs(selectedCoords.lat - p.lat) < 0.5 &&
          Math.abs(selectedCoords.lng - p.lng) < 0.5),
    }));
  }, [points, selectedCity, selectedCoords]);

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-[#09637E]" />
        <h3 className="text-lg font-semibold text-[#09637E]">India Air Quality Map</h3>
      </div>
      <div className="relative w-full bg-[#EBF4F6] rounded-xl border border-[#7AB2B2]/40 overflow-hidden" style={{ minHeight: 360 }}>
        <svg
          viewBox={`0 0 ${INDIA.width} ${INDIA.height}`}
          className="w-full h-auto"
          style={{ maxHeight: 420 }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* India map region */}
          <rect
            x={INDIA.width * 0.06}
            y={INDIA.height * 0.06}
            width={INDIA.width * 0.88}
            height={INDIA.height * 0.88}
            fill="#7AB2B2"
            fillOpacity={0.08}
            stroke="#088395"
            strokeWidth={2}
            strokeOpacity={0.4}
          />
          {/* City points */}
          {projectedPoints.map((p) => (
            <g key={p.city}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.isSelected ? 12 : 7}
                fill={p.color}
                stroke={p.isSelected ? "#09637E" : "#fff"}
                strokeWidth={p.isSelected ? 3 : 1.5}
                className="transition-all duration-200"
              />
              {p.isSelected && (
                <text
                  x={p.x}
                  y={p.y - 18}
                  textAnchor="middle"
                  fill="#09637E"
                  fontSize="12"
                  fontWeight="600"
                >
                  {p.city} ({p.pm25})
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="flex gap-4 mt-4 justify-center text-sm flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          High
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          Medium
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          Low
        </span>
      </div>
    </div>
  );
}
