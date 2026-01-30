import { Activity, AlertCircle } from "lucide-react";

interface DiseaseCardsProps {
  diseases: string[];
  risk: string;
}

const riskStyles = {
  High: "border-red-300/50 bg-red-50/50",
  Medium: "border-amber-300/50 bg-amber-50/50",
  Low: "border-emerald-300/50 bg-emerald-50/50",
};

export function DiseaseCards({ diseases, risk }: DiseaseCardsProps) {
  const style = riskStyles[risk as keyof typeof riskStyles] || riskStyles.Low;
  const isMinimal = diseases.includes("Minimal impact");

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-[#09637E]" />
        <h3 className="text-lg font-semibold text-[#09637E]">Disease Impact</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Conditions that may be affected by current air quality levels
      </p>
      <div className="flex flex-wrap gap-3">
        {diseases.map((disease, i) => (
          <div
            key={disease}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${style} animate-scale-in opacity-0 [animation-fill-mode:forwards] hover:scale-105 transition-transform duration-200`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {!isMinimal ? (
              <AlertCircle className="h-4 w-4 text-[#088395]" />
            ) : null}
            <span className="font-medium text-gray-800">{disease}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
