"use client";

import { useState } from "react";
import type { ComparisonResult, Film } from "../lib/types";

// ── Film list ────────────────────────────────────────────────────────────────

function FilmList({ films, emptyMessage }: { films: Film[]; emptyMessage: string }) {
  if (films.length === 0) {
    return <p className="text-sm text-zinc-400 italic">{emptyMessage}</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {films.map((film) => (
        <li
          key={`${film.title}-${film.year}`}
          className="flex items-baseline justify-between rounded-md px-3 py-1.5 text-sm odd:bg-zinc-50"
        >
          <span className="font-medium text-zinc-800">{film.title}</span>
          <span className="ml-2 shrink-0 text-zinc-400">{film.year}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Single list section ──────────────────────────────────────────────────────

type Tab = "unseen" | "seen";

function ListSection({ result }: { result: ComparisonResult }) {
  const [tab, setTab] = useState<Tab>("unseen");

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-900">{result.list.name}</h3>
          <p className="text-xs text-zinc-400">
            {result.seen.length} seen · {result.unseen.length} unseen · {result.list.films.length} total
          </p>
        </div>

        {/* Toggle */}
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-zinc-200 text-sm">
          <button
            onClick={() => setTab("unseen")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "unseen"
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            Blind spots
          </button>
          <button
            onClick={() => setTab("seen")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "seen"
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            Seen
          </button>
        </div>
      </div>

      <FilmList
        films={tab === "unseen" ? result.unseen : result.seen}
        emptyMessage={
          tab === "unseen"
            ? "You've seen everything on this list!"
            : "No films watched yet."
        }
      />
    </section>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────

interface Props {
  results: ComparisonResult[];
}

export default function ResultsPanel({ results }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-10">
      {results.map((result) => (
        <ListSection key={result.list.id} result={result} />
      ))}
    </div>
  );
}
