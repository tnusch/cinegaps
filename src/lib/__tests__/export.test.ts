import { describe, it, expect, vi, afterEach } from "vitest";
import { downloadLetterboxdCsv } from "../export";
import type { Film } from "../types";

// ── DOM stubs ─────────────────────────────────────────────────────────────────
// downloadLetterboxdCsv creates a Blob, an <a> element, and triggers a click.
// We stub the minimum necessary to capture the generated CSV content.

function setupStubs() {
  let capturedCsvContent = "";
  const anchor = { href: "", download: "", click: vi.fn() };

  vi.stubGlobal(
    "Blob",
    class {
      constructor(parts: string[]) {
        capturedCsvContent = parts[0];
      }
    }
  );
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:fake"),
    revokeObjectURL: vi.fn(),
  });
  vi.stubGlobal("document", {
    createElement: vi.fn(() => anchor),
    body: { appendChild: vi.fn(), removeChild: vi.fn() },
  });

  return { getCsv: () => capturedCsvContent, anchor };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("downloadLetterboxdCsv()", () => {
  it("generates a CSV with the correct header", () => {
    const { getCsv } = setupStubs();
    downloadLetterboxdCsv([{ title: "Vertigo", year: 1958 }]);
    expect(getCsv()).toMatch(/^Title,Year\n/);
  });

  it("generates one row per film", () => {
    const { getCsv } = setupStubs();
    const films: Film[] = [
      { title: "Rashomon", year: 1950 },
      { title: "Vertigo", year: 1958 },
    ];
    downloadLetterboxdCsv(films);
    const lines = getCsv().split("\n");
    expect(lines).toHaveLength(3); // header + 2 rows
  });

  it("wraps title in quotes and appends year", () => {
    const { getCsv } = setupStubs();
    downloadLetterboxdCsv([{ title: "Rashomon", year: 1950 }]);
    expect(getCsv()).toContain('"Rashomon",1950');
  });

  it("escapes double-quote characters inside a title", () => {
    const { getCsv } = setupStubs();
    downloadLetterboxdCsv([{ title: 'He Said "Hello"', year: 2000 }]);
    // Inner " must be doubled: "He Said ""Hello"""
    expect(getCsv()).toContain('"He Said ""Hello""",2000');
  });

  it("uses 'cinegaps-watchlist.csv' as the default filename", () => {
    const { anchor } = setupStubs();
    downloadLetterboxdCsv([{ title: "Vertigo", year: 1958 }]);
    expect(anchor.download).toBe("cinegaps-watchlist.csv");
  });

  it("uses a custom filename when provided", () => {
    const { anchor } = setupStubs();
    downloadLetterboxdCsv([{ title: "Vertigo", year: 1958 }], "my-list.csv");
    expect(anchor.download).toBe("my-list.csv");
  });

  it("triggers a click on the anchor element", () => {
    const { anchor } = setupStubs();
    downloadLetterboxdCsv([{ title: "Vertigo", year: 1958 }]);
    expect(anchor.click).toHaveBeenCalledOnce();
  });

  it("revokes the object URL after download", () => {
    setupStubs();
    downloadLetterboxdCsv([{ title: "Vertigo", year: 1958 }]);
    // @ts-expect-error — URL is stubbed
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it("produces an empty CSV (header only) for an empty film list", () => {
    const { getCsv } = setupStubs();
    downloadLetterboxdCsv([]);
    expect(getCsv()).toBe("Title,Year");
  });
});
