import { describe, it, expect } from "vitest";
import { letterboxdSlug, letterboxdFilmUrl } from "../letterboxd";

describe("letterboxdSlug()", () => {
  it("lowercases the title", () => {
    expect(letterboxdSlug("Vertigo")).toBe("vertigo");
  });

  it("replaces spaces with hyphens", () => {
    expect(letterboxdSlug("Bicycle Thieves")).toBe("bicycle-thieves");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(letterboxdSlug("A  B")).toBe("a-b");
  });

  it("removes colons", () => {
    expect(letterboxdSlug("2001: A Space Odyssey")).toBe("2001-a-space-odyssey");
  });

  it("removes apostrophes", () => {
    expect(letterboxdSlug("Schindler's List")).toBe("schindlers-list");
  });

  it("removes other punctuation (commas, periods, exclamation marks)", () => {
    expect(letterboxdSlug("Dr. Strangelove")).toBe("dr-strangelove");
    expect(letterboxdSlug("Se7en!")).toBe("se7en");
  });

  it("keeps numbers", () => {
    expect(letterboxdSlug("2001: A Space Odyssey")).toContain("2001");
  });

  it("trims leading and trailing whitespace", () => {
    expect(letterboxdSlug("  Vertigo  ")).toBe("vertigo");
  });

  it("handles a title that is already slug-like", () => {
    expect(letterboxdSlug("rashomon")).toBe("rashomon");
  });
});

describe("letterboxdFilmUrl()", () => {
  it("returns a correctly formed Letterboxd URL", () => {
    expect(letterboxdFilmUrl("Vertigo")).toBe("https://letterboxd.com/film/vertigo/");
  });

  it("applies slug rules within the URL", () => {
    expect(letterboxdFilmUrl("2001: A Space Odyssey")).toBe(
      "https://letterboxd.com/film/2001-a-space-odyssey/"
    );
  });

  it("URL always ends with a trailing slash", () => {
    expect(letterboxdFilmUrl("Rashomon")).toMatch(/\/$/);
  });
});
