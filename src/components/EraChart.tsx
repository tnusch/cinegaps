"use client";

import type { EraStats } from "../lib/compare";
import RadialRing from "./RadialRing";

interface Props {
  stats: EraStats[];
  darkMode: boolean;
}

function eraYears({ from, to }: EraStats): string {
  if (from === 0) return `pre‑1960`;
  if (to === 9999) return `${from}–`;
  return `${from}–${to}`;
}

export default function EraChart({ stats, darkMode }: Props) {
  if (stats.every((s) => s.total === 0)) return null;

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Coverage by era
      </h2>
      <div className="flex flex-wrap gap-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            <RadialRing
              percent={s.percent}
              label={s.label}
              seen={s.seen}
              total={s.total}
              darkMode={darkMode}
            />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {eraYears(s)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
