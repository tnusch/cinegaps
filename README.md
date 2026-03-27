# Cinegaps

Find the blind spots in your film education. Cinegaps compares your Letterboxd watch history against curated canonical lists and shows you exactly which great films you're missing, where the gaps fall by decade, and which unwatched films would close the most ground across multiple lists at once.

---

## Features

- **Letterboxd CSV import** — drag-and-drop your `watched.csv` export; no account connection required
- **9 canonical lists across 3 categories** — select any combination to compare against:
  - *Critics' Consensus*: Sight & Sound 2022, TSPDT 1,000 Greatest Films, Roger Ebert's Great Movies
  - *Fan Favorites*: Letterboxd Official Top 250, Letterboxd Top 250 Most Fans, IMDb Top 250
  - *Award Winners*: Oscar Best Picture Winners, Cannes Palme d'Or Winners, 1001 Movies You Must See Before You Die
- **Coverage rings** — SVG radial rings showing your seen/total ratio per list at a glance
- **Decade heatmap** — color-coded grid revealing which eras of cinema you've covered and where the gaps are
- **Top picks** — ranked recommendations of unseen films that appear on the most selected lists (highest-impact watches)
- **Streaming availability** — see which streaming services carry each top pick in your region (powered by TMDB, flatrate only)
- **Region selector** — choose your TMDB region; defaults to your locale automatically
- **Blind spot browser** — per-list tabs to browse every unseen or seen film with posters
- **Letterboxd links** — poster images link directly to each film's Letterboxd page
- **Shareable results card** — generate a visual card of your top picks to share with others
- **Dark mode** — manual toggle, persists across sessions, respects system preference on first visit
- **Fuzzy matching** — title normalization (articles, punctuation) with ±1 year tolerance handles release date ambiguity
- **Fully client-side** — all CSV processing happens in the browser; nothing is uploaded to a server

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
3. Explore your coverage rings, decade heatmap, top picks, and per-list blind spots

---

## Build for Production

```bash
npm run build
npm start
```
