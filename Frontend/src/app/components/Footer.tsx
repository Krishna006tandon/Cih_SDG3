import { Heart, Globe, Wind } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-3">
            <Wind className="h-5 w-5 text-[#088395] mt-1" />
            <div>
              <h3 className="font-semibold text-[#09637E] mb-2">Clean Air Initiative</h3>
              <p className="text-sm text-gray-600">
                Working towards healthier air for all Indians through awareness and action.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-[#088395] mt-1" />
            <div>
              <h3 className="font-semibold text-[#09637E] mb-2">SDG-3 Aligned</h3>
              <p className="text-sm text-gray-600">
                Contributing to UN Sustainable Development Goal 3: Good Health & Well-Being.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-[#088395] mt-1" />
            <div>
              <h3 className="font-semibold text-[#09637E] mb-2">Community Health</h3>
              <p className="text-sm text-gray-600">
                Empowering communities with real-time air quality data and health insights.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © 2026 Air Pollution & Health Impact Dashboard | Built for a healthier India
          </p>
        </div>
      </div>
    </footer>
  );
}