"use client";

import { useEffect, useState } from "react";
import { letterboxdFilmUrl } from "../lib/letterboxd";
import type { ComparisonResult, Film } from "../lib/types";
import PosterImage from "./PosterImage";

const PAGE_SIZE = 5;

// ── Film grid with pagination ────────────────────────────────────────────────

function FilmGrid({ films, emptyMessage }: { films: Film[]; emptyMessage: string }) {
  const [page, setPage] = useState(0);

  // Reset to first page whenever the film list changes (tab switch)
  useEffect(() => { setPage(0); }, [films]);

  if (films.length === 0) {
    return <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">{emptyMessage}</p>;
  }

  const totalPages = Math.ceil(films.length / PAGE_SIZE);
  const pageFilms = films.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {pageFilms.map((film) => (
          <li key={`${film.title}-${film.year}`} className="flex flex-col gap-1.5">
            <PosterImage
              title={film.title}
              year={film.year}
              className="aspect-2/3 w-full"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
              href={letterboxdFilmUrl(film.title)}
            />
            <div>
              <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-tight line-clamp-2">
                {film.title}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{film.year}</p>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {page + 1} / {totalPages}
            <span className="ml-1.5 text-zinc-300 dark:text-zinc-600">({films.length} films)</span>
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
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
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{result.list.name}</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {result.seen.length} seen · {result.unseen.length} unseen · {result.list.films.length} total
          </p>
        </div>

        {/* Toggle */}
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm">
          <button
            onClick={() => setTab("unseen")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "unseen"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            Blind spots
          </button>
          <button
            onClick={() => setTab("seen")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "seen"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            Seen
          </button>
        </div>
      </div>

      <FilmGrid
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
