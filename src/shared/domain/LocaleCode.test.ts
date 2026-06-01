import { describe, expect, it } from "vitest";

import { DomainError } from "./DomainError";
import { LocaleCode } from "./LocaleCode";

describe("LocaleCode", () => {
  it("normalizes supported locales", () => {
    expect(LocaleCode.create(" EN ").value).toBe("en");
    expect(LocaleCode.create("es").value).toBe("es");
    expect(LocaleCode.create("ca").value).toBe("ca");
  });

  it("rejects unsupported locales", () => {
    expect(() => LocaleCode.create("fr")).toThrow(DomainError);
  });

  it("rejects blank locales", () => {
    expect(() => LocaleCode.create(" ")).toThrow(DomainError);
  });
});
