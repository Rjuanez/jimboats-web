import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";

import { Extra } from "./Extra";

describe("Extra", () => {
  it("marks active priced extras as selectable", () => {
    const extra = Extra.create({
      defaultNoticeMinutes: 24 * 60,
      id: "premium-champagne",
      name: "Premium champagne",
      price: Money.create({ amountMinor: 9_000, currency: "EUR" }),
      status: "ACTIVE",
    });

    expect(extra.isSelectable()).toBe(true);
  });

  it("normalizes the optional primary media asset id", () => {
    const extra = Extra.create({
      defaultNoticeMinutes: 0,
      id: " paddle-surf ",
      name: " Paddle surf ",
      price: Money.create({ amountMinor: 4_500, currency: "EUR" }),
      primaryMediaAssetId: " asset-paddle ",
      status: "ACTIVE",
    });

    expect(extra.toSnapshot()).toMatchObject({
      id: "paddle-surf",
      name: "Paddle surf",
      primaryMediaAssetId: "asset-paddle",
    });
  });

  it("does not allow archived extras for new selection", () => {
    const extra = Extra.create({
      defaultNoticeMinutes: 0,
      id: "paddle-surf",
      name: "Paddle surf",
      price: Money.create({ amountMinor: 4_500, currency: "EUR" }),
      status: "ARCHIVED",
    });

    expect(extra.isSelectable()).toBe(false);
    expect(() => extra.assertSelectable()).toThrow(DomainError);
  });

  it("rejects active extras without price", () => {
    expect(() =>
      Extra.create({
        defaultNoticeMinutes: 0,
        id: "flower-setup",
        name: "Flower setup",
        price: Money.create({ amountMinor: 0, currency: "EUR" }),
        status: "ACTIVE",
      }),
    ).toThrow(DomainError);
  });
});
