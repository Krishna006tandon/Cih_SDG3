import { useState } from "react";
import { MapPin, ArrowRight, ChevronDown, LocateIcon, LocateFixed } from "lucide-react";
import { states, citiesData } from "@/data/indiaData";

interface LocationSelectorProps {
  onLocationSelect: (state: string, city: string) => void;
}

export function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  const currentCities = selectedState 
    ? states.find(s => s.name === selectedState)?.cities || []
    : [];

  const handleSubmit = () => {
    if (selectedState && selectedCity) {
      onLocationSelect(selectedState, selectedCity);
    }
  };

  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get location details
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          // Check if the detected location is in India
          if (data.countryCode === 'IN') {
            // Find the closest city from our dataset
            let closestCity = null;
            let minDistance = Infinity;
            
            for (const city of citiesData) {
              const distance = Math.sqrt(
                Math.pow(city.lat - latitude, 2) + Math.pow(city.lng - longitude, 2)
              );
              
              if (distance < minDistance) {
                minDistance = distance;
                closestCity = city;
              }
            }
            
            if (closestCity) {
              setSelectedState(closestCity.state);
              setSelectedCity(closestCity.name);
              setAutoDetected(true);
            } else {
              // Fallback: try to match by district/administrative area
              const district = data.localityInfo.administrative?.find(
                (item: any) => item.componentType === 'city'
              )?.name || data.localityInfo.administrative?.find(
                (item: any) => item.componentType === 'district'
              )?.name;
              
              // Look for a city that might match the district name
              const matchedCity = citiesData.find(c => 
                c.name.toLowerCase().includes(district?.toLowerCase() || '') || 
                district?.toLowerCase().includes(c.name.toLowerCase())
              );
              
              if (matchedCity) {
                setSelectedState(matchedCity.state);
                setSelectedCity(matchedCity.name);
                setAutoDetected(true);
              } else {
                alert("We couldn't find your location in our data. Please select manually.");
              }
            }
          } else {
            alert("This service is currently available only for locations in India. Please select your location manually.");
          }
        } catch (error) {
          console.error("Error getting location details:", error);
          alert("Error detecting your location. Please select manually.");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoadingLocation(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          alert("Location access denied. Please enable location services to use auto-detect feature, or select your location manually.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Location information is unavailable. Please select your location manually.");
        } else if (error.code === error.TIMEOUT) {
          alert("Location request timed out. Please select your location manually.");
        } else {
          alert("An unknown error occurred. Please select your location manually.");
        }
      }
    );
  };

  const handleManualSelection = () => {
    setSelectedState("");
    setSelectedCity("");
    setAutoDetected(false);
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
            {!autoDetected ? (
              <>
                {/* Auto-Detect Button */}
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Or detect your location automatically</p>
                  <button
                    onClick={handleAutoDetect}
                    disabled={isLoadingLocation}
                    className="w-full md:w-auto bg-[#088395] text-white px-6 py-3 rounded-xl hover:bg-[#09637E] transition-colors flex items-center justify-center gap-2 shadow-md mx-auto"
                  >
                    {isLoadingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Detecting Location...
                      </>
                    ) : (
                      <>
                        <LocateIcon className="h-5 w-5" />
                        Auto-Detect My Location
                      </>
                    )}
                  </button>
                </div>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                {/* Manual Selection */}
                <div>
                  <h2 className="text-lg font-semibold text-[#09637E] mb-4 text-center">Select Location Manually</h2>
                  
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
                </div>
              </>
            ) : (
              /* Show detected location confirmation */
              <div className="text-center space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <LocateFixed className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#09637E] mb-2">Location Detected!</h3>
                  <p className="text-gray-700">
                    <span className="font-medium">{selectedCity}</span>, {selectedState}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleSubmit()}
                    className="bg-[#09637E] text-white px-6 py-3 rounded-xl hover:bg-[#088395] transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    Confirm & View Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={handleManualSelection}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    Change Location
                  </button>
                </div>
              </div>
            )}
            
            {/* Submit Button - shown only when not auto-detected or not confirmed */}
            {!autoDetected && (
              <button
                onClick={handleSubmit}
                disabled={!selectedState || !selectedCity}
                className="w-full bg-[#09637E] text-white px-6 py-4 rounded-xl hover:bg-[#088395] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                View Dashboard
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
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