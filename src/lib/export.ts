import type { Film } from "./types";

/** Downloads an array of films as a Letterboxd-compatible CSV.
 *  Import at letterboxd.com/import/ — choose "Import as a list". */
export function downloadLetterboxdCsv(films: Film[], filename = "cinegaps-watchlist.csv") {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = "Title,Year";
  const rows = films.map((f) => `${escape(f.title)},${f.year}`);
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
