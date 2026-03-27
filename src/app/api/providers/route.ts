import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

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

    const seen = new Set<number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const providers = (regionData.flatrate ?? []).flatMap((p: any) => {
      if (seen.has(p.provider_id)) return [];
      seen.add(p.provider_id);
      return [{ id: p.provider_id as number, name: p.provider_name as string, logoPath: (p.logo_path as string | null) ?? null }];
    });

    return NextResponse.json(
      { providers },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ providers: [] });
  }
}
