# Cinegaps

Find the blind spots in your film education. Cinegaps compares your Letterboxd watch history against curated canonical lists — Sight & Sound, Criterion, 1001 Movies — and shows you exactly which great films you're missing, where the gaps fall by decade, and which unwatched films would close the most ground across multiple lists at once.

---

## Features

- **Letterboxd CSV import** — drag-and-drop your `watched.csv` export; no account connection required
- **Multi-list comparison** — toggle between Sight & Sound 2022, Criterion Collection, and 1001 Movies You Must See Before You Die
- **Coverage rings** — SVG radial rings showing your seen/total ratio per list
- **Decade heatmap** — color-coded grid revealing which eras of cinema you've covered and where the gaps are
- **Top picks** — ranked recommendations of unseen films that appear across the most lists (highest-impact watches)
- **Blind spot browser** — per-list tabs to browse every unseen or seen film
- **Fuzzy matching** — title normalization (articles, punctuation) with ±1 year tolerance handles release date ambiguity
- **Fully client-side** — all processing happens in the browser; nothing is uploaded to a server

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| Font | Geist |

---

## Getting Started

**Prerequisites**: Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
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
