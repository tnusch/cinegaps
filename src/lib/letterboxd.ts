/**
 * Converts a film title to a Letterboxd URL slug.
 * e.g. "2001: A Space Odyssey" → "2001-a-space-odyssey"
 */
export function letterboxdSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove all non-alphanumeric chars (keeps spaces)
    .trim()
    .replace(/\s+/g, "-"); // spaces → hyphens
}

export function letterboxdFilmUrl(title: string): string {
  return `https://letterboxd.com/film/${letterboxdSlug(title)}/`;
}
