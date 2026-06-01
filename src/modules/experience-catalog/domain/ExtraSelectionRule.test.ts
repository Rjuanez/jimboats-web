import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";

import { ExtraSelectionRule } from "./ExtraSelectionRule";

describe("ExtraSelectionRule", () => {
  it("stores configurable rules per experience", () => {
    const rule = ExtraSelectionRule.create({
      capacityReduction: 1,
      enabled: true,
      extraId: "professional-photographer",
      limitPerBooking: 1,
      noticeMinutes: 48 * 60,
      priceOverride: Money.create({ amountMinor: 16_000, currency: "EUR" }),
    });

    expect(rule.toSnapshot()).toMatchObject({
      capacityReduction: 1,
      enabled: true,
      extraId: "professional-photographer",
      limitPerBooking: 1,
      noticeMinutes: 2_880,
      priceOverride: {
        amountMinor: 16_000,
        currency: "EUR",
      },
    });
  });

  it("validates quantity limits", () => {
    const rule = ExtraSelectionRule.create({
      enabled: true,
      extraId: "premium-champagne",
      limitPerBooking: 4,
      noticeMinutes: 0,
    });

    expect(rule.allowsQuantity(4)).toBe(true);
    expect(rule.allowsQuantity(5)).toBe(false);
  });

  it("rejects negative notice", () => {
    expect(() =>
      ExtraSelectionRule.create({
        enabled: true,
        extraId: "premium-champagne",
        limitPerBooking: 1,
        noticeMinutes: -1,
      }),
    ).toThrow(DomainError);
  });

  it("rejects negative capacity reduction", () => {
    expect(() =>
      ExtraSelectionRule.create({
        capacityReduction: -1,
        enabled: true,
        extraId: "premium-champagne",
        limitPerBooking: 1,
        noticeMinutes: 0,
      }),
    ).toThrow(DomainError);
  });
});
