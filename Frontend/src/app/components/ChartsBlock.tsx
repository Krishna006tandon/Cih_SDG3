import { BarChart3 } from "lucide-react";

interface ChartPoint {
  time: string;
  pm25: number;
  pm10: number;
}

interface ChartsBlockProps {
  chartData: ChartPoint[];
}

export function ChartsBlock({ chartData }: ChartsBlockProps) {
  const maxPm = Math.max(
    ...chartData.map((d) => Math.max(d.pm25, d.pm10)),
    1
  );

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-[#7AB2B2]/30 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-[#09637E]" />
        <h3 className="text-lg font-semibold text-[#09637E]">
          Pollution Trend (24h)
        </h3>
      </div>
      <div className="h-48 flex items-end gap-0.5 overflow-x-auto pb-8">
        {chartData.map((point, i) => (
          <div
            key={`${point.time}-${i}`}
            className="flex flex-col items-center flex-shrink-0 min-w-[20px] group"
          >
            <div className="w-full flex flex-col gap-0.5 items-center justify-end h-36">
              <div
                className="w-2.5 rounded-t bg-[#088395] transition-all duration-300 hover:bg-[#09637E] origin-bottom animate-bar-grow"
                style={{
                  height: `${Math.max((point.pm10 / maxPm) * 100, 2)}%`,
                  minHeight: "4px",
                  animationDelay: `${i * 0.02}s`,
                }}
                title={`PM10: ${point.pm10}`}
              />
              <div
                className="w-2.5 rounded-t bg-[#09637E] transition-all duration-300 hover:bg-[#7AB2B2] origin-bottom animate-bar-grow"
                style={{
                  height: `${Math.max((point.pm25 / maxPm) * 100, 2)}%`,
                  minHeight: "4px",
                  animationDelay: `${i * 0.02 + 0.05}s`,
                }}
                title={`PM2.5: ${point.pm25}`}
              />
            </div>
            <span className="text-[9px] text-gray-500 mt-1 truncate max-w-[24px]" title={point.time}>
              {i % 4 === 0 ? point.time : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 justify-center text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#09637E]" />
          PM2.5
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#088395]" />
          PM10
        </span>
      </div>
    </div>
  );
}
