import { Activity, AlertCircle, Brain, Eye, Baby, Heart, Flower2, Wind, Thermometer } from "lucide-react";

interface DetailedDisease {
  name: string;
  icon: string;
  threshold: number;
  risk: string;
}

interface DiseaseCardsProps {
  diseases: string[];
  risk: string;
  detailedDiseases?: DetailedDisease[];
}

const riskStyles = {
  High: "border-red-300/50 bg-red-50/50",
  Medium: "border-amber-300/50 bg-amber-50/50",
  Low: "border-emerald-300/50 bg-emerald-50/50",
};

const riskBadgeStyles = {
  High: { bg: "bg-red-500", text: "text-white" },
  Medium: { bg: "bg-amber-500", text: "text-white" },
  Low: { bg: "bg-green-500", text: "text-white" },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  eye: Eye,
  baby: Baby,
  lungs: Wind,
  heart: Heart,
  flower: Flower2,
  nose: AlertCircle,
  thermometer: Thermometer,
  wind: Wind,
};

export function DiseaseCards({ diseases, risk, detailedDiseases }: DiseaseCardsProps) {
  const style = riskStyles[risk as keyof typeof riskStyles] || riskStyles.Low;
  const isMinimal = diseases.includes("Minimal impact");

  // If we have detailed diseases, show them
  if (detailedDiseases && detailedDiseases.length > 0) {
    return (
      <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-[#09637E]" />
          <h3 className="text-lg font-semibold text-[#09637E]">Prevent Health Problems: Understand Your Risks</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Health conditions that may be triggered or worsened by current air quality
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {detailedDiseases.map((disease, i) => {
            const IconComponent = iconMap[disease.icon] || AlertCircle;
            const badgeStyle = riskBadgeStyles[disease.risk as keyof typeof riskBadgeStyles] || riskBadgeStyles.Low;
            
            return (
              <div
                key={disease.name}
                className={`relative flex flex-col items-center p-4 rounded-xl border ${riskStyles[disease.risk as keyof typeof riskStyles] || riskStyles.Low} animate-scale-in opacity-0 [animation-fill-mode:forwards] hover:scale-105 transition-transform duration-200 cursor-pointer`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${badgeStyle.bg} ${badgeStyle.text}`}>
                  {disease.risk}
                </span>
                <IconComponent className="h-8 w-8 text-[#088395] mb-2" />
                <span className="text-sm font-medium text-gray-800 text-center">{disease.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback to simple disease list
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
