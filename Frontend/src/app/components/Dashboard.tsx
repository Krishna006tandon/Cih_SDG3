import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { SummaryCards } from "./SummaryCards";
import { ChartsBlock } from "./ChartsBlock";
import { IndiaHeatMap } from "./IndiaHeatMap";
import { DiseaseCards } from "./DiseaseCards";
import { PreventionTips } from "./PreventionTips";
import { getCityData, generateTrendData } from "@/data/indiaData";

interface DashboardProps {
  city: string;
  state: string;
  onBack: () => void;
}

export function Dashboard({ city, state, onBack }: DashboardProps) {
  const cityData = getCityData(city);

  if (!cityData) {
    return (
      <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">City data not found</p>
          <button
            onClick={onBack}
            className="mt-4 text-[#088395] hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const trendData = generateTrendData(cityData.pm25);

  return (
    <div className="min-h-screen bg-[#EBF4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#088395] hover:text-[#09637E] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Change Location
          </button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#7AB2B2] bg-opacity-20 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-[#088395]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#09637E]">{city}, {state}</h1>
                  <p className="text-sm text-gray-600">Real-time Air Quality & Health Data</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Updated: January 30, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards pm25={cityData.pm25} pm10={cityData.pm10} />
        </div>

        {/* Charts */}
        <div className="mb-8">
          <ChartsBlock trendData={trendData} />
        </div>

        {/* Heat Map */}
        <div className="mb-8">
          <IndiaHeatMap />
        </div>

        {/* Disease Cards */}
        <div className="mb-8">
          <DiseaseCards />
        </div>

        {/* Prevention Tips */}
        <div className="mb-8">
          <PreventionTips />
        </div>
      </div>
    </div>
  );
}