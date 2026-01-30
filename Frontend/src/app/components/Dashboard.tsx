import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SummaryCards } from "./SummaryCards";
import { DiseaseCards } from "./DiseaseCards";
import { ChartsBlock } from "./ChartsBlock";
import { IndiaHeatMap } from "./IndiaHeatMap";
import { AdvisoryBlock } from "./AdvisoryBlock";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface DashboardData {
  city: string;
  pm25: number;
  pm10: number;
  risk: string;
  diseases: string[];
  coordinates: { lat: number; lng: number };
  chartData: { time: string; pm25: number; pm10: number }[];
  advisory: string;
  disclaimer: string;
}

interface HeatMapData {
  points: {
    city: string;
    lat: number;
    lng: number;
    pm25: number;
    risk: string;
    color: string;
  }[];
}

interface DashboardProps {
  state: string;
  city: string;
  onBack: () => void;
}

export function Dashboard({ state, city, onBack }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const cityRes = await fetch(`${API_BASE}/city`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });

        if (cancelled) return;

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

        if (cancelled) return;
        setHeatmapData(heatmap);
      } catch {
        if (!cancelled) setError("Temporary service issue. Ensure backend is running on port 5000.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [city]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-16 w-16 text-[#088395] animate-spin mx-auto mb-4" />
          <p className="text-[#09637E] font-medium">Loading health dashboard...</p>
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#7AB2B2]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#088395]/15 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-[#7AB2B2]/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#09637E] hover:text-[#088395] transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Change Location
          </button>
          <h1 className="text-xl font-bold text-[#09637E]">{data.city} Health Dashboard</h1>
          <span className="text-sm text-[#088395] font-medium">SDG-3</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10 space-y-8">
        <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]">
          <SummaryCards
            pm25={data.pm25}
            pm10={data.pm10}
            risk={data.risk}
            city={data.city}
          />
        </div>
        <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.15s" }}>
          <DiseaseCards diseases={data.diseases} risk={data.risk} />
        </div>
        <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.25s" }}>
          <ChartsBlock chartData={data.chartData} />
        </div>
        <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.35s" }}>
          <IndiaHeatMap
            points={heatmapData?.points ?? [{ city: data.city, lat: data.coordinates.lat, lng: data.coordinates.lng, pm25: data.pm25, risk: data.risk, color: data.risk === "High" ? "#ef4444" : data.risk === "Medium" ? "#eab308" : "#22c55e" }]}
            selectedCity={data.city}
            selectedCoords={data.coordinates}
          />
        </div>
        <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0.45s" }}>
          <AdvisoryBlock advisory={data.advisory} disclaimer={data.disclaimer} />
        </div>
      </main>
    </div>
  );
}
