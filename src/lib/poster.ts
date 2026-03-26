export interface PosterResult {
  posterUrl: string | null;
  tmdbId: number | null;
}

const cache = new Map<string, PosterResult>();
const inFlight = new Map<string, Promise<PosterResult>>();

export async function fetchPosterResult(title: string, year: number): Promise<PosterResult> {
  const key = `${title}:${year}`;

  if (cache.has(key)) return cache.get(key)!;
  if (inFlight.has(key)) return inFlight.get(key)!;

  const promise = (async () => {
    try {
      const params = new URLSearchParams({ title, year: String(year) });
      const res = await fetch(`/api/poster?${params}`);
      const { posterUrl, tmdbId } = await res.json();
      const result: PosterResult = { posterUrl: posterUrl ?? null, tmdbId: tmdbId ?? null };
      cache.set(key, result);
      return result;
    } catch {
      const result: PosterResult = { posterUrl: null, tmdbId: null };
      cache.set(key, result);
      return result;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

// Backward compat for PosterImage
export async function fetchPosterUrl(title: string, year: number): Promise<string | null> {
  return (await fetchPosterResult(title, year)).posterUrl;
}
