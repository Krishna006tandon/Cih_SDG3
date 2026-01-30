import { ArrowRight, MapPin, Heart, Shield, TrendingUp } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#EBF4F6]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#7AB2B2] bg-opacity-30 px-4 py-2 rounded-full mb-6">
            <Heart className="h-4 w-4 text-[#088395]" />
            <span className="text-sm text-[#09637E] font-medium">SDG-3: Good Health & Well-Being</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#09637E] mb-4 leading-tight">
            Air Pollution & Health Impact<br />Dashboard
          </h1>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Understanding how air pollution affects human health across India. Monitor real-time air quality, 
            assess health risks, and learn protective measures to safeguard your well-being.
          </p>
          
          <button
            onClick={() => onNavigate('location')}
            className="inline-flex items-center gap-2 bg-[#09637E] text-white px-8 py-4 rounded-xl hover:bg-[#088395] transition-colors shadow-lg"
          >
            <MapPin className="h-5 w-5" />
            Check Air Quality & Health Risk
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* India Map Visual Placeholder */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="relative h-96 bg-gradient-to-br from-[#EBF4F6] to-white rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block bg-white p-6 rounded-full shadow-md mb-4">
                <MapPin className="h-16 w-16 text-[#088395]" />
              </div>
              <p className="text-xl font-semibold text-[#09637E] mb-2">India Air Quality Map</p>
              <p className="text-gray-600">Real-time pollution monitoring across major cities</p>
              
              {/* Sample pollution indicators */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Unhealthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="bg-[#7AB2B2] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-[#088395]" />
            </div>
            <h3 className="font-semibold text-[#09637E] mb-2">Real-Time Monitoring</h3>
            <p className="text-sm text-gray-600">
              Track PM2.5, PM10 levels, and Air Quality Index across Indian cities in real-time.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="bg-[#7AB2B2] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-[#088395]" />
            </div>
            <h3 className="font-semibold text-[#09637E] mb-2">Health Impact Analysis</h3>
            <p className="text-sm text-gray-600">
              Understand how air pollution affects respiratory and cardiovascular health.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="bg-[#7AB2B2] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-[#088395]" />
            </div>
            <h3 className="font-semibold text-[#09637E] mb-2">Prevention Guidelines</h3>
            <p className="text-sm text-gray-600">
              Access evidence-based recommendations to protect yourself from air pollution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}