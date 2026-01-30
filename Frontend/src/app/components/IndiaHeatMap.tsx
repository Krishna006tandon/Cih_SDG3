import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, RefreshCw, Pause, Play, Clock, Activity, AlertTriangle, Wind, Layers, Filter } from "lucide-react";

interface HeatMapPoint {
  city: string;
  lat: number;
  lng: number;
  pm25: number;
  pm10?: number;
  aqi?: number;
  risk: string;
  color: string;
  timestamp?: string;
}

interface IndiaHeatMapProps {
  points: HeatMapPoint[];
  selectedCity?: string;
  selectedCoords?: { lat: number; lng: number };
  onRefresh?: () => void;
}

type PollutantType = "pm25" | "pm10" | "aqi";

declare global {
  interface Window {
    L: any;
  }
}

const AQI_LEGEND = [
  { label: "Good", range: "0-50", color: "#22c55e", riskLevel: "Low Risk", description: "Normal breathing" },
  { label: "Satisfactory", range: "51-100", color: "#84cc16", riskLevel: "Low Risk", description: "Minor breathing discomfort" },
  { label: "Moderate", range: "101-200", color: "#eab308", riskLevel: "Moderate Risk", description: "Asthma irritation" },
  { label: "Poor", range: "201-300", color: "#f97316", riskLevel: "High Risk", description: "Bronchitis, COPD risk" },
  { label: "Very Poor", range: "301-400", color: "#ef4444", riskLevel: "Severe Risk", description: "Respiratory illness" },
  { label: "Severe", range: "400+", color: "#991b1b", riskLevel: "Emergency", description: "Emergency respiratory danger" },
];

const RESPIRATORY_RISKS = {
  "Low": { icon: "✓", text: "Normal breathing", color: "#22c55e" },
  "Medium": { icon: "!", text: "Asthma irritation possible", color: "#eab308" },
  "High": { icon: "⚠", text: "Bronchitis, COPD risk", color: "#ef4444" },
};

export function IndiaHeatMap({
  points,
  selectedCity,
  selectedCoords,
  onRefresh,
}: IndiaHeatMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [nextRefresh, setNextRefresh] = useState<number>(300);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [pollutantType, setPollutantType] = useState<PollutantType>("aqi");
  const [showLegend, setShowLegend] = useState(true);
  const animationFrameRef = useRef<number>();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Load Leaflet scripts dynamically
  useEffect(() => {
    const loadScripts = async () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        initializeMap();
        return;
      }

      // Load Leaflet CSS
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);

      // Load Leaflet JS
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletScript.async = true;
      
      leafletScript.onload = () => {
        // Load Leaflet Heat plugin
        const heatScript = document.createElement('script');
        heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
        heatScript.async = true;
        heatScript.onload = () => {
          initializeMap();
        };
        document.body.appendChild(heatScript);
      };
      
      document.body.appendChild(leafletScript);
    };

    loadScripts();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const L = window.L;
    
    // Initialize map centered on India
    const map = L.map(mapContainerRef.current, {
      center: [22.5, 78.5],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Dark themed tile layer for better heatmap visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;
    setIsLoading(false);
    
    // Update heatmap with initial data
    updateHeatmap();
  };

  const updateHeatmap = useCallback(() => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Prepare heatmap data based on selected pollutant type
    const heatData = points.map(point => {
      let value = 0;
      let maxValue = 500;
      
      switch (pollutantType) {
        case "pm25":
          value = point.pm25;
          maxValue = 300;
          break;
        case "pm10":
          value = point.pm10 || point.pm25 * 1.7;
          maxValue = 500;
          break;
        case "aqi":
        default:
          value = point.aqi || point.pm25;
          maxValue = 500;
          break;
      }
      
      const intensity = Math.min(value / maxValue, 1);
      return [point.lat, point.lng, intensity];
    });

    // Create heat layer with custom gradient matching AQI colors
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 45,
      blur: 25,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: '#22c55e',   // Good (Green)
        0.1: '#22c55e',
        0.2: '#84cc16',   // Satisfactory (Light Green)
        0.3: '#84cc16',
        0.4: '#eab308',   // Moderate (Yellow)
        0.5: '#f97316',   // Poor (Orange)
        0.6: '#f97316',
        0.7: '#ef4444',   // Very Poor (Red)
        0.8: '#ef4444',
        0.9: '#991b1b',   // Severe (Dark Red)
        1.0: '#7f1d1d',   // Hazardous
      }
    }).addTo(map);

    // Add enhanced markers for each city
    points.forEach((point, index) => {
      const isSelected = selectedCity === point.city ||
        (selectedCoords &&
          Math.abs(selectedCoords.lat - point.lat) < 0.5 &&
          Math.abs(selectedCoords.lng - point.lng) < 0.5);

      // Create custom pulsing icon
      const pulseColor = point.risk === 'High' ? '#ef4444' : 
                         point.risk === 'Medium' ? '#f59e0b' : '#22c55e';
      
      const riskInfo = RESPIRATORY_RISKS[point.risk as keyof typeof RESPIRATORY_RISKS] || RESPIRATORY_RISKS.Low;
      const currentTime = new Date().toLocaleTimeString();
      const aqiValue = point.aqi || Math.round(point.pm25);
      
      const pulseIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div class="pulse-container" style="--pulse-color: ${pulseColor}; --delay: ${index * 0.1}s">
            <div class="pulse-ring"></div>
            <div class="pulse-ring pulse-ring-2"></div>
            <div class="pulse-core" style="background: ${pulseColor}"></div>
            ${isSelected ? `<div class="pulse-label">${point.city}<br><span class="aqi-value">AQI: ${aqiValue}</span></div>` : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Enhanced popup with detailed health info
      const marker = L.marker([point.lat, point.lng], { icon: pulseIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 220px; font-family: 'Segoe UI', Arial, sans-serif; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${pulseColor}; box-shadow: 0 0 8px ${pulseColor};"></div>
              <h3 style="margin: 0; color: #09637E; font-size: 16px; font-weight: 700;">${point.city}</h3>
            </div>
            
            <div style="background: linear-gradient(135deg, ${pulseColor}22, ${pulseColor}11); border-radius: 12px; padding: 12px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Air Quality Index</span>
                <span style="background: ${pulseColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">${point.risk} Risk</span>
              </div>
              <div style="font-size: 32px; font-weight: 800; color: ${pulseColor}; line-height: 1;">${aqiValue}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <div style="background: #f8fafc; border-radius: 8px; padding: 8px; text-align: center;">
                <div style="font-size: 10px; color: #94a3b8; margin-bottom: 2px;">PM2.5</div>
                <div style="font-size: 14px; font-weight: 700; color: #334155;">${point.pm25} <span style="font-size: 9px; color: #94a3b8;">µg/m³</span></div>
              </div>
              <div style="background: #f8fafc; border-radius: 8px; padding: 8px; text-align: center;">
                <div style="font-size: 10px; color: #94a3b8; margin-bottom: 2px;">PM10</div>
                <div style="font-size: 14px; font-weight: 700; color: #334155;">${point.pm10 || Math.round(point.pm25 * 1.7)} <span style="font-size: 9px; color: #94a3b8;">µg/m³</span></div>
              </div>
            </div>
            
            <div style="background: ${riskInfo.color}15; border-left: 3px solid ${riskInfo.color}; border-radius: 0 8px 8px 0; padding: 10px; margin-bottom: 8px;">
              <div style="font-size: 10px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Respiratory Risk</div>
              <div style="font-size: 13px; font-weight: 600; color: ${riskInfo.color};">${riskInfo.text}</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
              <span>⏱ Last Updated</span>
              <span style="font-weight: 600;">${currentTime}</span>
            </div>
          </div>
        `, { maxWidth: 280 });

      markersRef.current.push(marker);

      // Auto-open popup for selected city
      if (isSelected) {
        marker.openPopup();
        map.setView([point.lat, point.lng], 7, { animate: true });
      }
    });

    setLastUpdated(new Date().toLocaleTimeString());
    setNextRefresh(300);
  }, [points, selectedCity, selectedCoords, pollutantType]);

  // Update heatmap when points change
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      updateHeatmap();
    }
  }, [points, selectedCity, selectedCoords, isLoading, updateHeatmap, pollutantType]);

  // Auto-refresh timer (every 5 minutes)
  useEffect(() => {
    if (!autoRefresh) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      return;
    }

    refreshIntervalRef.current = setInterval(() => {
      setNextRefresh(prev => {
        if (prev <= 1) {
          if (onRefresh) onRefresh();
          updateHeatmap();
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, onRefresh, updateHeatmap]);

  // Animation loop for continuous pulsing effect
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      // Animation is handled by CSS, this is just for potential future enhancements
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]);

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    updateHeatmap();
    setNextRefresh(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-[#7AB2B2]/30 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#09637E] to-[#088395] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">India Air Quality Heatmap</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-white/80">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  LIVE DATA
                </span>
                <span className="text-white/50">|</span>
                <span className="text-xs text-white/70">SDG-3 Aligned</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Pollutant Type Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              {(['aqi', 'pm25', 'pm10'] as PollutantType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setPollutantType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    pollutantType === type
                      ? 'bg-white text-[#09637E] shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
            
            {/* Auto-refresh Timer */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-white/70" />
              <span className="text-xs text-white/80 font-medium">
                {autoRefresh ? formatTime(nextRefresh) : 'Paused'}
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-1 rounded-md transition-colors ${autoRefresh ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}
                title={autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh'}
              >
                {autoRefresh ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            {/* Legend Toggle */}
            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`p-2 rounded-lg transition-colors ${showLegend ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}
              title="Toggle legend"
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: 500 }}>
        {isLoading && (
          <div className="absolute inset-0 bg-[#0a2540] flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#088395] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80 font-medium">Initializing map...</p>
              <p className="text-white/50 text-sm mt-1">Loading real-time data</p>
            </div>
          </div>
        )}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full"
          style={{ background: '#0a2540' }}
        />
        
        {/* Floating Legend */}
        {showLegend && !isLoading && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 z-[1000] max-w-[280px] border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[#09637E] flex items-center gap-2">
                <Activity className="h-4 w-4" />
                AQI Scale & Health Risk
              </h4>
            </div>
            <div className="space-y-2">
              {AQI_LEGEND.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs group hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{item.label}</span>
                      <span className="text-gray-400 text-[10px]">{item.range}</span>
                    </div>
                    <div className="text-gray-500 text-[10px] truncate">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span>Click markers for detailed health info</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Overlay */}
        {!isLoading && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 z-[1000] border border-gray-100">
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center">
                <div className="text-gray-500 mb-0.5">Cities</div>
                <div className="text-lg font-bold text-[#09637E]">{points.length}</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-gray-500 mb-0.5">High Risk</div>
                <div className="text-lg font-bold text-red-500">
                  {points.filter(p => p.risk === 'High').length}
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-gray-500 mb-0.5">Type</div>
                <div className="text-lg font-bold text-[#088395]">{pollutantType.toUpperCase()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick Risk Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-700 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              High Risk: Emergency
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-700 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Medium: Caution
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Low: Safe
            </span>
          </div>
          
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Wind className="h-3.5 w-3.5" />
            <span>Last updated: <span className="font-medium text-gray-700">{lastUpdated || 'Loading...'}</span></span>
          </div>
        </div>
      </div>

      {/* Custom CSS for pulse markers */}
      <style>{`
        .custom-pulse-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .pulse-container {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--pulse-color);
          animation: pulseRing 2s ease-out infinite;
          animation-delay: var(--delay, 0s);
          opacity: 0;
        }
        
        .pulse-ring-2 {
          animation-delay: calc(var(--delay, 0s) + 0.5s);
        }
        
        .pulse-core {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          box-shadow: 0 0 20px var(--pulse-color), 0 0 40px var(--pulse-color);
          animation: pulseCore 2s ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          z-index: 1;
        }
        
        .pulse-label {
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(9, 99, 126, 0.95);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          z-index: 100;
        }
        
        .pulse-label .aqi-value {
          font-size: 10px;
          color: #7AB2B2;
        }
        
        @keyframes pulseRing {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes pulseCore {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px var(--pulse-color), 0 0 40px var(--pulse-color);
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 30px var(--pulse-color), 0 0 60px var(--pulse-color);
          }
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .leaflet-popup-tip {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .leaflet-container {
          font-family: 'Segoe UI', Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
