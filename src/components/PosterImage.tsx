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
}

export default function PosterImage({
  title,
  year,
  className = "",
  sizes = "20vw",
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

  if (url === "loading") {
    return <div className={`${container} bg-zinc-100 animate-pulse`} />;
  }

  if (url === null) {
    return (
      <div className={`${container} bg-zinc-100 flex items-center justify-center`}>
        <span className="text-zinc-300 text-[9px] text-center leading-tight px-1 select-none">
          No poster
        </span>
      </div>
    );
  }

  return (
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
}
