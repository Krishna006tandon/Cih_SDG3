import { useState } from "react";
import { MapPin, ArrowRight, ChevronDown } from "lucide-react";
import { states } from "@/data/indiaData";

interface LocationSelectorProps {
  onLocationSelect: (state: string, city: string) => void;
}

export function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const currentCities = selectedState 
    ? states.find(s => s.name === selectedState)?.cities || []
    : [];

  const handleSubmit = () => {
    if (selectedState && selectedCity) {
      onLocationSelect(selectedState, selectedCity);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-full shadow-md mb-4">
            <MapPin className="h-12 w-12 text-[#088395]" />
          </div>
          <h1 className="text-3xl font-bold text-[#09637E] mb-2">
            Select Your Location
          </h1>
          <p className="text-gray-600">
            Choose your state and city to view air quality and health data
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* State Selector */}
            <div>
              <label className="block text-sm font-medium text-[#09637E] mb-2">
                Select State
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity("");
                  }}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-[#088395] focus:outline-none appearance-none bg-white text-gray-900"
                >
                  <option value="">Choose a state...</option>
                  {states.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* City Selector */}
            <div>
              <label className="block text-sm font-medium text-[#09637E] mb-2">
                Select City
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-[#088395] focus:outline-none appearance-none bg-white text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose a city...</option>
                  {currentCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedState || !selectedCity}
              className="w-full bg-[#09637E] text-white px-6 py-4 rounded-xl hover:bg-[#088395] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              View Dashboard
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Data updated in real-time from environmental monitoring stations
          </p>
        </div>
      </div>
    </div>
  );
}