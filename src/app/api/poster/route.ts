import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title");
  const year = searchParams.get("year");

  if (!title) {
    return NextResponse.json({ posterUrl: null }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ posterUrl: null }, { status: 503 });
  }

  const buildUrl = (withYear: boolean) => {
    const u = new URL(`${TMDB_BASE}/search/movie`);
    u.searchParams.set("api_key", apiKey);
    u.searchParams.set("query", title);
    u.searchParams.set("include_adult", "false");
    if (withYear && year) u.searchParams.set("year", year);
    return u.toString();
  };

  try {
    // Try with year first for precision, fall back to title-only
    let res = await fetch(buildUrl(true));
    let data = await res.json();
    let movie = data.results?.[0];

    if (!movie?.poster_path && year) {
      res = await fetch(buildUrl(false));
      data = await res.json();
      movie = data.results?.[0];
    }

    const posterUrl = movie?.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : null;
    const tmdbId: number | null = movie?.id ?? null;

    return NextResponse.json(
      { posterUrl, tmdbId },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ posterUrl: null });
  }
}
