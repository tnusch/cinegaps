"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { CrossListFilm, EraLabel } from "../lib/compare";
import { ERAS } from "../lib/compare";
import { fetchPosterResult } from "../lib/poster";
import { fetchProviders, type ProviderInfo } from "../lib/providers";
import { letterboxdFilmUrl } from "../lib/letterboxd";
import { getLocaleRegion, TMDB_REGIONS } from "../lib/regions";
import type { Film } from "../lib/types";
import ShareCard from "./ShareCard";
import type { Archetype } from "../lib/archetype";
import { downloadLetterboxdCsv } from "../lib/export";

const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w45";

// ── TopPickCard ──────────────────────────────────────────────────────────────

interface CardProps {
  film: Film;
  listCount: number;
  listNames: string[];
  region: string;
  onProviders: (filmKey: string, providers: ProviderInfo[]) => void;
}

const TopPickCard = memo(function TopPickCard({ film, listCount, listNames, region, onProviders }: CardProps) {
  const [posterUrl, setPosterUrl] = useState<string | null | "loading">("loading");
  const [tmdbId, setTmdbId] = useState<number | null | "pending">("pending");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const filmKey = `${film.title}:${film.year}`;

  // Fetch poster once per film — tmdbId is stable
  useEffect(() => {
    let cancelled = false;
    fetchPosterResult(film.title, film.year).then(({ posterUrl, tmdbId }) => {
      if (cancelled) return;
      setPosterUrl(posterUrl);
      setTmdbId(tmdbId ?? null);
    });
    return () => { cancelled = true; };
  // filmKey is derived from film.title and film.year — listing it is sufficient
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filmKey]);

  // Re-fetch providers whenever region or tmdbId changes
  useEffect(() => {
    if (tmdbId === "pending") return;
    if (tmdbId === null) {
      onProviders(filmKey, []);
      return;
    }
    let cancelled = false;
    fetchProviders(tmdbId, region).then((p) => {
      if (cancelled) return;
      setProviders(p);
      onProviders(filmKey, p);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filmKey, tmdbId, region]);

  return (
    <div className="flex flex-col gap-2">
      {/* Poster */}
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {posterUrl === "loading" && (
          <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />
        )}
        {posterUrl && posterUrl !== "loading" && (
          <a
            href={letterboxdFilmUrl(film.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0"
            title={`${film.title} on Letterboxd`}
          >
            <Image
              src={posterUrl}
              alt={`${film.title} poster`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </a>
        )}
        {posterUrl === null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600 select-none">No poster</span>
          </div>
        )}
        {/* Cross-list count badge */}
        <span className="absolute right-1.5 top-1.5 rounded bg-zinc-900/80 px-1.5 py-0.5 text-xs font-bold text-white tabular-nums backdrop-blur-sm">
          ×{listCount}
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5">
        <div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">{film.title}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{film.year}</p>
        </div>

        {/* List chips */}
        <div className="flex flex-wrap gap-1">
          {listNames.map((name) => (
            <span key={name} className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
              {name}
            </span>
          ))}
        </div>

        {/* Streaming provider logos */}
        {providers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {providers.slice(0, 5).map((p) =>
              p.logoPath ? (
                <Image
                  key={p.id}
                  src={`${TMDB_LOGO_BASE}${p.logoPath}`}
                  alt={p.name}
                  title={p.name}
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
              ) : (
                <span key={p.id} className="rounded bg-zinc-800 px-1 py-0.5 text-[10px] text-white">
                  {p.name}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// ── TopPicks ─────────────────────────────────────────────────────────────────

interface Props {
  films: CrossListFilm[];
  archetype?: Archetype | null;
  limit?: number;
}

export default function TopPicks({ films, archetype, limit = 10 }: Props) {
  const picks = films.filter((f) => f.listCount > 1).slice(0, limit);

  const [region, setRegion] = useState("US");
  const [filmProviders, setFilmProviders] = useState(new Map<string, ProviderInfo[]>());
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [selectedEra, setSelectedEra] = useState<EraLabel | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  // Set region from locale on mount (navigator not available during SSR)
  useEffect(() => {
    setRegion(getLocaleRegion());
  }, []);

  // Reset provider filter when region changes
  useEffect(() => {
    setFilmProviders(new Map());
    setSelectedProvider(null);
  }, [region]);

  const handleProviders = useCallback((filmKey: string, providers: ProviderInfo[]) => {
    setFilmProviders((prev) => {
      const next = new Map(prev);
      next.set(filmKey, providers);
      return next;
    });
  }, []);

  // Build unique provider list from all loaded films, sorted by display name
  const allProviders = useMemo(() => {
    const map = new Map<number, ProviderInfo>();
    for (const providers of filmProviders.values()) {
      providers.forEach((p) => { if (!map.has(p.id)) map.set(p.id, p); });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [filmProviders]);

  // Era filter
  const eraFilteredPicks = useMemo(() => {
    if (!selectedEra) return picks;
    const era = ERAS.find((e) => e.label === selectedEra)!;
    return picks.filter(({ film }) => film.year >= era.from && film.year <= era.to);
  }, [picks, selectedEra]);

  // Provider filter on top of era filter — show unloaded films (assume available)
  const filteredPicks = useMemo(() => {
    if (!selectedProvider) return eraFilteredPicks;
    return eraFilteredPicks.filter(({ film }) => {
      const key = `${film.title}:${film.year}`;
      if (!filmProviders.has(key)) return true;
      return filmProviders.get(key)!.some((p) => p.id === selectedProvider);
    });
  }, [eraFilteredPicks, selectedProvider, filmProviders]);

  if (picks.length === 0) return null;

  return (
    <div>
      {showShareCard && (
        <ShareCard picks={picks} archetype={archetype} onClose={() => setShowShareCard(false)} />
      )}
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Best use of your time
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            Unwatched films that fill gaps across the most lists at once
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 focus:outline-none"
          >
            {TMDB_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowShareCard(true)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700"
          >
            Share ↗
          </button>
          <button
            onClick={() => downloadLetterboxdCsv(films.slice(0, 10).map((f) => f.film), "cinegaps-watchlist.csv")}
            title="Download as Letterboxd-importable CSV"
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700"
          >
            Export ↓
          </button>
        </div>
      </div>

      {/* Era filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {[null, ...ERAS.map((e) => e.label)].map((era) => (
          <button
            key={era ?? "all"}
            onClick={() => setSelectedEra(era as EraLabel | null)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedEra === era
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {era ?? "All eras"}
          </button>
        ))}
      </div>

      {/* Provider filter — appears as streaming data loads in */}
      {allProviders.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedProvider(null)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              !selectedProvider
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {allProviders.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id === selectedProvider ? null : p.id)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedProvider === p.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {p.logoPath && (
                <Image
                  src={`${TMDB_LOGO_BASE}${p.logoPath}`}
                  alt=""
                  width={14}
                  height={14}
                  className="rounded-sm"
                />
              )}
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Film grid */}
      {filteredPicks.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">No films available on this service.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {filteredPicks.map(({ film, listCount, listNames }) => (
            <TopPickCard
              key={`${film.title}-${film.year}`}
              film={film}
              listCount={listCount}
              listNames={listNames}
              region={region}
              onProviders={handleProviders}
            />
          ))}
        </div>
      )}
    </div>
  );
}
