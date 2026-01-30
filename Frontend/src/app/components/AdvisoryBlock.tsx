import { Info, ShieldAlert } from "lucide-react";

interface AdvisoryBlockProps {
  advisory: string;
  disclaimer: string;
}

export function AdvisoryBlock({ advisory, disclaimer }: AdvisoryBlockProps) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-5 w-5 text-[#088395]" />
        <h3 className="text-lg font-semibold text-[#09637E]">Health Advisory</h3>
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">{advisory}</p>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#EBF4F6] border border-[#7AB2B2]/40">
        <ShieldAlert className="h-4 w-4 text-[#09637E] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#09637E]/90 italic">{disclaimer}</p>
      </div>
    </div>
  );
}
