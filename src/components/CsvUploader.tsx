"use client";

import { useRef, useState } from "react";
import { parseCsv } from "../lib/parseCsv";
import type { WatchedFilm } from "../lib/types";

interface Props {
  onParsed: (films: WatchedFilm[]) => void;
}

export default function CsvUploader({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file exported from Letterboxd.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const films = parseCsv(text);
      if (films.length === 0) {
        setError("No films found. Make sure this is a Letterboxd watched.csv export.");
        return;
      }
      onParsed(films);
    };
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
        dragging ? "border-blue-500 bg-blue-50" : "border-zinc-300 bg-zinc-50"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <p className="mb-4 text-center text-zinc-600">
        Drop your Letterboxd <code className="rounded bg-zinc-200 px-1 text-sm">watched.csv</code> here
      </p>
      <button
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        onClick={() => inputRef.current?.click()}
      >
        Choose file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={onInputChange}
      />
      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-4 text-xs text-zinc-400">
        Export from Letterboxd → Settings → Import & Export → Export Your Data
      </p>
    </div>
  );
}
