"use client";

import type { DecadeStats } from "../lib/compare";

interface Props {
  stats: DecadeStats[];
}

function cellClasses(percent: number): string {
  if (percent === 0)   return "bg-zinc-100 text-zinc-400";
  if (percent < 25)    return "bg-zinc-200 text-zinc-700";
  if (percent < 50)    return "bg-zinc-400 text-white";
  if (percent < 75)    return "bg-zinc-600 text-white";
  if (percent < 100)   return "bg-zinc-800 text-white";
  return "bg-black text-white";
}

export default function DecadeHeatmap({ stats }: Props) {
  if (stats.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Coverage by decade
      </h2>
      <div className="flex flex-wrap gap-2">
        {stats.map(({ decade, total, seen, percent }) => (
          <div
            key={decade}
            title={`${seen} of ${total} canonical films from the ${decade}s`}
            className={`flex w-16 flex-col items-center justify-center rounded-lg px-1 py-3 ${cellClasses(percent)}`}
          >
            <span className="text-sm font-bold">{percent}%</span>
            <span className="mt-0.5 text-[10px] font-medium">{decade}s</span>
            <span className="mt-0.5 text-[9px] opacity-70">{seen}/{total}</span>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400">
        <span>0%</span>
        {[0, 25, 50, 75, 100].map((p) => (
          <div key={p} className={`h-3 w-5 rounded ${cellClasses(p === 0 ? 0 : p - 1)}`} />
        ))}
        <span>100%</span>
      </div>
    </div>
  );
}
