import { describe, it, expect } from "vitest";
import { parseCsv } from "../parseCsv";

const HEADER = "Date,Name,Year,Letterboxd URI,Rating";

function csv(...rows: string[]) {
  return [HEADER, ...rows].join("\n");
}

describe("parseCsv()", () => {
  // ── Basic parsing ───────────────────────────────────────────────────────────

  it("parses a valid row into a WatchedFilm", () => {
    const result = parseCsv(csv("2024-01-15,Rashomon,1950,https://letterboxd.com/film/rashomon/,4.5"));
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: "Rashomon",
      year: 1950,
      rating: 4.5,
      watchedDate: "2024-01-15",
      letterboxdUri: "https://letterboxd.com/film/rashomon/",
    });
  });

  it("parses multiple rows", () => {
    const result = parseCsv(
      csv(
        "2024-01-01,Vertigo,1958,,4.0",
        "2024-01-02,Rashomon,1950,,5.0"
      )
    );
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Vertigo");
    expect(result[1].title).toBe("Rashomon");
  });

  // ── Line endings ────────────────────────────────────────────────────────────

  it("handles Windows CRLF line endings", () => {
    const input = [HEADER, "2024-01-01,Vertigo,1958,,4.0"].join("\r\n");
    const result = parseCsv(input);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Vertigo");
  });

  // ── Quoted fields ───────────────────────────────────────────────────────────

  it("parses a title with an embedded comma (quoted field)", () => {
    const result = parseCsv(csv('2024-01-01,"The Good, the Bad and the Ugly",1966,,4.0'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("The Good, the Bad and the Ugly");
  });

  it("strips quotes from quoted fields", () => {
    const result = parseCsv(csv('2024-01-01,"Rashomon",1950,,'));
    expect(result[0].title).toBe("Rashomon");
  });

  // ── Invalid / missing fields ─────────────────────────────────────────────────

  it("skips rows with a missing year", () => {
    const result = parseCsv(csv("2024-01-01,Rashomon,,,4.0"));
    expect(result).toHaveLength(0);
  });

  it("skips rows with a non-numeric year", () => {
    const result = parseCsv(csv("2024-01-01,Rashomon,unknown,,4.0"));
    expect(result).toHaveLength(0);
  });

  it("skips rows with a missing title", () => {
    const result = parseCsv(csv("2024-01-01,,1950,,4.0"));
    expect(result).toHaveLength(0);
  });

  it("accepts rows with an invalid rating — rating is undefined", () => {
    const result = parseCsv(csv("2024-01-01,Rashomon,1950,,not-a-number"));
    expect(result).toHaveLength(1);
    expect(result[0].rating).toBeUndefined();
  });

  it("accepts rows with no rating — rating is undefined", () => {
    const result = parseCsv(csv("2024-01-01,Rashomon,1950,,"));
    expect(result).toHaveLength(1);
    expect(result[0].rating).toBeUndefined();
  });

  it("accepts rows with no date — watchedDate is undefined", () => {
    const result = parseCsv(csv(",Rashomon,1950,,4.0"));
    expect(result).toHaveLength(1);
    expect(result[0].watchedDate).toBeUndefined();
  });

  it("silently skips invalid rows and keeps valid ones", () => {
    const result = parseCsv(
      csv(
        "2024-01-01,Rashomon,1950,,4.0",
        "2024-01-02,Bad Row,,,",       // missing year → skipped
        "2024-01-03,Vertigo,1958,,3.5"
      )
    );
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Rashomon");
    expect(result[1].title).toBe("Vertigo");
  });

  // ── Edge cases ──────────────────────────────────────────────────────────────

  it("returns empty array for header-only input", () => {
    expect(parseCsv(HEADER)).toEqual([]);
  });

  it("returns empty array for completely empty string", () => {
    expect(parseCsv("")).toEqual([]);
  });

  it("trims whitespace from header names", () => {
    const spacedHeader = "Date, Name, Year, Letterboxd URI, Rating";
    const input = [spacedHeader, "2024-01-01,Rashomon,1950,,4.0"].join("\n");
    const result = parseCsv(input);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Rashomon");
  });
});
