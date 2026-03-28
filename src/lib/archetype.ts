import type { EraStats } from "./compare";
import type { ComparisonResult } from "./types";

export interface Archetype {
  label: string;
  description: string;
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

export function deriveArchetype(
  results: ComparisonResult[],
  eraStats: EraStats[]
): Archetype | null {
  if (results.length === 0) return null;

  const overall = avg(results.map((r) => r.coveragePercent));

  if (overall < 10) return ARCHETYPES.newcomer;
  if (overall >= 65) return ARCHETYPES.completionist;

  // Category coverage
  const criticsAvg = avg(results.filter((r) => r.list.category === "critics").map((r) => r.coveragePercent));
  const fansAvg = avg(results.filter((r) => r.list.category === "fans").map((r) => r.coveragePercent));
  const awardsAvg = avg(results.filter((r) => r.list.category === "awards").map((r) => r.coveragePercent));

  const hasCritics = results.some((r) => r.list.category === "critics");
  const hasFans = results.some((r) => r.list.category === "fans");
  const hasAwards = results.some((r) => r.list.category === "awards");

  const CATEGORY_LEAD = 12;

  if (hasCritics && hasFans && hasAwards) {
    if (criticsAvg > fansAvg + CATEGORY_LEAD && criticsAvg > awardsAvg + CATEGORY_LEAD)
      return ARCHETYPES.cinephile;
    if (fansAvg > criticsAvg + CATEGORY_LEAD && fansAvg > awardsAvg + CATEGORY_LEAD)
      return ARCHETYPES.populist;
    if (awardsAvg > criticsAvg + CATEGORY_LEAD && awardsAvg > fansAvg + CATEGORY_LEAD)
      return ARCHETYPES.ceremonyWatcher;
  }

  // Anglophone bias: IMDb skews English-language, S&S + Cannes skew international
  const imdb = results.find((r) => r.list.id === "imdb-top250");
  const ss = results.find((r) => r.list.id === "sight-and-sound-2022");
  const cannes = results.find((r) => r.list.id === "cannes-palme-dor");
  if (imdb && imdb.coveragePercent >= 15 && (ss || cannes)) {
    const intlRefs = [ss, cannes].filter(Boolean) as ComparisonResult[];
    const intlAvg = avg(intlRefs.map((r) => r.coveragePercent));
    if (imdb.coveragePercent > intlAvg + 20) return ARCHETYPES.anglophone;
  }

  // Era dominance
  const relevant = eraStats.filter((e) => e.total > 0 && e.percent > 0);
  if (relevant.length >= 2) {
    const maxEra = relevant.reduce((a, b) => (a.percent > b.percent ? a : b));
    const second = relevant
      .filter((e) => e.label !== maxEra.label)
      .reduce((a, b) => (a.percent > b.percent ? a : b));
    const ERA_LEAD = 15;
    if (maxEra.percent >= 20 && maxEra.percent > second.percent + ERA_LEAD) {
      if (maxEra.label === "Classic") return ARCHETYPES.archivist;
      if (maxEra.label === "Golden") return ARCHETYPES.newWaver;
      if (maxEra.label === "Modern") return ARCHETYPES.ninetiesKid;
      if (maxEra.label === "Current") return ARCHETYPES.modernist;
    }
  }

  return ARCHETYPES.explorer;
}

const ARCHETYPES = {
  newcomer: {
    label: "The Newcomer",
    description:
      "You're standing at the gates of the canon. The best is still ahead of you.",
  },
  completionist: {
    label: "The Completionist",
    description:
      "Few gaps remain. You've put in the hours most cinephiles only dream about.",
  },
  cinephile: {
    label: "The Cinephile",
    description:
      "The critics are your compass. Auteur cinema runs through your veins — but crowd-pleasers tend to pass you by.",
  },
  populist: {
    label: "The Populist",
    description:
      "You trust the crowd over the critics. The most-loved films are the ones you've seen.",
  },
  ceremonyWatcher: {
    label: "The Ceremony Watcher",
    description:
      "Awards season is appointment viewing. If it didn't win something, chances are it passed you by.",
  },
  anglophone: {
    label: "The Anglophone",
    description:
      "English-language cinema is your home base. World cinema and festival fare are where your blind spots cluster.",
  },
  archivist: {
    label: "The Archivist",
    description:
      "Pre-1960 cinema is your comfort zone. You'd rather revisit Bresson than anything streaming this week.",
  },
  newWaver: {
    label: "The New Waver",
    description:
      "The 60s and 70s are your golden age. Godard, Kubrick, Cassavetes — these directors feel like personal discoveries.",
  },
  ninetiesKid: {
    label: "The Nineties Kid",
    description:
      "The 80s and 90s are your wheelhouse — the era that shaped mainstream taste and produced indie classics side by side.",
  },
  modernist: {
    label: "The Modernist",
    description:
      "Post-2000 is your comfort zone. The further back you go, the wider your blind spots get.",
  },
  explorer: {
    label: "The Explorer",
    description:
      "No single era or category defines your viewing. Your blind spots are scattered — and so is your curiosity.",
  },
} as const;
