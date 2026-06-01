import { describe, expect, it } from "vitest";

import { DomainError } from "./DomainError";
import { Money } from "./Money";

describe("Money", () => {
  it("stores exact minor units", () => {
    const money = Money.create({ amountMinor: 10_000, currency: "EUR" });

    expect(money.toSnapshot()).toEqual({
      amountMinor: 10_000,
      currency: "EUR",
    });
  });

  it("rejects decimal minor units", () => {
    expect(() => Money.create({ amountMinor: 10.5, currency: "EUR" })).toThrow(
      DomainError,
    );
  });

  it("rejects negative amounts", () => {
    expect(() => Money.create({ amountMinor: -1, currency: "EUR" })).toThrow(
      DomainError,
    );
  });

  it("compares by amount and currency", () => {
    const left = Money.create({ amountMinor: 100, currency: "EUR" });
    const right = Money.create({ amountMinor: 100, currency: "EUR" });

    expect(left.equals(right)).toBe(true);
  });
});
