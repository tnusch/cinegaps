"use client";

import { useMemo, useState } from "react";
import CsvUploader from "../components/CsvUploader";
import DecadeHeatmap from "../components/DecadeHeatmap";
import ListSelector from "../components/ListSelector";
import RadialRing from "../components/RadialRing";
import ResultsPanel from "../components/ResultsPanel";
import TopPicks from "../components/TopPicks";
import { ALL_LISTS } from "../data";
import { buildDecadeStats, compareAll, crossListGaps } from "../lib/compare";
import type { WatchedFilm } from "../lib/types";

export default function Home() {
  const [watched, setWatched] = useState<WatchedFilm[] | null>(null);
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(
    new Set(ALL_LISTS.map((l) => l.id))
  );

  const activeLists = useMemo(
    () => ALL_LISTS.filter((l) => selectedListIds.has(l.id)),
    [selectedListIds]
  );

  const results = useMemo(
    () => (watched ? compareAll(watched, activeLists) : []),
    [watched, activeLists]
  );

  const gapFillers = useMemo(() => crossListGaps(results), [results]);

  const decadeStats = useMemo(
    () => (watched ? buildDecadeStats(watched, activeLists) : []),
    [watched, activeLists]
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-12">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Cinegaps
          </h1>
          <p className="mt-2 text-zinc-500">
            Discover which great films you haven&apos;t seen yet. Upload your Letterboxd export and see your blind spots across cinema&apos;s most important lists.
          </p>
        </header>

        {/* Upload */}
        <section>
          {watched ? (
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4">
              <span className="text-sm text-zinc-600">
                <span className="font-medium text-zinc-900">{watched.length} films</span> loaded
              </span>
              <button
                className="text-sm text-zinc-400 hover:text-zinc-700"
                onClick={() => setWatched(null)}
              >
                Change file
              </button>
            </div>
          ) : (
            <CsvUploader onParsed={setWatched} />
          )}
        </section>

        {watched && (
          <>
            {/* List selector */}
            <section>
              <ListSelector
                lists={ALL_LISTS}
                selected={selectedListIds}
                onChange={setSelectedListIds}
              />
            </section>

            {/* Radial rings — one per active list */}
            {results.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Coverage overview
                </h2>
                <div className="flex flex-wrap gap-6">
                  {results.map((r) => (
                    <RadialRing
                      key={r.list.id}
                      percent={r.coveragePercent}
                      label={r.list.shortName}
                      seen={r.seen.length}
                      total={r.list.films.length}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Decade heatmap */}
            {decadeStats.length > 0 && (
              <section>
                <DecadeHeatmap stats={decadeStats} />
              </section>
            )}

            {/* Cross-list gap fillers */}
            {gapFillers.length > 0 && (
              <section>
                <TopPicks films={gapFillers} />
              </section>
            )}

            {/* Per-list results with seen/unseen toggle */}
            <section>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                By list
              </h2>
              <ResultsPanel results={results} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
