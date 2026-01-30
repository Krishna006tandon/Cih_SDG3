import { useState, useEffect } from "react";
import { MapPin, ArrowRight, ChevronDown } from "lucide-react";
import { states } from "../../data/indiaData";

interface LocationSelectorProps {
  onLocationSelect: (state: string, city: string, area?: string) => void;
}

export function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const currentCities = selectedState
    ? states.find((s) => s.name === selectedState)?.cities || []
    : [];

  // Fetch areas when city is selected
  useEffect(() => {
    if (selectedCity) {
      setLoadingAreas(true);
      // Simulate API call to fetch areas
      fetchAreasForCity(selectedCity)
        .then(fetchedAreas => {
          setAreas(fetchedAreas);
          setLoadingAreas(false);
        })
        .catch(() => {
          setAreas([]);
          setLoadingAreas(false);
        });
    } else {
      setAreas([]);
      setSelectedArea("");
    }
  }, [selectedCity]);

  const handleSubmit = () => {
    if (selectedState && selectedCity) {
      onLocationSelect(selectedState, selectedCity, selectedArea || undefined);
    }
  };

  // Mock function to simulate area fetching
  const fetchAreasForCity = async (city: string): Promise<string[]> => {
    // In a real implementation, this would call an API
    // For now, return mock data for major cities
    const areaData: Record<string, string[]> = {
      "Delhi": [
        "Connaught Place", "South Extension", "Karol Bagh", "Rajouri Garden", 
        "Dwarka", "Greater Kailash", "Lajpat Nagar", "Defence Colony"
      ],
      "Mumbai": [
        "Andheri East", "Andheri West", "Bandra", "Borivali East", 
        "Chembur", "Colaba", "Dadar", "Juhu", "Powai", "Worli"
      ],
      "Bengaluru": [
        "Electronic City", "Whitefield", "Koramangala", "Indiranagar", 
        "HSR Layout", "Jayanagar", "Marathahalli", "BTM Layout"
      ],
      "Hyderabad": [
        "HITEC City", "Gachibowli", "Banjara Hills", "Jubilee Hills", 
        "Kondapur", "Madhapur", "Ameerpet", "Secunderabad"
      ],
      "Chennai": [
        "T. Nagar", "Anna Nagar", "Velachery", "Thoraipakkam", 
        "Guindy", "Adyar", "Mylapore", "Egmore"
      ],
      "Kolkata": [
        "Park Street", "Salt Lake", "Ballygunge", "Jadavpur", 
        "Gariahat", "Tollygunge", "Behala", "Howrah"
      ]
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return areaData[city] || [];
  };

  return (
    <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7AB2B2]/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#088395]/25 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#09637E]/10 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-white/90 backdrop-blur p-6 rounded-3xl shadow-2xl mb-6 animate-float border border-white/60">
            <MapPin className="h-16 w-16 text-[#088395]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 animate-slide-up bg-gradient-to-r from-[#09637E] via-[#088395] to-[#7AB2B2] bg-clip-text text-transparent">
            Air Pollution & Health Dashboard
          </h1>
          <p className="text-[#09637E]/80 text-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Select your location to view air quality and health insights
          </p>
          <span className="inline-block mt-3 px-4 py-1.5 bg-white/80 backdrop-blur rounded-full text-sm font-semibold text-[#09637E] border border-[#7AB2B2]/40 shadow-lg animate-scale-in" style={{ animationDelay: "0.3s" }}>
            SDG-3: Good Health & Well-Being
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60 animate-scale-in hover:shadow-[0_25px_50px_-12px_rgba(9,99,126,0.15)] transition-shadow duration-500">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#09637E] text-center">
              Select Your Location
            </h2>

            <div>
              <label className="block text-sm font-medium text-[#09637E] mb-2">
                State
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity("");
                  }}
                  className="w-full px-4 py-3 pr-10 border-2 border-[#7AB2B2]/40 rounded-xl focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/20 focus:outline-none appearance-none bg-white text-gray-900 transition-all duration-200"
                >
                  <option value="">Choose a state...</option>
                  {states.filter(s => s.cities.length > 0).map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#088395] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#09637E] mb-2">
                City
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedArea("");
                  }}
                  disabled={!selectedState}
                  className="w-full px-4 py-3 pr-10 border-2 border-[#7AB2B2]/40 rounded-xl focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/20 focus:outline-none appearance-none bg-white text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <option value="">Choose a city...</option>
                  {currentCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#088395] pointer-events-none" />
              </div>
            </div>

            {(areas.length > 0 || loadingAreas) && (
              <div>
                <label className="block text-sm font-medium text-[#09637E] mb-2">
                  Area (Optional)
                </label>
                <div className="relative">
                  {loadingAreas ? (
                    <div className="w-full px-4 py-3 border-2 border-[#7AB2B2]/40 rounded-xl bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#088395]"></div>
                      <span className="ml-2 text-[#09637E]">Loading areas...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border-2 border-[#7AB2B2]/40 rounded-xl focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/20 focus:outline-none appearance-none bg-white text-gray-900 transition-all duration-200"
                    >
                      <option value="">Select an area (optional)...</option>
                      {areas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  )}
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#088395] pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-[#09637E]/70">
                  Get more precise air quality data for your specific locality
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selectedState || !selectedCity}
              className="relative w-full overflow-hidden bg-gradient-to-r from-[#09637E] via-[#088395] to-[#09637E] bg-[length:200%_100%] text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-[#088395]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:bg-[position:100%_0] group"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Health Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#09637E]/70">
          Privacy-safe • No GPS • Manual selection only
        </p>
      </div>
    </div>
  );
}
