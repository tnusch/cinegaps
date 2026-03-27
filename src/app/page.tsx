"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync React state with whatever the inline script set on <html> before hydration
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggleDark() {
    // Read from DOM as ground truth to avoid stale-closure issues
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

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
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-12">

        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cinegaps
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Discover which great films you haven&apos;t seen yet. Upload your Letterboxd export and see your blind spots across cinema&apos;s most important lists.
            </p>
          </div>
          <button
            onClick={toggleDark}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="mt-1 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {/* Only render after mount to avoid hydration mismatch */}
            {mounted && (darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ))}
          </button>
        </header>

        {/* Upload */}
        <section>
          {watched ? (
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{watched.length} films</span> loaded
              </span>
              <button
                className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
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
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                      darkMode={darkMode}
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
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
