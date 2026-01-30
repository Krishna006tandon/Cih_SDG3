import { Shield, ShieldCheck, TrendingUp, Trees, Home, Users } from "lucide-react";

const preventionTips = [
  {
    icon: ShieldCheck,
    title: "Use Quality Masks",
    description: "Wear N95 or N99 masks when air quality is poor to filter out harmful PM2.5 particles.",
    color: "#088395"
  },
  {
    icon: Home,
    title: "Stay Indoors During High Pollution",
    description: "Limit outdoor activities when AQI is high, especially during peak pollution hours (morning and evening).",
    color: "#088395"
  },
  {
    icon: TrendingUp,
    title: "Monitor AQI Regularly",
    description: "Check air quality index daily and plan outdoor activities when pollution levels are lower.",
    color: "#088395"
  },
  {
    icon: Trees,
    title: "Promote Clean Environment",
    description: "Support green initiatives, reduce vehicle usage, and plant trees to improve local air quality.",
    color: "#088395"
  },
  {
    icon: Shield,
    title: "Use Air Purifiers",
    description: "Install HEPA air purifiers at home and workplace to reduce indoor air pollution exposure.",
    color: "#088395"
  },
  {
    icon: Users,
    title: "Protect Vulnerable Groups",
    description: "Extra care for children, elderly, and those with respiratory conditions during high pollution days.",
    color: "#088395"
  }
];

export function PreventionTips() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#09637E] mb-2">Prevention & Awareness</h2>
        <p className="text-gray-600">Protect yourself and your loved ones from air pollution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preventionTips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-[#7AB2B2]"
            >
              <div className="bg-[#7AB2B2] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-[#088395]" />
              </div>
              <h3 className="font-semibold text-[#09637E] mb-2">{tip.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {tip.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Additional Resources */}
      <div className="mt-8 bg-gradient-to-r from-[#EBF4F6] to-white rounded-xl p-6 border border-[#7AB2B2]">
        <h3 className="font-semibold text-[#09637E] mb-3">Additional Resources</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#088395] mt-1">•</span>
            <span>Avoid outdoor exercise during high pollution hours (6-10 AM and 6-10 PM)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#088395] mt-1">•</span>
            <span>Keep windows closed during peak pollution times and use exhaust fans</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#088395] mt-1">•</span>
            <span>Consume antioxidant-rich foods (fruits, vegetables) to boost immunity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#088395] mt-1">•</span>
            <span>Stay hydrated to help your body flush out toxins from air pollution</span>
          </li>
        </ul>
      </div>
    </div>
  );
}