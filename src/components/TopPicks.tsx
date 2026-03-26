"use client";

import type { CrossListFilm } from "../lib/compare";

interface Props {
  films: CrossListFilm[];
  /** Max entries to show */
  limit?: number;
}

export default function TopPicks({ films, limit = 10 }: Props) {
  // Only show films that span 2+ lists — single-list unseen are not "cross-list" wins
  const picks = films.filter((f) => f.listCount > 1).slice(0, limit);

  if (picks.length === 0) return null;

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Best use of your time
      </h2>
      <p className="mb-4 text-xs text-zinc-400">
        Unwatched films that fill gaps across the most lists at once
      </p>
      <ol className="space-y-2">
        {picks.map(({ film, listCount, listNames }) => (
          <li
            key={`${film.title}-${film.year}`}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-baseline gap-2 min-w-0">
              {/* Badge showing how many lists */}
              <span className="shrink-0 rounded bg-zinc-900 px-1.5 py-0.5 text-xs font-bold tabular-nums text-white">
                ×{listCount}
              </span>
              <span className="truncate font-medium text-zinc-900">{film.title}</span>
              <span className="shrink-0 text-sm text-zinc-400">{film.year}</span>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              {listNames.map((name) => (
                <span
                  key={name}
                  className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500"
                >
                  {name}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
