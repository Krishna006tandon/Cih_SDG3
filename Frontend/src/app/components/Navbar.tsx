import { Activity, Heart } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-[#09637E] p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[#09637E]">Air Quality Dashboard</h1>
              <p className="text-xs text-gray-600">SDG-3: Good Health & Well-Being</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#7AB2B2] bg-opacity-20 px-4 py-2 rounded-lg">
            <Heart className="h-4 w-4 text-[#088395]" />
            <span className="text-sm text-[#09637E] font-medium">Health First</span>
          </div>
        </div>
      </div>
    </nav>
  );
}