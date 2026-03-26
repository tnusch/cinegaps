export interface Film {
  title: string;
  year: number;
  director?: string;
}

export interface WatchedFilm extends Film {
  rating?: number; // 0.5–5.0, undefined if not rated
  watchedDate?: string; // ISO date string
  letterboxdUri?: string;
}

export interface CanonicalList {
  id: string;
  name: string;
  shortName: string;
  description: string;
  films: Film[];
}

export interface ComparisonResult {
  list: CanonicalList;
  seen: Film[];
  unseen: Film[];
  coveragePercent: number;
}
