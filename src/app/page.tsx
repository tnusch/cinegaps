"use client";

import { useEffect, useMemo, useState } from "react";
import CsvUploader from "../components/CsvUploader";
import ListSelector from "../components/ListSelector";
import StepSidebar from "../components/StepSidebar";
import RadialRing from "../components/RadialRing";
import ResultsPanel from "../components/ResultsPanel";
import TopPicks from "../components/TopPicks";
import ArchetypeCard from "../components/ArchetypeCard";
import { ALL_LISTS } from "../data";
import { buildEraStats, compareAll, crossListGaps } from "../lib/compare";
import { deriveArchetype } from "../lib/archetype";
import { downloadLetterboxdCsv } from "../lib/export";
import type { WatchedFilm } from "../lib/types";

function StepHeader({ n, title, subtitle }: { n: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-[10px] font-semibold tabular-nums text-zinc-400 dark:text-zinc-500">
        {n}
      </span>
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [watched, setWatched] = useState<WatchedFilm[] | null>(null);
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(
    new Set(ALL_LISTS.map((l) => l.id))
  );
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggleDark() {
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

  const eraStats = useMemo(
    () => (watched ? buildEraStats(watched, activeLists) : []),
    [watched, activeLists]
  );

  const archetype = useMemo(
    () => deriveArchetype(results, eraStats),
    [results, eraStats]
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-16 xl:max-w-5xl">
      <div className="flex gap-10">
      <StepSidebar show={!!watched} />
      <div className="min-w-0 flex-1 space-y-12">

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
            {/* ── Step 1: Select lists ───────────────────────────────────── */}
            <section id="step-1">
              <StepHeader
                n={1}
                title="Select lists"
                subtitle="Choose which canonical lists to compare your watch history against."
              />
              <ListSelector
                lists={ALL_LISTS}
                selected={selectedListIds}
                onChange={setSelectedListIds}
              />
            </section>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── Step 2: Coverage overview ──────────────────────────────── */}
            {results.length > 0 && (
              <section id="step-2">
                <StepHeader
                  n={2}
                  title="Coverage overview"
                  subtitle="How much of each list you've seen so far."
                />
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

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── Step 3: Blind spot profile ─────────────────────────────── */}
            {archetype && (
              <section id="step-3">
                <StepHeader
                  n={3}
                  title="Your blind spot profile"
                  subtitle="Your viewing archetype, derived from era and category coverage patterns."
                />
                <ArchetypeCard archetype={archetype} results={results} eraStats={eraStats} />
              </section>
            )}

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── Step 4: What to watch next ─────────────────────────────── */}
            {gapFillers.length > 0 && (
              <section id="step-4">
                <StepHeader
                  n={4}
                  title="What to watch next"
                  subtitle="Unwatched films that appear on the most of your selected lists at once."
                />
                <TopPicks films={gapFillers} />
              </section>
            )}

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── Step 5: Export to Letterboxd ───────────────────────────── */}
            {gapFillers.length > 0 && (
              <section id="step-5">
                <StepHeader
                  n={5}
                  title="Export to Letterboxd"
                  subtitle="Save your top picks as a Letterboxd watchlist."
                />
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Download your top 10 gap-filling picks as a CSV and import them directly into Letterboxd as a watchlist — so you can track what to watch next right where you log films.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <li>Click <strong className="text-zinc-700 dark:text-zinc-300">Download watchlist CSV</strong> below</li>
                    <li>Go to <a href="https://letterboxd.com/about/importing-data/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">letterboxd.com/about/importing-data</a> and follow the import instructions</li>
                    <li>Choose <strong className="text-zinc-700 dark:text-zinc-300">Import as a list</strong> when prompted</li>
                  </ol>
                  <button
                    onClick={() => downloadLetterboxdCsv(gapFillers.slice(0, 10).map((f) => f.film), "cinegaps-watchlist.csv")}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300 active:bg-zinc-800 dark:active:bg-zinc-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download watchlist CSV
                  </button>
                </div>
              </section>
            )}

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── Step 6: Explore by list ────────────────────────────────── */}
            <section id="step-6">
              <StepHeader
                n={6}
                title="Explore by list"
                subtitle="Browse every seen and unseen film, list by list."
              />
              <ResultsPanel results={results} />
            </section>
          </>
        )}
      </div>
      </div>
      </div>
    </div>
  );
}
