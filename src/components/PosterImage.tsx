"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchPosterUrl } from "../lib/poster";

interface Props {
  title: string;
  year: number;
  /** Tailwind classes for the outer container — controls size and shape */
  className?: string;
  sizes?: string;
  /** If provided, wraps the poster in an anchor tag */
  href?: string;
}

export default function PosterImage({
  title,
  year,
  className = "",
  sizes = "20vw",
  href,
}: Props) {
  const [url, setUrl] = useState<string | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    fetchPosterUrl(title, year).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [title, year]);

  const container = `relative overflow-hidden rounded ${className}`;

  const inner =
    url === "loading" ? (
      <div className={`${container} bg-zinc-100 dark:bg-zinc-800 animate-pulse`} />
    ) : url === null ? (
      <div className={`${container} bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center`}>
        <span className="text-zinc-300 dark:text-zinc-600 text-[9px] text-center leading-tight px-1 select-none">
          No poster
        </span>
      </div>
    ) : (
      <div className={container}>
        <Image
          src={url}
          alt={`${title} poster`}
          fill
          className="object-cover"
          sizes={sizes}
        />
      </div>
    );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        title={`${title} on Letterboxd`}
      >
        {inner}
      </a>
    );
  }

  return inner;
}
