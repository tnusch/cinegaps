# Cinegaps

Find the blind spots in your film education. Cinegaps compares your Letterboxd watch history against curated canonical lists and shows you exactly which great films you're missing, where the gaps fall by era, and which unwatched films would close the most ground across multiple lists at once.

---

## Features

- **Letterboxd CSV import** — drop your `watched.csv` export and get results instantly; no account connection or login required
- **9 canonical lists across 3 categories** — compare against Critics' Consensus (Sight & Sound, TSPDT, Ebert), Fan Favorites (Letterboxd Top 500, Most Fans, IMDb), and Award Winners (Oscars, Cannes, 1001 Movies); mix and match freely
- **Top picks** — ranks unseen films by how many of your selected lists they appear on, surfacing the single highest-impact watches first
- **Visuals** — coverage rings show your seen/total ratio per list at a glance; era donuts (Classic, Golden, Modern, Current) show where your blind spots cluster across cinema history
- **Streaming availability** — each top pick shows which flatrate services carry it in your region, so you can act on a recommendation immediately
- **Fuzzy matching** — normalises titles (articles, punctuation, diacritics) and applies ±1 year tolerance so release-date inconsistencies between Letterboxd and canonical sources don't create false gaps
- **Fully client-side** — your watch history never leaves the browser; all processing happens locally with no server upload

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
| [1001 Movies You Must See Before You Die](https://en.wikipedia.org/wiki/1001_Movies_You_Must_See_Before_You_Die) | Award Winners | 1,259 | Encyclopedic — all eras, all countries | Cumulative across all editions (films added annually, rarely removed); emphasises breadth and historical significance |

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| Posters & streaming | [TMDB API](https://www.themoviedb.org/documentation/api) |
| Font | Geist |

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
3. Explore your coverage rings, era donuts, top picks, and per-list blind spots

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

Available list IDs: `sight-and-sound-2022`, `tspdt-1000`, `roger-ebert`, `letterboxd-official-500`, `letterboxd-most-fans-100`, `imdb-top250`, `oscar-best-picture`, `cannes-palme-dor`, `1001-movies`.

---

## Build for Production

```bash
npm run build
npm start
```
