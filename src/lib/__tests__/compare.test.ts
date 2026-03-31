import { describe, it, expect } from "vitest";
import { compare, compareAll, crossListGaps, buildEraStats } from "../compare";
import type { CanonicalList, WatchedFilm } from "../types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeList(
  id: string,
  films: CanonicalList["films"],
  overrides: Partial<CanonicalList> = {}
): CanonicalList {
  return {
    id,
    name: id,
    shortName: id,
    description: "",
    category: "critics",
    films,
    ...overrides,
  };
}

function film(title: string, year: number) {
  return { title, year };
}

function watched(title: string, year: number): WatchedFilm {
  return { title, year };
}

// ── normalizeTitle behaviour (tested through compare) ─────────────────────────

describe("title normalisation via compare()", () => {
  it("matches when watched title has a leading 'The'", () => {
    const list = makeList("l", [film("Matrix", 1999)]);
    const result = compare([watched("The Matrix", 1999)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("matches when canonical title has a leading 'The' and watched does not", () => {
    const list = makeList("l", [film("The Matrix", 1999)]);
    const result = compare([watched("Matrix", 1999)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("matches leading 'A'", () => {
    const list = makeList("l", [film("Clockwork Orange", 1971)]);
    const result = compare([watched("A Clockwork Orange", 1971)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("matches leading 'An'", () => {
    const list = makeList("l", [film("American in Paris", 1951)]);
    const result = compare([watched("An American in Paris", 1951)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("matches despite punctuation differences", () => {
    const list = makeList("l", [film("2001: A Space Odyssey", 1968)]);
    const result = compare([watched("2001 A Space Odyssey", 1968)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("does not match completely different titles", () => {
    const list = makeList("l", [film("Vertigo", 1958)]);
    const result = compare([watched("Psycho", 1960)], list);
    expect(result.seen).toHaveLength(0);
    expect(result.unseen).toHaveLength(1);
  });
});

// ── filmsMatch year tolerance (tested through compare) ────────────────────────

describe("year tolerance via compare()", () => {
  it("matches same year", () => {
    const list = makeList("l", [film("Blade Runner", 1982)]);
    const result = compare([watched("Blade Runner", 1982)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("matches year +1 (wide release vs festival year)", () => {
    const list = makeList("l", [film("Blade Runner", 1982)]);
    const result = compare([watched("Blade Runner", 1983)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("matches year -1", () => {
    const list = makeList("l", [film("Blade Runner", 1982)]);
    const result = compare([watched("Blade Runner", 1981)], list);
    expect(result.seen).toHaveLength(1);
  });

  it("does not match year difference of 2", () => {
    const list = makeList("l", [film("Blade Runner", 1982)]);
    const result = compare([watched("Blade Runner", 1984)], list);
    expect(result.seen).toHaveLength(0);
  });
});

// ── compare() ─────────────────────────────────────────────────────────────────

describe("compare()", () => {
  const films = [film("Vertigo", 1958), film("Rashomon", 1950), film("Bicycle Thieves", 1948)];
  const list = makeList("l", films);

  it("correctly splits seen and unseen", () => {
    const result = compare([watched("Vertigo", 1958)], list);
    expect(result.seen.map((f) => f.title)).toEqual(["Vertigo"]);
    expect(result.unseen.map((f) => f.title)).toContain("Rashomon");
    expect(result.unseen.map((f) => f.title)).toContain("Bicycle Thieves");
  });

  it("calculates coverage percent", () => {
    const result = compare([watched("Vertigo", 1958), watched("Rashomon", 1950)], list);
    expect(result.coveragePercent).toBe(67); // 2/3 rounded
  });

  it("returns 100% when all watched", () => {
    const all = films.map((f) => watched(f.title, f.year));
    const result = compare(all, list);
    expect(result.coveragePercent).toBe(100);
    expect(result.unseen).toHaveLength(0);
  });

  it("returns 0% with empty watched list", () => {
    const result = compare([], list);
    expect(result.coveragePercent).toBe(0);
    expect(result.seen).toHaveLength(0);
    expect(result.unseen).toHaveLength(3);
  });

  it("returns 0% for an empty canonical list", () => {
    const result = compare([watched("Vertigo", 1958)], makeList("empty", []));
    expect(result.coveragePercent).toBe(0);
  });

  it("attaches the list reference to the result", () => {
    const result = compare([], list);
    expect(result.list).toBe(list);
  });
});

// ── compareAll() ──────────────────────────────────────────────────────────────

describe("compareAll()", () => {
  it("returns one result per list", () => {
    const lists = [
      makeList("l1", [film("Vertigo", 1958)]),
      makeList("l2", [film("Rashomon", 1950)]),
    ];
    const results = compareAll([watched("Vertigo", 1958)], lists);
    expect(results).toHaveLength(2);
    expect(results[0].list.id).toBe("l1");
    expect(results[1].list.id).toBe("l2");
  });

  it("returns empty array for empty lists input", () => {
    expect(compareAll([], [])).toEqual([]);
  });
});

// ── crossListGaps() ───────────────────────────────────────────────────────────

describe("crossListGaps()", () => {
  it("counts a film that is unseen across two lists as listCount 2", () => {
    const filmA = film("Vertigo", 1958);
    const results = [
      { list: makeList("l1", [filmA]), seen: [], unseen: [filmA], coveragePercent: 0 },
      { list: makeList("l2", [filmA]), seen: [], unseen: [filmA], coveragePercent: 0 },
    ];
    const gaps = crossListGaps(results);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].listCount).toBe(2);
    expect(gaps[0].film.title).toBe("Vertigo");
  });

  it("collects list names for each gap film", () => {
    const filmA = film("Vertigo", 1958);
    const results = [
      { list: makeList("l1", [filmA], { shortName: "List One" }), seen: [], unseen: [filmA], coveragePercent: 0 },
      { list: makeList("l2", [filmA], { shortName: "List Two" }), seen: [], unseen: [filmA], coveragePercent: 0 },
    ];
    const gaps = crossListGaps(results);
    expect(gaps[0].listNames).toEqual(["List One", "List Two"]);
  });

  it("sorts by listCount descending", () => {
    const filmA = film("Vertigo", 1958);
    const filmB = film("Rashomon", 1950);
    const results = [
      { list: makeList("l1", [filmA, filmB]), seen: [], unseen: [filmA, filmB], coveragePercent: 0 },
      { list: makeList("l2", [filmA]),        seen: [], unseen: [filmA],        coveragePercent: 0 },
    ];
    const gaps = crossListGaps(results);
    expect(gaps[0].film.title).toBe("Vertigo");  // listCount 2 first
    expect(gaps[1].film.title).toBe("Rashomon"); // listCount 1 second
  });

  it("tie-breaks on year descending", () => {
    const filmA = film("Newer Film", 2000);
    const filmB = film("Older Film", 1950);
    const results = [
      { list: makeList("l1", [filmA, filmB]), seen: [], unseen: [filmA, filmB], coveragePercent: 0 },
    ];
    const gaps = crossListGaps(results);
    expect(gaps[0].film.title).toBe("Newer Film");
  });

  it("deduplicates the same film appearing in two lists", () => {
    const filmA = film("Vertigo", 1958);
    const results = [
      { list: makeList("l1", [filmA]), seen: [], unseen: [filmA], coveragePercent: 0 },
      { list: makeList("l2", [filmA]), seen: [], unseen: [filmA], coveragePercent: 0 },
    ];
    expect(crossListGaps(results)).toHaveLength(1);
  });

  it("returns empty array when all films are seen", () => {
    const filmA = film("Vertigo", 1958);
    const results = [
      { list: makeList("l1", [filmA]), seen: [filmA], unseen: [], coveragePercent: 100 },
    ];
    expect(crossListGaps(results)).toHaveLength(0);
  });
});

// ── buildEraStats() ───────────────────────────────────────────────────────────

describe("buildEraStats()", () => {
  it("buckets films into the correct eras", () => {
    const list = makeList("l", [
      film("Classic Film", 1950),   // Classic (≤1959)
      film("Golden Film", 1965),    // Golden (1960–1979)
      film("Modern Film", 1990),    // Modern (1980–1999)
      film("Current Film", 2010),   // Current (≥2000)
    ]);
    const stats = buildEraStats([], [list]);
    expect(stats.find((e) => e.label === "Classic")!.total).toBe(1);
    expect(stats.find((e) => e.label === "Golden")!.total).toBe(1);
    expect(stats.find((e) => e.label === "Modern")!.total).toBe(1);
    expect(stats.find((e) => e.label === "Current")!.total).toBe(1);
  });

  it("counts seen films correctly per era", () => {
    const list = makeList("l", [film("Rashomon", 1950), film("Vertigo", 1958)]);
    const stats = buildEraStats([watched("Rashomon", 1950)], [list]);
    const classic = stats.find((e) => e.label === "Classic")!;
    expect(classic.seen).toBe(1);
    expect(classic.total).toBe(2);
    expect(classic.percent).toBe(50);
  });

  it("returns 0% for eras with no films", () => {
    const list = makeList("l", [film("Rashomon", 1950)]);
    const stats = buildEraStats([], [list]);
    const current = stats.find((e) => e.label === "Current")!;
    expect(current.total).toBe(0);
    expect(current.percent).toBe(0);
  });

  it("deduplicates the same film appearing in multiple lists", () => {
    const filmA = film("Rashomon", 1950);
    const lists = [makeList("l1", [filmA]), makeList("l2", [filmA])];
    const stats = buildEraStats([], lists);
    const classic = stats.find((e) => e.label === "Classic")!;
    expect(classic.total).toBe(1); // not 2
  });
});
