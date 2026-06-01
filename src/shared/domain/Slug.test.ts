import { describe, expect, it } from "vitest";

import { DomainError } from "./DomainError";
import { LocaleCode } from "./LocaleCode";
import { Slug } from "./Slug";

describe("Slug", () => {
  it("normalizes text into a route-safe segment", () => {
    const slug = Slug.create(
      " Paseo en barco al atardecer Barcelona ",
      LocaleCode.create("es"),
    );

    expect(slug.value).toBe("paseo-en-barco-al-atardecer-barcelona");
    expect(slug.locale?.value).toBe("es");
  });

  it("transliterates accented characters", () => {
    expect(Slug.create("Sortida privada al capvespre").value).toBe(
      "sortida-privada-al-capvespre",
    );
  });

  it("rejects blank slugs", () => {
    expect(() => Slug.create(" --- ")).toThrow(DomainError);
  });
});
