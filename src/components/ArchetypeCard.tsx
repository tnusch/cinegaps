"use client";

import type { Archetype } from "../lib/archetype";
import type { EraStats } from "../lib/compare";
import type { ComparisonResult } from "../lib/types";

interface Props {
  archetype: Archetype;
  results: ComparisonResult[];
  eraStats: EraStats[];
}

function StatBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-14 shrink-0 text-[10px] text-zinc-500 dark:text-zinc-500">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
        {percent}%
      </span>
    </div>
  );
}

export default function ArchetypeCard({ archetype, results, eraStats }: Props) {
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const criticsAvg = avg(
    results.filter((r) => r.list.category === "critics").map((r) => r.coveragePercent)
  );
  const fansAvg = avg(
    results.filter((r) => r.list.category === "fans").map((r) => r.coveragePercent)
  );
  const awardsAvg = avg(
    results.filter((r) => r.list.category === "awards").map((r) => r.coveragePercent)
  );

  const showCategoryStats =
    results.some((r) => r.list.category === "critics") &&
    results.some((r) => r.list.category === "fans") &&
    results.some((r) => r.list.category === "awards");

  const eraVisible = eraStats.filter((e) => e.total > 0);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1.5">
          Your blind spot profile
        </p>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
          {archetype.label}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {archetype.description}
        </p>
      </div>

      {showCategoryStats && (
        <div className="space-y-1.5">
          <StatBar label="Critics" percent={criticsAvg} />
          <StatBar label="Fans" percent={fansAvg} />
          <StatBar label="Awards" percent={awardsAvg} />
        </div>
      )}

      {eraVisible.length > 0 && (
        <div className="space-y-1.5">
          {eraVisible.map((e) => (
            <StatBar
              key={e.label}
              label={e.label}
              percent={e.percent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
