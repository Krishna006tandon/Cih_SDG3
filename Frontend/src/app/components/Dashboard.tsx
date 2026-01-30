import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, RefreshCw, Activity, Filter, Calendar, Wind, MapPin, Heart, Eye, Brain } from "lucide-react";
import { SummaryCards } from "./SummaryCards";
import { DiseaseCards } from "./DiseaseCards";
import { ChartsBlock } from "./ChartsBlock";
import { IndiaHeatMap } from "./IndiaHeatMap";
import { AdvisoryBlock } from "./AdvisoryBlock";
import { AQIDisplay } from "./AQIDisplay";
import { PollutantCards } from "./PollutantCards";
import { HealthRecommendations } from "./HealthRecommendations";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

type PollutantType = "pm25" | "pm10" | "aqi";

type TimeRange = "1h" | "6h" | "24h" | "7d";

interface DetailedDisease {
  name: string;
  icon: string;
  threshold: number;
  risk: string;
}

interface HealthRecommendation {
  airPurifier: string;
  carFilter: string;
  mask: string;
  stayIndoor: string;
}

interface DashboardData {
  state: string;
  city: string;
  area?: string;
  pm25: number;
  pm10: number;
  o3: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  aqi: number | null;
  aqiCategory: string;
  aqiColor: string;
  risk: string;
  diseases: string[];
  detailedDiseases: DetailedDisease[];
  healthRecommendations: HealthRecommendation;
  coordinates: { lat: number; lng: number };
  chartData: { time: string; pm25: number; pm10: number }[];
  advisory: string;
  disclaimer: string;
  lastUpdated: string;
  healthInsights?: HealthInsights;
  source?: string;
  fallbackUsed?: boolean;
  locationType?: string;
  locationAttempted?: string;
}

interface HeatMapData {
  points: {
    city: string;
    lat: number;
    lng: number;
    pm25: number;
    pm10?: number;
    aqi?: number;
    risk: string;
    color: string;
    timestamp?: string;
  }[];
}

interface HealthInsights {
  vulnerablePopulation: {
    children: { percentage: number; healthRisks: string[] };
    elderly: { percentage: number; healthRisks: string[] };
    pregnant: { percentage: number; healthRisks: string[] };
  };
  seasonalVariations: { spring: string; summer: string; monsoon: string; winter: string };
  mortalityProjections: { baseline: number; poorAqi: number; incrementPercentage: number };
  healthcareUtilization: { hospitalAdmissions: number; opdVisits: number; respiratory: string };
  policyImplications: {
    transportRestrictions: string;
    industrialControls: string;
    healthAlerts: string;
    publicAwareness: string;
  };
}

interface DashboardProps {
  state: string;
  city: string;
  area?: string;
  onBack: () => void;
}

export function Dashboard({ state, city, area, onBack }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>("aqi");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const requestBody: any = { state, city };
      if (area) {
        requestBody.area = area;
      }
      
      const cityRes = await fetch(`${API_BASE}/city`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!cityRes.ok) {
        const err = await cityRes.json().catch(() => ({}));
        setError(err.error || "City not supported.");
        return;
      }

      const cityData = await cityRes.json();
      setData(cityData);

      let heatmap: HeatMapData | null = null;
      try {
        const heatmapRes = await fetch(`${API_BASE}/heatmap`);
        if (heatmapRes.ok) heatmap = await heatmapRes.json();
      } catch (_) {}

      setHeatmapData(heatmap);
    } catch {
      setError("Temporary service issue. Ensure backend is running on port 5000.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [city]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleHeatmapRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-16 w-16 text-[#088395] animate-spin mx-auto mb-4" />
          <p className="text-[#09637E] font-medium">Loading health dashboard...</p>
          <p className="text-sm text-[#088395] mt-1">Analyzing air quality impact on SDG-3</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center animate-scale-in">
          <p className="text-red-600 font-medium mb-4">{error || "Something went wrong."}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-[#09637E] text-white px-6 py-3 rounded-xl hover:bg-[#088395] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBF4F6] pb-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#7AB2B2]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#088395]/15 rounded-full blur-3xl" />
      </div>

      {/* Enhanced Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-[#7AB2B2]/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#09637E] hover:text-[#088395] transition-colors font-medium p-2 rounded-lg hover:bg-[#088395]/5"
              >
                <ArrowLeft className="h-5 w-5" />
                Change Location
              </button>
              <div className="h-6 w-px bg-[#7AB2B2]/30 hidden sm:block"></div>
              <div>
                <h1 className="text-xl font-bold text-[#09637E] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#088395]" />
                  {area ? `${area}, ${data.city}` : data.city} Health Dashboard
                  {area && (
                    <span className="text-sm font-normal text-[#088395] bg-[#088395]/10 px-2 py-1 rounded-full ml-2">
                      Area Level
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-[#088395] font-medium bg-[#088395]/10 px-2.5 py-0.5 rounded-full">
                    SDG-3 Aligned
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    LIVE DATA
                  </span>
                  {area && (
                    <span className="text-xs text-[#088395] bg-[#088395]/10 px-2 py-0.5 rounded-full">
                      Precise {area} data
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isRefreshing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#088395] text-white hover:bg-[#09637E] shadow-md hover:shadow-lg'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* SDG-3 Banner */}
        <div className="bg-gradient-to-r from-[#09637E] to-[#088395] rounded-2xl p-5 mb-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">SDG-3: Good Health and Well-Being</h2>
                <p className="text-white/80 text-sm">Monitoring air quality impact on respiratory health across India</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>Real-time Monitoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Brain className="h-4 w-4" />
                <span>Health Risk Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Controls */}
        <div className="bg-white rounded-2xl p-5 shadow-lg mb-8 border border-[#7AB2B2]/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-[#09637E] flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Dashboard Controls
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Pollutant Type Filter */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Pollutant Type</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['aqi', 'pm25', 'pm10'] as PollutantType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedPollutant(type)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                        selectedPollutant === type
                          ? 'bg-[#088395] text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Time Range Filter */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Time Range</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['1h', '6h', '24h', '7d'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        selectedTimeRange === range
                          ? 'bg-[#088395] text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="space-y-8">
          {/* AQI Display with gauge */}
          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]">
            <AQIDisplay
              aqi={data.aqi}
              aqiCategory={data.aqiCategory}
              aqiColor={data.aqiColor}
              city={data.city}
              area={data.area}
              source={data.source}
              fallbackUsed={data.fallbackUsed}
            />
          </div>

          {/* All Pollutants */}
          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.1s" }}>
            <PollutantCards
              pm25={data.pm25}
              pm10={data.pm10}
              o3={data.o3}
              no2={data.no2}
              so2={data.so2}
              co={data.co}
              city={data.city}
            />
          </div>

          {/* Health Recommendations */}
          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.15s" }}>
            <HealthRecommendations
              aqi={data.aqi}
              aqiCategory={data.aqiCategory}
              recommendations={data.healthRecommendations}
            />
          </div>

          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.2s" }}>
            <SummaryCards
              pm25={data.pm25}
              pm10={data.pm10}
              risk={data.risk}
              city={data.city}
            />
          </div>
          
          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.25s" }}>
            <DiseaseCards diseases={data.diseases} risk={data.risk} detailedDiseases={data.detailedDiseases} />
          </div>
          
          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.3s" }}>
            <ChartsBlock chartData={data.chartData} />
          </div>
          
          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.35s" }}>
            <IndiaHeatMap
              points={heatmapData?.points ?? [{ 
                city: data.city, 
                lat: data.coordinates.lat, 
                lng: data.coordinates.lng, 
                pm25: data.pm25, 
                pm10: data.pm10, 
                aqi: data.aqi || undefined, 
                risk: data.risk, 
                color: data.risk === "High" ? "#ef4444" : data.risk === "Medium" ? "#eab308" : "#22c55e" 
              }]}
              selectedCity={data.city}
              selectedCoords={data.coordinates}
              onRefresh={handleHeatmapRefresh}
            />
          </div>
          
          <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.4s" }}>
            <AdvisoryBlock advisory={data.advisory} disclaimer={data.disclaimer} />
          </div>
        </div>
      </main>
    </div>
  );
}
