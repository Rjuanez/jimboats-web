import { describe, expect, it } from "vitest";
import { resolvePreferredMarketingLocale } from "./routes";

describe("marketing language negotiation", () => {
  it.each([
    ["es-ES,es;q=0.9,en;q=0.8", "es"],
    ["en-GB", "en"],
    ["fr-CA,fr;q=0.9,en;q=0.8", "fr"],
    ["de-DE", "de"],
    ["nl-BE", "nl"],
    ["ca-ES,es;q=0.9", "es"],
    ["es;q=0.2,fr;q=0.9", "fr"],
    ["es;q=0,de;q=0.8", "de"],
    ["es;q=invalid,fr;q=2,nl;q=0.5", "nl"],
    ["it,pt;q=0.5", "en"],
    [null, "en"],
  ])("resolves %s to %s without sending users to retired Catalan pages", (header, expected) => {
    expect(resolvePreferredMarketingLocale(header)).toBe(expected);
  });
});
