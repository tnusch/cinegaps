"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { CrossListFilm } from "../lib/compare";
import { fetchPosterResult } from "../lib/poster";
import { fetchProviders, type ProviderInfo } from "../lib/providers";
import type { Film } from "../lib/types";

const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w45";

// ── TopPickCard ──────────────────────────────────────────────────────────────

interface CardProps {
  film: Film;
  listCount: number;
  listNames: string[];
  onProviders: (filmKey: string, providers: ProviderInfo[]) => void;
}

const TopPickCard = memo(function TopPickCard({ film, listCount, listNames, onProviders }: CardProps) {
  const [posterUrl, setPosterUrl] = useState<string | null | "loading">("loading");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const filmKey = `${film.title}:${film.year}`;

  useEffect(() => {
    let cancelled = false;
    fetchPosterResult(film.title, film.year).then(({ posterUrl, tmdbId }) => {
      if (cancelled) return;
      setPosterUrl(posterUrl);
      if (tmdbId) {
        fetchProviders(tmdbId).then((p) => {
          if (cancelled) return;
          setProviders(p);
          onProviders(filmKey, p);
        });
      } else {
        onProviders(filmKey, []);
      }
    });
    return () => { cancelled = true; };
  // filmKey is derived from film.title and film.year — listing it is sufficient
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filmKey, onProviders]);

  return (
    <div className="flex flex-col gap-2">
      {/* Poster */}
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-zinc-100">
        {posterUrl === "loading" && (
          <div className="absolute inset-0 animate-pulse bg-zinc-200" />
        )}
        {posterUrl && posterUrl !== "loading" && (
          <Image
            src={posterUrl}
            alt={`${film.title} poster`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        )}
        {posterUrl === null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-zinc-300 select-none">No poster</span>
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
          <p className="text-xs font-semibold text-zinc-900 leading-tight line-clamp-2">{film.title}</p>
          <p className="text-xs text-zinc-400">{film.year}</p>
        </div>

        {/* List chips */}
        <div className="flex flex-wrap gap-1">
          {listNames.map((name) => (
            <span key={name} className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-500">
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
  limit?: number;
}

export default function TopPicks({ films, limit = 10 }: Props) {
  const picks = films.filter((f) => f.listCount > 1).slice(0, limit);

  const [filmProviders, setFilmProviders] = useState(new Map<string, ProviderInfo[]>());
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

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

  // When filtering: show films not yet loaded (assume available) + confirmed matches
  const filteredPicks = useMemo(() => {
    if (!selectedProvider) return picks;
    return picks.filter(({ film }) => {
      const key = `${film.title}:${film.year}`;
      if (!filmProviders.has(key)) return true;
      return filmProviders.get(key)!.some((p) => p.id === selectedProvider);
    });
  }, [picks, selectedProvider, filmProviders]);

  async function handleShare() {
    const lines = picks
      .map(({ film, listCount, listNames }, i) =>
        `${i + 1}. ${film.title} (${film.year}) — ×${listCount}: ${listNames.join(", ")}`
      )
      .join("\n");
    const text = `My film blind spots (via Cinegaps):\n\n${lines}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Film Blind Spots — Cinegaps", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled or browser blocked
    }
  }

  if (picks.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Best use of your time
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            Unwatched films that fill gaps across the most lists at once
          </p>
        </div>
        <button
          onClick={handleShare}
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
        >
          {copied ? "Copied!" : "Share ↗"}
        </button>
      </div>

      {/* Provider filter — appears as streaming data loads in */}
      {allProviders.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedProvider(null)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              !selectedProvider
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
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
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
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
        <p className="text-sm text-zinc-400 italic">No films available on this service.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {filteredPicks.map(({ film, listCount, listNames }) => (
            <TopPickCard
              key={`${film.title}-${film.year}`}
              film={film}
              listCount={listCount}
              listNames={listNames}
              onProviders={handleProviders}
            />
          ))}
        </div>
      )}
    </div>
  );
}
