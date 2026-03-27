import type { CanonicalList, ComparisonResult, Film, WatchedFilm } from "./types";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, "") // strip leading articles
    .replace(/[^a-z0-9]/g, ""); // strip punctuation/spaces
}

function filmKey(film: Film): string {
  return `${normalizeTitle(film.title)}-${film.year}`;
}

function filmsMatch(a: Film, b: Film): boolean {
  // Match on normalized title + year (±1 to handle release year ambiguity)
  return (
    normalizeTitle(a.title) === normalizeTitle(b.title) &&
    Math.abs(a.year - b.year) <= 1
  );
}

export function compare(
  watched: WatchedFilm[],
  list: CanonicalList
): ComparisonResult {
  const seen: Film[] = [];
  const unseen: Film[] = [];

  for (const canonical of list.films) {
    const wasWatched = watched.some((w) => filmsMatch(w, canonical));
    if (wasWatched) {
      seen.push(canonical);
    } else {
      unseen.push(canonical);
    }
  }

  const coveragePercent =
    list.films.length > 0
      ? Math.round((seen.length / list.films.length) * 100)
      : 0;

  return { list, seen, unseen, coveragePercent };
}

export function compareAll(
  watched: WatchedFilm[],
  lists: CanonicalList[]
): ComparisonResult[] {
  return lists.map((list) => compare(watched, list));
}

// ── Cross-list gap analysis ──────────────────────────────────────────────────

export interface CrossListFilm {
  film: Film;
  /** How many of the selected lists this film appears in as unseen */
  listCount: number;
  listNames: string[];
}

/** Films sorted by how many selected lists they still need to be watched for. */
export function crossListGaps(results: ComparisonResult[]): CrossListFilm[] {
  const map = new Map<string, CrossListFilm>();

  for (const result of results) {
    for (const film of result.unseen) {
      const key = filmKey(film);
      if (!map.has(key)) {
        map.set(key, { film, listCount: 0, listNames: [] });
      }
      const entry = map.get(key)!;
      entry.listCount++;
      entry.listNames.push(result.list.shortName);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.listCount - a.listCount || b.film.year - a.film.year
  );
}

// ── Era chart ─────────────────────────────────────────────────────────────────

export type EraLabel = "Classic" | "Golden" | "Modern" | "Current";

export interface EraRange {
  label: EraLabel;
  /** First year included in this era (inclusive). */
  from: number;
  /** Last year included in this era (inclusive). */
  to: number;
}

/** Ordered era definitions used both for stats and for UI filters. */
export const ERAS: EraRange[] = [
  { label: "Classic", from: 0,    to: 1959 },
  { label: "Golden",  from: 1960, to: 1979 },
  { label: "Modern",  from: 1980, to: 1999 },
  { label: "Current", from: 2000, to: 9999 },
];

export interface EraStats {
  label: EraLabel;
  from: number;
  to: number;
  total: number;
  seen: number;
  percent: number;
}

/** Aggregates coverage per era across all selected lists (deduplicates films). */
export function buildEraStats(
  watched: WatchedFilm[],
  lists: CanonicalList[]
): EraStats[] {
  // Deduplicate canonical films across lists by key
  const allFilms = new Map<string, Film>();
  for (const list of lists) {
    for (const film of list.films) {
      const key = filmKey(film);
      if (!allFilms.has(key)) allFilms.set(key, film);
    }
  }
  const films = Array.from(allFilms.values());

  return ERAS.map(({ label, from, to }) => {
    const era = films.filter((f) => f.year >= from && f.year <= to);
    const total = era.length;
    const seen = era.filter((f) => watched.some((w) => filmsMatch(w, f))).length;
    return { label, from, to, total, seen, percent: total > 0 ? Math.round((seen / total) * 100) : 0 };
  });
}
