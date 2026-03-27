"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CrossListFilm } from "../lib/compare";
import { fetchPosterResult } from "../lib/poster";

interface Props {
  picks: CrossListFilm[];
  onClose: () => void;
}

const MAX_POSTERS = 9;

export default function ShareCard({ picks, onClose }: Props) {
  const [posterUrls, setPosterUrls] = useState<Map<string, string | null>>(new Map());
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const displayPicks = picks.slice(0, MAX_POSTERS);

  // Fetch posters for the card
  useEffect(() => {
    displayPicks.forEach(({ film }) => {
      fetchPosterResult(film.title, film.year).then(({ posterUrl }) => {
        setPosterUrls((prev) => {
          const next = new Map(prev);
          next.set(`${film.title}:${film.year}`, posterUrl);
          return next;
        });
      });
    });
  // Only run on mount — picks are stable during share card lifetime
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleShare() {
    const text = displayPicks
      .map(({ film, listCount, listNames }, i) =>
        `${i + 1}. ${film.title} (${film.year}) — on ${listCount} lists: ${listNames.join(", ")}`
      )
      .join("\n");
    const shareText = `My film blind spots (via Cinegaps):\n\n${text}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "My Film Blind Spots — Cinegaps", text: shareText, url: window.location.href });
        return;
      }
    } catch {
      // Share cancelled or not supported — fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  }

  // Close on backdrop click
  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onBackdropClick}
    >
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {/* The shareable card */}
        <div
          ref={cardRef}
          className="rounded-2xl bg-zinc-950 p-5 shadow-2xl ring-1 ring-white/10"
        >
          {/* Header */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cinegaps</p>
            <h2 className="mt-0.5 text-lg font-bold text-white leading-tight">My Film Blind Spots</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {displayPicks.length} films I need to watch
            </p>
          </div>

          {/* Poster grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {displayPicks.map(({ film, listNames }) => {
              const key = `${film.title}:${film.year}`;
              const url = posterUrls.get(key);
              return (
                <div key={key} className="flex flex-col gap-1">
                  <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-zinc-800">
                    {url === undefined && (
                      <div className="absolute inset-0 animate-pulse bg-zinc-700" />
                    )}
                    {url != null && url !== undefined && (
                      <Image
                        src={url}
                        alt={film.title}
                        fill
                        className="object-cover"
                        sizes="30vw"
                      />
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-300 leading-tight line-clamp-2 font-medium">
                    {film.title}
                  </p>
                  <p className="text-[8px] text-zinc-500">
                    {film.year} · {listNames.slice(0, 2).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-[9px] text-zinc-600 tracking-wide">
            cinegaps.com
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:opacity-80"
          >
            {copied ? "Copied!" : "Share / Copy"}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <p className="text-center text-[10px] text-zinc-500">
          Screenshot this card to share on social media
        </p>
      </div>
    </div>
  );
}
