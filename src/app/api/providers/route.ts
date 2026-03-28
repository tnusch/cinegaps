import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Collapses platform variants (e.g. "Netflix Kids", "Netflix Standard with Ads")
 * into a single canonical name. Rules are checked longest-prefix-first so a more
 * specific entry never accidentally shadows a shorter one.
 */
const PROVIDER_RULES: [prefix: string, canonical: string][] = [
  ["Amazon Prime Video", "Prime Video"],
  ["Prime Video",        "Prime Video"],
  ["Disney Plus",        "Disney+"],
  ["Disney+",            "Disney+"],
  ["Apple TV Plus",      "Apple TV+"],
  ["Apple TV+",          "Apple TV+"],
  ["Paramount Plus",     "Paramount+"],
  ["Paramount+",         "Paramount+"],
  ["Discovery Plus",     "Discovery+"],
  ["Discovery+",         "Discovery+"],
  ["HBO Max",            "Max"],
  ["Canal Plus",         "Canal+"],
  ["Canal+",             "Canal+"],
  ["Netflix",            "Netflix"],
  ["Hulu",               "Hulu"],
  ["Max",                "Max"],
  ["Peacock",            "Peacock"],
  ["Mubi",               "MUBI"],
  ["MUBI",               "MUBI"],
  ["Crunchyroll",        "Crunchyroll"],
  ["Showtime",           "Showtime"],
  ["Starz",              "Starz"],
];

function normalizeProviderName(name: string): string {
  for (const [prefix, canonical] of PROVIDER_RULES) {
    if (name === prefix || name.startsWith(prefix + " ") || name.startsWith(prefix + ":")) {
      return canonical;
    }
  }
  return name;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tmdbId = searchParams.get("tmdbId");
  const region = searchParams.get("region") ?? "DE";

  if (!tmdbId) return NextResponse.json({ providers: [] }, { status: 400 });

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ providers: [] });

  try {
    const url = `${TMDB_BASE}/movie/${tmdbId}/watch/providers?api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ providers: [] });

    const data = await res.json();
    const regionData = data.results?.[region] ?? {};

    // Deduplicate by canonical name — first occurrence wins (keeps its logo)
    const canonicalSeen = new Map<string, { id: number; name: string; logoPath: string | null }>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of (regionData.flatrate ?? []) as any[]) {
      const canonical = normalizeProviderName(p.provider_name as string);
      if (!canonicalSeen.has(canonical)) {
        canonicalSeen.set(canonical, {
          id: p.provider_id as number,
          name: canonical,
          logoPath: (p.logo_path as string | null) ?? null,
        });
      }
    }

    const providers = [...canonicalSeen.values()];

    return NextResponse.json(
      { providers },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ providers: [] });
  }
}
