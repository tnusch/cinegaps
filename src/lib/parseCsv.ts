import type { WatchedFilm } from "./types";

// Letterboxd exports watched.csv with headers:
// Date,Name,Year,Letterboxd URI,Rating
function parseRow(headers: string[], values: string[]): WatchedFilm | null {
  const get = (key: string) => values[headers.indexOf(key)]?.trim() ?? "";

  const title = get("Name");
  const year = parseInt(get("Year"), 10);
  if (!title || isNaN(year)) return null;

  const ratingRaw = parseFloat(get("Rating"));

  return {
    title,
    year,
    rating: isNaN(ratingRaw) ? undefined : ratingRaw,
    watchedDate: get("Date") || undefined,
    letterboxdUri: get("Letterboxd URI") || undefined,
  };
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseCsv(csvText: string): WatchedFilm[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const films: WatchedFilm[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const film = parseRow(headers, values);
    if (film) films.push(film);
  }

  return films;
}
