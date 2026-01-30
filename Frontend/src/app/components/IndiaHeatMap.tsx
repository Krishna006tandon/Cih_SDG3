import { useEffect, useRef, useState } from "react";
import { Globe, RefreshCw, Pause, Play } from "lucide-react";

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

declare global {
  interface Window {
    L: any;
  }
}

export function IndiaHeatMap({
  points,
  selectedCity,
  selectedCoords,
}: IndiaHeatMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const animationFrameRef = useRef<number>();

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

  const updateHeatmap = () => {
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

    // Prepare heatmap data
    const heatData = points.map(point => {
      // Normalize AQI/PM2.5 value for heat intensity (0-1 range)
      const intensity = Math.min(point.pm25 / 300, 1);
      return [point.lat, point.lng, intensity];
    });

    // Create heat layer with custom gradient
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 40,
      blur: 30,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: '#00ff00',  // Green - Good
        0.2: '#7cfc00',  // Light green
        0.4: '#ffff00',  // Yellow - Moderate
        0.6: '#ffa500',  // Orange - Unhealthy for sensitive
        0.8: '#ff4500',  // Red-Orange - Unhealthy
        1.0: '#8b0000',  // Dark Red - Hazardous
      }
    }).addTo(map);

    // Add animated markers for each city
    points.forEach((point, index) => {
      const isSelected = selectedCity === point.city ||
        (selectedCoords &&
          Math.abs(selectedCoords.lat - point.lat) < 0.5 &&
          Math.abs(selectedCoords.lng - point.lng) < 0.5);

      // Create custom pulsing icon
      const pulseColor = point.risk === 'High' ? '#ef4444' : 
                         point.risk === 'Medium' ? '#f59e0b' : '#22c55e';
      
      const pulseIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div class="pulse-container" style="--pulse-color: ${pulseColor}; --delay: ${index * 0.1}s">
            <div class="pulse-ring"></div>
            <div class="pulse-ring pulse-ring-2"></div>
            <div class="pulse-core" style="background: ${pulseColor}"></div>
            ${isSelected ? `<div class="pulse-label">${point.city}<br><span class="aqi-value">AQI: ${Math.round(point.pm25)}</span></div>` : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([point.lat, point.lng], { icon: pulseIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #09637E;">${point.city}</h3>
            <div style="background: ${pulseColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
              PM2.5: ${point.pm25} µg/m³
            </div>
            <p style="margin: 8px 0 0 0; color: ${pulseColor}; font-weight: 600;">
              Risk: ${point.risk}
            </p>
          </div>
        `);

      markersRef.current.push(marker);

      // Auto-open popup for selected city
      if (isSelected) {
        marker.openPopup();
        map.setView([point.lat, point.lng], 7, { animate: true });
      }
    });

    setLastUpdated(new Date().toLocaleTimeString());
  };

  // Update heatmap when points change
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      updateHeatmap();
    }
  }, [points, selectedCity, selectedCoords, isLoading]);

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
    updateHeatmap();
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-[#09637E] animate-pulse" />
          <h3 className="text-lg font-semibold text-[#09637E]">Real-Time India AQI Heatmap</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-2 text-xs bg-[#088395]/10 text-[#088395] rounded-full hover:bg-[#088395]/20 transition-colors"
            title={isAnimating ? "Pause animations" : "Play animations"}
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 text-xs bg-[#088395]/10 text-[#088395] rounded-full hover:bg-[#088395]/20 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden" style={{ height: 450 }}>
        {isLoading && (
          <div className="absolute inset-0 bg-[#0a2540] flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#088395] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80">Loading map...</p>
            </div>
          </div>
        )}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full"
          style={{ background: '#0a2540' }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        {/* Legend */}
        <div className="flex gap-4 text-sm flex-wrap">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-600 shadow-lg shadow-red-500/30 animate-pulse" />
            <span className="text-gray-700 font-medium">High</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 animate-pulse" />
            <span className="text-gray-700 font-medium">Medium</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 animate-pulse" />
            <span className="text-gray-700 font-medium">Low</span>
          </span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated: {lastUpdated}
          </span>
        )}
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
