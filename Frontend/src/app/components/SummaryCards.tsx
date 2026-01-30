import { Wind, Droplets, Shield } from "lucide-react";

interface SummaryCardsProps {
  pm25: number;
  pm10: number;
  risk: string;
  city: string;
}

const riskColors = {
  High: { bg: "bg-red-500/20", text: "text-red-700", border: "border-red-400/50" },
  Medium: { bg: "bg-amber-500/20", text: "text-amber-700", border: "border-amber-400/50" },
  Low: { bg: "bg-emerald-500/20", text: "text-emerald-700", border: "border-emerald-400/50" },
};

const riskLabels = {
  High: "High Risk",
  Medium: "Medium Risk",
  Low: "Low Risk",
};

export function SummaryCards({ pm25, pm10, risk, city }: SummaryCardsProps) {
  const rc = riskColors[risk as keyof typeof riskColors] || riskColors.Low;
  const label = riskLabels[risk as keyof typeof riskLabels] || risk;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#09637E]/10 transition-colors">
            <Wind className="h-6 w-6 text-[#09637E]" />
          </div>
          <span className="text-sm font-medium text-[#09637E]">PM2.5</span>
        </div>
        <p className="text-3xl font-bold text-[#09637E] tabular-nums">{pm25}</p>
        <p className="text-xs text-gray-500 mt-1">µg/m³ • Fine particles</p>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#088395]/10">
            <Droplets className="h-6 w-6 text-[#088395]" />
          </div>
          <span className="text-sm font-medium text-[#088395]">PM10</span>
        </div>
        <p className="text-3xl font-bold text-[#088395] tabular-nums">{pm10}</p>
        <p className="text-xs text-gray-500 mt-1">µg/m³ • Coarse particles</p>
      </div>

      <div className={`bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border ${rc.border} animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ${risk === "High" ? "animate-risk-glow" : ""}`} style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl ${rc.bg}`}>
            <Shield className={`h-6 w-6 ${rc.text}`} />
          </div>
          <span className={`text-sm font-medium ${rc.text}`}>Health Risk</span>
        </div>
        <p className={`text-2xl font-bold ${rc.text} tabular-nums`}>{label}</p>
        <p className="text-xs text-gray-500 mt-1">{city}</p>
      </div>
    </div>
  );
}
