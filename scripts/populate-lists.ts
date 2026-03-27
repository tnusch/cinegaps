#!/usr/bin/env tsx
/**
 * populate-lists.ts
 *
 * Reads the `listUri` from each canonical list file, scrapes the Letterboxd
 * list page(s) to get film slugs, then fetches each film's page for accurate
 * title / year / director data (via JSON-LD), and rewrites the `films` array
 * in the source file in-place.
 *
 * Usage:
 *   npx tsx scripts/populate-lists.ts                 # all lists
 *   npx tsx scripts/populate-lists.ts --list imdb-top250
 *   npx tsx scripts/populate-lists.ts --dry-run        # preview only
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";

// ── Config ────────────────────────────────────────────────────────────────────

const LISTS_DIR = resolve(process.cwd(), "src/data/lists");
/** ms between individual film-page fetches */
const FILM_DELAY = 300;
/** ms between list-page fetches */
const PAGE_DELAY = 1500;
/** Film pages fetched in parallel per round */
const BATCH = 8;

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilmEntry {
  title: string;
  year: number;
  director: string;
}

interface ListMeta {
  file: string;
  id: string;
  listUri: string;
}

// ── CLI args ──────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const TARGET = argv.includes("--list") ? argv[argv.indexOf("--list") + 1] : null;

// ── HTTP ──────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function get(url: string, retries = 4): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (res.status === 429) {
        const wait = 8000 * attempt;
        console.warn(`  rate-limited — waiting ${wait / 1000}s`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1500 * attempt);
    }
  }
  /* istanbul ignore next */
  throw new Error("unreachable");
}

// ── Letterboxd list scraping ──────────────────────────────────────────────────

/** Extract ordered film slugs from one list page. */
function slugsFromPage(html: string): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  // data-target-link="/film/{slug}/" is present on every film-poster element
  const re = /data-target-link="\/film\/([^/"]+)\/"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      slugs.push(m[1]);
    }
  }
  return slugs;
}

function pageHasNext(html: string): boolean {
  // Letterboxd renders <a class="next" ...> when another page exists
  return /class="[^"]*\bnext\b[^"]*"/.test(html);
}

async function fetchAllSlugs(listUri: string): Promise<string[]> {
  const base = listUri.replace(/\/$/, "");
  const all: string[] = [];
  let page = 1;

  while (true) {
    const url = page === 1 ? `${base}/` : `${base}/page/${page}/`;
    process.stdout.write(`  page ${page} … `);
    const html = await get(url);
    const slugs = slugsFromPage(html);
    process.stdout.write(`${slugs.length} films\n`);
    if (slugs.length === 0) break;
    all.push(...slugs);
    if (!pageHasNext(html)) break;
    page++;
    await sleep(PAGE_DELAY);
  }

  return all;
}

// ── Film detail via JSON-LD ───────────────────────────────────────────────────

async function filmDetails(slug: string): Promise<FilmEntry | null> {
  try {
    const html = await get(`https://letterboxd.com/film/${slug}/`);
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) return null;

    // Letterboxd wraps JSON-LD in CDATA comments — strip before parsing
    const raw = m[1]
      .replace(/\/\*\s*<!\[CDATA\[[\s\S]*?\*\//g, "")
      .replace(/\/\*\s*\]\]>[\s\S]*?\*\//g, "")
      .trim();
    const data = JSON.parse(raw);
    const title: string = data.name;
    const releaseDate = data.releasedEvent?.[0]?.startDate ?? data.releasedEvent?.startDate;
    const year = parseInt(releaseDate ?? data.dateCreated ?? "", 10);
    const rawDirs = data.director ?? [];
    const dirs: string[] = (Array.isArray(rawDirs) ? rawDirs : [rawDirs]).map(
      (d: { name: string }) => d.name
    );

    if (!title || isNaN(year)) return null;
    return { title, year, director: dirs.join(", ") };
  } catch {
    process.stdout.write(`⚠  no details for "${slug}" — skipped\n`);
    return null;
  }
}

// ── File rewriting ────────────────────────────────────────────────────────────

function renderFilms(films: FilmEntry[]): string {
  return films
    .map((f) => {
      const dir = f.director ? `, director: ${JSON.stringify(f.director)}` : "";
      return `    { title: ${JSON.stringify(f.title)}, year: ${f.year}${dir} },`;
    })
    .join("\n");
}

function rewriteFile(filePath: string, films: FilmEntry[]): void {
  const src = readFileSync(filePath, "utf-8");
  // Match everything between `films: [` and the matching `],`
  const updated = src.replace(
    /(\s+films:\s*\[)[\s\S]*?(\n\s+\],)/,
    `$1\n${renderFilms(films)}\n$2`
  );
  if (updated === src) {
    console.warn("  ⚠  films-array pattern not matched — file unchanged");
    return;
  }
  writeFileSync(filePath, updated, "utf-8");
}

// ── Discovery ─────────────────────────────────────────────────────────────────

function discoverLists(): ListMeta[] {
  return readdirSync(LISTS_DIR)
    .filter((f) => f.endsWith(".ts"))
    .flatMap((name) => {
      const file = join(LISTS_DIR, name);
      const src = readFileSync(file, "utf-8");
      const uriM = src.match(/listUri:\s*["']([^"']+)["']/);
      const idM = src.match(/\bid:\s*["']([^"']+)["']/);
      if (!uriM) return [];
      return [
        {
          file,
          id: idM ? idM[1] : name.replace(".ts", ""),
          listUri: uriM[1],
        },
      ];
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function processOne(list: ListMeta): Promise<void> {
  console.log(`\n── ${list.id} ──────────────────────────────`);
  console.log(`   ${list.listUri}`);

  if (!list.listUri.includes("letterboxd.com")) {
    console.warn("  ⚠  non-Letterboxd URI — skipping (not yet supported)");
    return;
  }

  // 1. Collect slugs from all pages
  const slugs = await fetchAllSlugs(list.listUri);
  if (slugs.length === 0) {
    console.warn("  ⚠  no slugs found — skipping");
    return;
  }
  console.log(`  total: ${slugs.length} slugs`);

  // 2. Resolve title / year / director for each slug
  const films: FilmEntry[] = [];
  for (let i = 0; i < slugs.length; i += BATCH) {
    const batch = slugs.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(filmDetails));
    films.push(...(results.filter(Boolean) as FilmEntry[]));
    const done = Math.min(i + BATCH, slugs.length);
    process.stdout.write(`\r  details: ${done} / ${slugs.length}`);
    if (done < slugs.length) await sleep(FILM_DELAY);
  }
  process.stdout.write("\n");
  console.log(`  resolved: ${films.length} / ${slugs.length} films`);

  // 3. Write back
  if (DRY_RUN) {
    console.log("  dry-run — not writing. first 5:");
    console.log(films.slice(0, 5));
    return;
  }
  rewriteFile(list.file, films);
  console.log(`  ✓ wrote ${list.file}`);
}

async function main(): Promise<void> {
  const all = discoverLists();
  if (all.length === 0) {
    console.error("No list files with a listUri field found.");
    process.exit(1);
  }

  const targets = TARGET ? all.filter((l) => l.id === TARGET) : all;
  if (targets.length === 0) {
    console.error(`No list with id "${TARGET}" found.`);
    console.error("Available ids:", all.map((l) => l.id).join(", "));
    process.exit(1);
  }

  console.log(
    `populate-lists${DRY_RUN ? " (dry run)" : ""} — ${targets.length} list(s)\n`
  );

  for (const list of targets) {
    await processOne(list);
  }

  console.log("\nAll done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
