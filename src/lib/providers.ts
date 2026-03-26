export interface ProviderInfo {
  id: number;
  name: string;
  logoPath: string | null;
}

const cache = new Map<string, ProviderInfo[]>();
const inFlight = new Map<string, Promise<ProviderInfo[]>>();

export async function fetchProviders(tmdbId: number, region = "DE"): Promise<ProviderInfo[]> {
  const key = `${tmdbId}:${region}`;

  if (cache.has(key)) return cache.get(key)!;
  if (inFlight.has(key)) return inFlight.get(key)!;

  const promise = (async () => {
    try {
      const res = await fetch(`/api/providers?tmdbId=${tmdbId}&region=${region}`);
      const { providers } = await res.json();
      const result: ProviderInfo[] = providers ?? [];
      cache.set(key, result);
      return result;
    } catch {
      cache.set(key, []);
      return [];
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}
