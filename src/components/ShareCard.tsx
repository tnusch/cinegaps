"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CrossListFilm } from "../lib/compare";
import type { Archetype } from "../lib/archetype";
import { fetchPosterResult } from "../lib/poster";

interface Props {
  picks: CrossListFilm[];
  archetype?: Archetype | null;
  onClose: () => void;
}

const PREVIEW_FILMS = 6; // 2 rows × 3 cols in both preview and generated image

// ── Canvas helpers ────────────────────────────────────────────────────────────

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function loadCORSImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = src;
  });
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + "…").width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

async function generateCardBlob(
  picks: CrossListFilm[],
  posterUrls: Map<string, string | null>,
  archetype?: Archetype | null
): Promise<Blob | null> {
  const SCALE = 2;
  const W = 540;
  const PAD = 24;
  const COLS = 3;
  const GAP = 8;
  const POSTER_W = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const POSTER_H = Math.round(POSTER_W * 1.5);
  const META_H = 36;
  const HEADER_H = archetype ? 116 : 96;
  const FOOTER_H = 36;

  const films = picks.slice(0, PREVIEW_FILMS);
  const rows = Math.ceil(films.length / COLS);
  const H = HEADER_H + rows * (POSTER_H + META_H + GAP) - GAP + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "left";
  ctx.fillStyle = "#52525b";
  ctx.font = "bold 10px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("CINEGAPS", PAD, PAD + 12);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("My Film Blind Spots", PAD, PAD + 42);

  if (archetype) {
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "13px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(archetype.label, PAD, PAD + 64);
    ctx.fillStyle = "#71717a";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(truncateText(ctx, archetype.description, W - PAD * 2), PAD, PAD + 84);
  } else {
    ctx.fillStyle = "#71717a";
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`${films.length} films I need to watch`, PAD, PAD + 64);
  }

  for (let i = 0; i < films.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (POSTER_W + GAP);
    const y = HEADER_H + row * (POSTER_H + META_H + GAP);
    const { film } = films[i];
    const key = `${film.title}:${film.year}`;
    const url = posterUrls.get(key);

    ctx.fillStyle = "#27272a";
    fillRoundRect(ctx, x, y, POSTER_W, POSTER_H, 6);

    if (url) {
      try {
        const img = await loadCORSImage(url);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + 6, y);
        ctx.arcTo(x + POSTER_W, y, x + POSTER_W, y + POSTER_H, 6);
        ctx.arcTo(x + POSTER_W, y + POSTER_H, x, y + POSTER_H, 6);
        ctx.arcTo(x, y + POSTER_H, x, y, 6);
        ctx.arcTo(x, y, x + POSTER_W, y, 6);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, POSTER_W, POSTER_H);
        ctx.restore();
      } catch {
        // keep placeholder
      }
    }

    const titleY = y + POSTER_H + 13;
    ctx.fillStyle = "#d4d4d8";
    ctx.font = "bold 9px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(truncateText(ctx, film.title, POSTER_W), x, titleY);
    ctx.fillStyle = "#71717a";
    ctx.font = "9px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(String(film.year), x, titleY + 14);
  }

  ctx.fillStyle = "#3f3f46";
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("cinegaps.com", W / 2, H - 12);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShareCard({ picks, archetype, onClose }: Props) {
  const [posterUrls, setPosterUrls] = useState<Map<string, string | null>>(new Map());
  // Pre-generated blob — ready before the user taps Share so iOS gesture stays valid
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [generating, setGenerating] = useState(false);

  const displayPicks = picks.slice(0, PREVIEW_FILMS);

  // Fetch posters for all preview films
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postersLoaded = displayPicks.filter(
    ({ film }) => posterUrls.has(`${film.title}:${film.year}`)
  ).length;
  const allLoaded = postersLoaded === displayPicks.length;

  // As soon as all posters are in, bake the PNG so it's ready when the user taps Share
  useEffect(() => {
    if (!allLoaded) return;
    generateCardBlob(picks, posterUrls, archetype).then((blob) => {
      if (blob) setCardBlob(blob);
    });
  // posterUrls identity changes on each poster load; allLoaded gates the final run
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLoaded]);

  function handleShare() {
    if (!cardBlob) return;

    const file = new File([cardBlob], "cinegaps-blindspots.png", { type: "image/png" });

    // Attempt native share (iOS Safari, Android Chrome).
    // Must be called synchronously from the gesture — no awaits before this.
    if (navigator.share) {
      navigator.share({ title: "My Film Blind Spots — Cinegaps", files: [file] })
        .then(() => { /* success */ })
        .catch((e: Error) => {
          if (e.name === "AbortError") return; // user cancelled
          // Share unsupported or failed — fall through to download
          downloadBlob(cardBlob);
        });
      return;
    }

    downloadBlob(cardBlob);
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cinegaps-blindspots.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const buttonLabel = !allLoaded
    ? `Loading… ${postersLoaded}/${displayPicks.length}`
    : !cardBlob
    ? "Preparing…"
    : "Share / Download";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onBackdropClick}
    >
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* Preview card */}
        <div className="rounded-2xl bg-zinc-950 p-4 shadow-2xl ring-1 ring-white/10">
          {/* Header */}
          <div className="mb-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Cinegaps</p>
            <h2 className="mt-0.5 text-base font-bold text-white leading-tight">My Film Blind Spots</h2>
            {archetype && (
              <p className="text-[11px] text-zinc-400 mt-0.5">{archetype.label}</p>
            )}
          </div>

          {/* Poster grid — 3 cols × 2 rows */}
          <div className="grid grid-cols-3 gap-1">
            {displayPicks.map(({ film, listNames }) => {
              const key = `${film.title}:${film.year}`;
              const url = posterUrls.get(key);
              return (
                <div key={key} className="flex flex-col gap-0.5">
                  <div className="relative aspect-2/3 w-full overflow-hidden rounded-md bg-zinc-800">
                    {url === undefined && (
                      <div className="absolute inset-0 animate-pulse bg-zinc-700" />
                    )}
                    {url != null && url !== undefined && (
                      <Image src={url} alt={film.title} fill className="object-cover" sizes="25vw" />
                    )}
                  </div>
                  <p className="text-[8px] text-zinc-300 leading-tight line-clamp-1 font-medium">
                    {film.title}
                  </p>
                  <p className="text-[7px] text-zinc-500 leading-none">
                    {film.year} · {listNames.slice(0, 1).join("")}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-center text-[8px] text-zinc-600 tracking-wide">cinegaps.com</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            disabled={!cardBlob}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
          >
            {buttonLabel}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
