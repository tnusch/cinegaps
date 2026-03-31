# Cinegaps

Find the blind spots in your film education. Cinegaps compares your Letterboxd watch history against curated canonical lists and shows you exactly which great films you're missing, where the gaps fall by era, and which unwatched films would close the most ground across multiple lists at once.

---

## Features

- **Letterboxd CSV import** — drop your `watched.csv` export and get results instantly; no account connection or login required
- **9 canonical lists across 3 categories** — compare against Critics' Consensus (Sight & Sound, TSPDT, Ebert), Fan Favorites (Letterboxd Top 500, Most Fans, IMDb), and Award Winners (Oscars, Cannes, Venice); mix and match freely
- **Blind spot profile** — derives your viewing archetype (The Cinephile, The Anglophone, The New Waver, etc.) from your era and category coverage patterns, with stat bars showing the underlying signals
- **Top picks** — ranks unseen films by how many of your selected lists they appear on, surfacing the single highest-impact watches first
- **Streaming availability** — each top pick shows which flatrate services carry it in your region, so you can act on a recommendation immediately
- **CSV export** — download your top 10 blind spots as a Letterboxd-importable watchlist CSV
- **Private by design** — your watch history never leaves the browser; all processing is fully client-side with no server upload

---

## Canonical Lists

| List | Category | Films | Scope | Bias |
|---|---|---|---|---|
| [Sight & Sound Greatest Films 2022](https://www.bfi.org.uk/sight-and-sound/greatest-films-all-time) | Critics' Consensus | 264 | All eras, all countries | Heavy toward European arthouse and silent/classic era; Chantal Akerman's *Jeanne Dielman* holds #1 |
| [TSPDT 1,000 Greatest Films](https://www.theyshootpictures.com/gf1000.htm) | Critics' Consensus | 1,000 | Broadest critical scope — all eras, all countries | Aggregate of hundreds of polls and guides; rewards consensus across multiple critical traditions |
| [Roger Ebert's Great Movies](https://www.rogerebert.com/great-movies) | Critics' Consensus | 378 | Mixed — Hollywood classics through world cinema | Strong on American studio-era films, Italian neorealism, and personal favourites; excludes many recent releases |
| [Letterboxd Top 500](https://letterboxd.com/official/list/letterboxds-top-500-films/) | Fan Favorites | 500 | Weighted average rating across all Letterboxd users | Skews toward celebrated arthouse and prestige cinema; broadly overlaps with Sight & Sound |
| [Letterboxd Most Fans](https://letterboxd.com/official/list/most-fans-on-letterboxd/) | Fan Favorites | 100 | Films most often listed as a personal favourite | Skews toward genre cinema, contemporary releases, and cult favourites; very different from the ratings-based list |
| [IMDb Top 250](https://www.imdb.com/chart/top/) | Fan Favorites | 250 | Highest-rated films on IMDb (min. votes threshold) | Dominated by English-language and mainstream cinema; over-represents blockbusters and recent releases |
| [Oscar Best Picture Winners](https://www.oscars.org/oscars/ceremonies/1) | Award Winners | 98 | One film per year, 1927/28–present | Rewards prestige Hollywood productions; historically poor track record with foreign-language and genre films |
| [Cannes Palme d'Or Winners](https://www.festival-cannes.com) | Award Winners | 103 | One film per year, 1955–present; includes joint winners | Strong European arthouse slant; more adventurous than the Oscars; includes joint winners and honorary awards |
| [Venice Golden Lion Winners](https://letterboxd.com/cyyc1520/list/venice-golden-lion/) | Award Winners | 83 | One film per year, 1945–present | The oldest major film festival award; broader international range than Cannes, with a history of rewarding challenging and formally daring work |

---

## Blind Spot Archetypes

The profile section derives one of eleven archetypes from your coverage data:

| Archetype | Signal |
|---|---|
| The Newcomer | Overall coverage below 10% |
| The Completionist | Overall coverage above 65% |
| The Cinephile | Critics' lists lead by 12+ points over Fans and Awards |
| The Populist | Fan lists lead by 12+ points over Critics and Awards |
| The Ceremony Watcher | Awards lists lead by 12+ points over Critics and Fans |
| The Anglophone | IMDb coverage leads Sight & Sound + Cannes average by 20+ points |
| The Archivist | Classic era (pre-1960) coverage dominates by 15+ points |
| The New Waver | Golden era (1960–79) coverage dominates by 15+ points |
| The Nineties Kid | Modern era (1980–99) coverage dominates by 15+ points |
| The Modernist | Current era (2000–) coverage dominates by 15+ points |
| The Explorer | No dominant pattern |

---

## Project Structure

```
cinegaps/
├── src/
│   ├── app/
│   │   ├── page.tsx                 Main page — all steps wired together
│   │   ├── layout.tsx               Root layout and dark mode initialisation
│   │   └── api/
│   │       ├── poster/route.ts      Proxy route: TMDB poster images
│   │       └── providers/route.ts   Proxy route: TMDB streaming availability
│   ├── components/
│   │   ├── ArchetypeCard.tsx        Blind spot profile card with era/category stat bars
│   │   ├── CsvUploader.tsx          Drag-and-drop / click CSV upload area
│   │   ├── EraChart.tsx             Era coverage bar chart
│   │   ├── ListSelector.tsx         Category and list toggle UI
│   │   ├── RadialRing.tsx           Circular coverage indicator per list
│   │   ├── ResultsPanel.tsx         Seen/unseen film browser, grouped by list
│   │   ├── StepSidebar.tsx          Sticky step-navigation sidebar
│   │   └── TopPicks.tsx             Top picks grid with era/provider filters and CSV export
│   ├── lib/
│   │   ├── archetype.ts             Derives viewer archetype from coverage data
│   │   ├── compare.ts               Film matching, gap analysis, era stats
│   │   ├── export.ts                Letterboxd-compatible CSV download
│   │   ├── letterboxd.ts            URL and slug helpers for Letterboxd links
│   │   ├── parseCsv.ts              Parses Letterboxd watched.csv exports
│   │   ├── poster.ts                TMDB poster fetching with in-flight cache
│   │   ├── providers.ts             TMDB streaming provider fetching with cache
│   │   ├── regions.ts               TMDB region codes and browser locale detection
│   │   ├── types.ts                 Shared TypeScript types
│   │   └── __tests__/               Vitest unit tests for all core logic
│   └── data/
│       ├── index.ts                 Exports ALL_LISTS array
│       └── lists/                   One .ts file per canonical list (9 total)
├── scripts/
│   └── populate-lists.ts            Scrapes Letterboxd to refresh list data
├── vitest.config.ts                 Vitest configuration
└── public/                          Static assets
```

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| Testing | [Vitest](https://vitest.dev) |
| Posters & streaming | [TMDB API](https://www.themoviedb.org/documentation/api) |

---

## Getting Started

**Prerequisites**: Node.js 18+

### 1. Set up TMDB for posters and streaming data (optional)

Movie posters and streaming availability are fetched from [The Movie Database](https://www.themoviedb.org). Without an API key the app works normally — posters and provider info just won't load.

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to **Settings → API** and copy your API key
3. Create `.env.local` in the project root:

```bash
TMDB_API_KEY=your_api_key_here
```

### 2. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Export your Letterboxd history

1. Log in to [letterboxd.com](https://letterboxd.com)
2. Go to **Settings → Import & Export → Export Your Data**
3. Download and unzip — use the `watched.csv` file

### Usage

1. Drop your `watched.csv` onto the upload area
2. Select which canonical lists to compare against (all selected by default)
3. Review your coverage rings, blind spot profile, and top picks
4. Use **Export** to download a Letterboxd-importable watchlist CSV

---

## Tests

The core logic in `src/lib/` is covered by unit tests using [Vitest](https://vitest.dev). No browser or React setup required — these are pure function tests.

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

**What's covered:**

| File | What's tested |
|---|---|
| `compare.test.ts` | Title normalisation (articles, punctuation), ±1 year tolerance, `compare`/`compareAll`, `crossListGaps` deduplication and sort, `buildEraStats` era bucketing and cross-list deduplication |
| `archetype.test.ts` | All 11 archetypes, threshold boundary values, edge cases (empty results, missing categories, single active era) |
| `parseCsv.test.ts` | Valid rows, Windows CRLF line endings, quoted fields with embedded commas, missing/invalid year (skipped), invalid rating (→ `undefined`) |
| `letterboxd.test.ts` | Slug generation with colons, apostrophes, numbers, and multiple spaces |
| `regions.test.ts` | Locale extraction, language tag without region segment, unknown region code, navigator unavailable |
| `export.test.ts` | CSV header and rows, double-quote escaping, default and custom filenames |

---

## Refreshing Canonical List Data

Each list file in `src/data/lists/` has a `listUri` pointing to its source Letterboxd list. The `populate-lists` script scrapes those pages and rewrites the `films` array in-place with live title, year, and director data.

```bash
# Refresh all lists
npm run populate-lists

# Refresh a single list
npm run populate-lists -- --list imdb-top250

# Preview changes without writing
npm run populate-lists -- --list sight-and-sound-2022 --dry-run
```

The script fetches each film's Letterboxd page to extract structured data (title, year, director) via JSON-LD. Requests are rate-limited automatically — a full refresh of all 9 lists takes several minutes.

Available list IDs: `sight-and-sound-2022`, `tspdt-1000`, `roger-ebert`, `letterboxd-official-500`, `letterboxd-most-fans-100`, `imdb-top250`, `oscar-best-picture`, `cannes-palme-dor`, `venice-golden-lion`.

---

## Build for Production

```bash
npm run build
npm start
```

---

## Contributing

Contributions are welcome. A few ways to help:

- **Add or refresh a canonical list** — run `npm run populate-lists` and open a PR with updated data
- **Improve film matching** — the title normalisation in `src/lib/compare.ts` handles most cases but edge cases exist; tests live in `src/lib/__tests__/compare.test.ts`
- **Fix a bug or add a feature** — open an issue first to discuss the approach, then submit a PR against `main`

Please keep PRs focused — one change per PR makes review faster. Run `npm test` before submitting.

---

## Get in Touch

- **Bug reports and feature requests** — [open an issue](../../issues)
- **Questions and broader discussion** — [start a discussion](../../discussions)

Feedback on the archetype logic, list selection, or matching accuracy is especially welcome.

---

## License

MIT — see [LICENSE](LICENSE) for details.
