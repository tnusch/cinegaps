import { describe, it, expect, vi, afterEach } from "vitest";
import { getLocaleRegion } from "../regions";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubNavigator(languages: string[], language = languages[0]) {
  vi.stubGlobal("navigator", { languages, language });
}

describe("getLocaleRegion()", () => {
  it("extracts the country code from 'en-US'", () => {
    stubNavigator(["en-US"]);
    expect(getLocaleRegion()).toBe("US");
  });

  it("extracts the country code from 'de-DE'", () => {
    stubNavigator(["de-DE"]);
    expect(getLocaleRegion()).toBe("DE");
  });

  it("extracts the country code from 'fr-FR'", () => {
    stubNavigator(["fr-FR"]);
    expect(getLocaleRegion()).toBe("FR");
  });

  it("returns US when the locale has no region segment ('fr')", () => {
    stubNavigator(["fr"]);
    expect(getLocaleRegion()).toBe("US");
  });

  it("returns US when the region code is not in TMDB_REGIONS", () => {
    stubNavigator(["xx-ZZ"]); // ZZ is not a valid TMDB region
    expect(getLocaleRegion()).toBe("US");
  });

  it("uses the first language in navigator.languages that has a valid region", () => {
    stubNavigator(["fr", "de-DE", "en-US"]); // 'fr' has no region, 'de-DE' has 'DE'
    expect(getLocaleRegion()).toBe("DE");
  });

  it("falls back to US when navigator is unavailable (SSR context)", () => {
    vi.stubGlobal("navigator", undefined);
    expect(getLocaleRegion()).toBe("US");
  });

  it("falls back to US when navigator.languages is empty", () => {
    vi.stubGlobal("navigator", { languages: [], language: "" });
    expect(getLocaleRegion()).toBe("US");
  });
});
