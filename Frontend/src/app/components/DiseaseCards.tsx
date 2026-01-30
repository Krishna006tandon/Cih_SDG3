import { Wind, Heart, Activity, Stethoscope, Waves, AlertTriangle } from "lucide-react";

const diseases = [
  {
    icon: Wind,
    name: "Asthma",
    description: "Air pollution triggers asthma attacks by irritating airways and causing inflammation. PM2.5 particles penetrate deep into lungs, worsening respiratory symptoms.",
    color: "#088395"
  },
  {
    icon: Waves,
    name: "Bronchitis",
    description: "Chronic exposure to polluted air inflames bronchial tubes, leading to persistent cough, mucus production, and difficulty breathing.",
    color: "#088395"
  },
  {
    icon: Activity,
    name: "COPD",
    description: "Chronic Obstructive Pulmonary Disease develops from long-term exposure to air pollutants, causing progressive lung damage and breathing difficulties.",
    color: "#088395"
  },
  {
    icon: Stethoscope,
    name: "Lung Infections",
    description: "Polluted air weakens immune defenses in respiratory tract, increasing susceptibility to pneumonia, bronchiolitis, and other lung infections.",
    color: "#088395"
  },
  {
    icon: Heart,
    name: "Heart Disease",
    description: "Fine particles enter bloodstream, causing inflammation and oxidative stress that damages blood vessels and increases risk of heart attacks.",
    color: "#088395"
  },
  {
    icon: AlertTriangle,
    name: "Stroke",
    description: "Air pollution contributes to stroke risk by promoting blood clots, raising blood pressure, and damaging blood vessel walls through chronic inflammation.",
    color: "#088395"
  }
];

export function DiseaseCards() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#09637E] mb-2">Health Impact: SDG-3 Focus</h2>
        <p className="text-gray-600">Understanding how air pollution affects human health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {diseases.map((disease, index) => {
          const Icon = disease.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="bg-[#7AB2B2] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-[#088395]" />
              </div>
              <h3 className="font-semibold text-[#09637E] mb-2">{disease.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {disease.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Disclaimer:</span> Information provided for awareness and prevention only. 
          Consult healthcare professionals for medical advice and treatment.
        </p>
      </div>
    </div>
  );
}