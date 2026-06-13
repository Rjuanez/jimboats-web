import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";

import { HomeGalleryComposition } from "./HomeGalleryComposition";

describe("HomeGalleryComposition", () => {
  it("creates a valid published composition", () => {
    const composition = HomeGalleryComposition.create({
      createdAt: new Date("2026-06-13T09:00:00.000Z"),
      expiresAt: new Date("2026-06-13T10:00:00.000Z"),
      id: "composition-1",
      layout: "BALANCED",
      mosaicVariant: "BALANCED_CLASSIC",
      publishedAt: new Date("2026-06-13T09:00:00.000Z"),
      seed: "automatic:2026-06-13T09:00:00.000Z",
      slots: slots(),
      trigger: "AUTOMATIC",
    });

    expect(composition.toSnapshot()).toMatchObject({
      id: "composition-1",
      layout: "BALANCED",
      mosaicVariant: "BALANCED_CLASSIC",
      slots: expect.arrayContaining([
        expect.objectContaining({ mediaAssetId: "asset-1", position: 1 }),
      ]),
    });
  });

  it("rejects duplicated media assets in one composition", () => {
    expect(() =>
      HomeGalleryComposition.create({
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        expiresAt: new Date("2026-06-13T10:00:00.000Z"),
        id: "composition-1",
        layout: "BALANCED",
        mosaicVariant: "BALANCED_CLASSIC",
        publishedAt: new Date("2026-06-13T09:00:00.000Z"),
        seed: "seed",
        slots: slots().map((slot, index) =>
          index === 4 ? { ...slot, mediaAssetId: "asset-1" } : slot,
        ),
        trigger: "AUTOMATIC",
      }),
    ).toThrow(DomainError);
  });

  it("rejects expiration before publication", () => {
    expect(() =>
      HomeGalleryComposition.create({
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        expiresAt: new Date("2026-06-13T08:59:00.000Z"),
        id: "composition-1",
        layout: "BALANCED",
        mosaicVariant: "BALANCED_CLASSIC",
        publishedAt: new Date("2026-06-13T09:00:00.000Z"),
        seed: "seed",
        slots: slots(),
        trigger: "AUTOMATIC",
      }),
    ).toThrow(DomainError);
  });

  it("rejects a mosaic variant that does not belong to its layout family", () => {
    expect(() =>
      HomeGalleryComposition.create({
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        expiresAt: new Date("2026-06-13T10:00:00.000Z"),
        id: "composition-1",
        layout: "PORTRAIT_LED",
        mosaicVariant: "LANDSCAPE_HERO_LEFT",
        publishedAt: new Date("2026-06-13T09:00:00.000Z"),
        seed: "seed",
        slots: slots(),
        trigger: "AUTOMATIC",
      }),
    ).toThrow(DomainError);
  });
});

function slots() {
  return [
    {
      id: "slot-1",
      mediaAssetId: "asset-1",
      orientation: "LANDSCAPE" as const,
      position: 1,
      slotKey: "feature" as const,
    },
    {
      id: "slot-2",
      mediaAssetId: "asset-2",
      orientation: "PORTRAIT" as const,
      position: 2,
      slotKey: "pairTop" as const,
    },
    {
      id: "slot-3",
      mediaAssetId: "asset-3",
      orientation: "SQUARE" as const,
      position: 3,
      slotKey: "pairBottom" as const,
    },
    {
      id: "slot-4",
      mediaAssetId: "asset-4",
      orientation: "LANDSCAPE" as const,
      position: 4,
      slotKey: "lowerLeft" as const,
    },
    {
      id: "slot-5",
      mediaAssetId: "asset-5",
      orientation: "PORTRAIT" as const,
      position: 5,
      slotKey: "lowerRight" as const,
    },
  ];
}
