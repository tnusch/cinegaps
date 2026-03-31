import { describe, it, expect } from "vitest";
import { deriveArchetype } from "../archetype";
import type { EraStats, EraLabel } from "../compare";
import type { ComparisonResult } from "../types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeResult(
  id: string,
  category: ComparisonResult["list"]["category"],
  coveragePercent: number
): ComparisonResult {
  return {
    list: { id, name: id, shortName: id, description: "", category, films: [] },
    seen: [],
    unseen: [],
    coveragePercent,
  };
}

function makeEra(label: EraLabel, percent: number, total = 100): EraStats {
  return { label, from: 0, to: 9999, total, seen: Math.round((total * percent) / 100), percent };
}

const noEras: EraStats[] = [
  makeEra("Classic", 0, 0),
  makeEra("Golden", 0, 0),
  makeEra("Modern", 0, 0),
  makeEra("Current", 0, 0),
];

// balanced eras — no dominant era (25% each, no 15-point lead)
const balancedEras: EraStats[] = [
  makeEra("Classic", 25),
  makeEra("Golden", 25),
  makeEra("Modern", 25),
  makeEra("Current", 25),
];

// ── Null / empty ──────────────────────────────────────────────────────────────

describe("deriveArchetype()", () => {
  it("returns null for empty results", () => {
    expect(deriveArchetype([], [])).toBeNull();
  });

  // ── Overall coverage thresholds ─────────────────────────────────────────────

  it("returns Newcomer when overall coverage < 10%", () => {
    const result = deriveArchetype([makeResult("l", "critics", 5)], noEras);
    expect(result?.label).toBe("The Newcomer");
  });

  it("boundary: 9% → Newcomer", () => {
    const result = deriveArchetype([makeResult("l", "critics", 9)], noEras);
    expect(result?.label).toBe("The Newcomer");
  });

  it("boundary: 10% → not Newcomer", () => {
    const result = deriveArchetype([makeResult("l", "critics", 10)], noEras);
    expect(result?.label).not.toBe("The Newcomer");
  });

  it("returns Completionist when overall coverage >= 65%", () => {
    const result = deriveArchetype([makeResult("l", "critics", 65)], noEras);
    expect(result?.label).toBe("The Completionist");
  });

  it("boundary: 64% → not Completionist", () => {
    const result = deriveArchetype([makeResult("l", "critics", 64)], balancedEras);
    expect(result?.label).not.toBe("The Completionist");
  });

  it("boundary: 65% → Completionist", () => {
    const result = deriveArchetype([makeResult("l", "critics", 65)], balancedEras);
    expect(result?.label).toBe("The Completionist");
  });

  // ── Category archetypes ──────────────────────────────────────────────────────

  it("returns Cinephile when critics lead fans and awards by >12 points", () => {
    const results = [
      makeResult("c", "critics", 50),
      makeResult("f", "fans", 35),    // 50 - 35 = 15 > 12 ✓
      makeResult("a", "awards", 35),
    ];
    expect(deriveArchetype(results, balancedEras)?.label).toBe("The Cinephile");
  });

  it("returns Populist when fans lead critics and awards by >12 points", () => {
    const results = [
      makeResult("c", "critics", 35),
      makeResult("f", "fans", 50),
      makeResult("a", "awards", 35),
    ];
    expect(deriveArchetype(results, balancedEras)?.label).toBe("The Populist");
  });

  it("returns Ceremony Watcher when awards lead critics and fans by >12 points", () => {
    const results = [
      makeResult("c", "critics", 35),
      makeResult("f", "fans", 35),
      makeResult("a", "awards", 50),
    ];
    expect(deriveArchetype(results, balancedEras)?.label).toBe("The Ceremony Watcher");
  });

  it("does not return a category archetype when lead is exactly 12 points (not strictly greater)", () => {
    const results = [
      makeResult("c", "critics", 47),
      makeResult("f", "fans", 35),    // 47 - 35 = 12, not > 12
      makeResult("a", "awards", 35),
    ];
    // Should not be Cinephile — falls through to era/explorer
    expect(deriveArchetype(results, balancedEras)?.label).not.toBe("The Cinephile");
  });

  it("skips category check when not all 3 categories are present", () => {
    // Only critics and fans — awards missing, so block is skipped entirely
    const results = [
      makeResult("c", "critics", 50),
      makeResult("f", "fans", 30),
    ];
    expect(deriveArchetype(results, balancedEras)?.label).not.toBe("The Cinephile");
  });

  // ── Anglophone ───────────────────────────────────────────────────────────────

  it("returns Anglophone when imdb >> international average by >20 points", () => {
    const results = [
      makeResult("imdb-top250", "fans", 50),           // imdb >= 15 ✓
      makeResult("sight-and-sound-2022", "critics", 25), // intl_avg = 25; 50 > 25+20=45 ✓
    ];
    expect(deriveArchetype(results, balancedEras)?.label).toBe("The Anglophone");
  });

  it("does not return Anglophone when imdb < 15%", () => {
    const results = [
      makeResult("imdb-top250", "fans", 14),
      makeResult("sight-and-sound-2022", "critics", 5),
    ];
    expect(deriveArchetype(results, balancedEras)?.label).not.toBe("The Anglophone");
  });

  it("does not return Anglophone when imdb is not present", () => {
    const results = [
      makeResult("sight-and-sound-2022", "critics", 50),
      makeResult("some-other", "fans", 10),
    ];
    expect(deriveArchetype(results, balancedEras)?.label).not.toBe("The Anglophone");
  });

  // ── Era archetypes ────────────────────────────────────────────────────────────

  it("returns Archivist when Classic era dominates by >15 points and >= 20%", () => {
    const eras = [
      makeEra("Classic", 50),   // 50 - 30 = 20 > 15 ✓, >= 20 ✓
      makeEra("Golden", 30),
      makeEra("Modern", 0, 0),
      makeEra("Current", 0, 0),
    ];
    const results = [makeResult("l", "critics", 30)];
    expect(deriveArchetype(results, eras)?.label).toBe("The Archivist");
  });

  it("returns New Waver when Golden era dominates", () => {
    const eras = [
      makeEra("Classic", 25),
      makeEra("Golden", 50),
      makeEra("Modern", 0, 0),
      makeEra("Current", 0, 0),
    ];
    const results = [makeResult("l", "critics", 30)];
    expect(deriveArchetype(results, eras)?.label).toBe("The New Waver");
  });

  it("returns Nineties Kid when Modern era dominates", () => {
    const eras = [
      makeEra("Classic", 25),
      makeEra("Modern", 50),
      makeEra("Golden", 0, 0),
      makeEra("Current", 0, 0),
    ];
    const results = [makeResult("l", "critics", 30)];
    expect(deriveArchetype(results, eras)?.label).toBe("The Nineties Kid");
  });

  it("returns Modernist when Current era dominates", () => {
    const eras = [
      makeEra("Classic", 25),
      makeEra("Current", 50),
      makeEra("Golden", 0, 0),
      makeEra("Modern", 0, 0),
    ];
    const results = [makeResult("l", "critics", 30)];
    expect(deriveArchetype(results, eras)?.label).toBe("The Modernist");
  });

  it("does not return era archetype when dominant era is < 20%", () => {
    const eras = [
      makeEra("Classic", 19),   // < 20 — fails threshold
      makeEra("Golden", 1),
      makeEra("Modern", 0, 0),
      makeEra("Current", 0, 0),
    ];
    const results = [makeResult("l", "critics", 15)];
    expect(deriveArchetype(results, eras)?.label).not.toBe("The Archivist");
  });

  it("does not return era archetype when lead is exactly 15 points (not strictly greater)", () => {
    const eras = [
      makeEra("Classic", 45),   // 45 - 30 = 15, not > 15
      makeEra("Golden", 30),
      makeEra("Modern", 0, 0),
      makeEra("Current", 0, 0),
    ];
    const results = [makeResult("l", "critics", 30)];
    expect(deriveArchetype(results, eras)?.label).not.toBe("The Archivist");
  });

  it("skips era check when fewer than 2 eras have coverage", () => {
    const eras = [
      makeEra("Classic", 50),   // only one era with percent > 0
      makeEra("Golden", 0, 0),
      makeEra("Modern", 0, 0),
      makeEra("Current", 0, 0),
    ];
    const results = [makeResult("l", "critics", 30)];
    // relevant.length < 2 → falls through to Explorer
    expect(deriveArchetype(results, eras)?.label).toBe("The Explorer");
  });

  // ── Explorer fallback ─────────────────────────────────────────────────────────

  it("returns Explorer when no pattern dominates", () => {
    const results = [
      makeResult("c", "critics", 30),
      makeResult("f", "fans", 28),
      makeResult("a", "awards", 26),
    ];
    expect(deriveArchetype(results, balancedEras)?.label).toBe("The Explorer");
  });
});
