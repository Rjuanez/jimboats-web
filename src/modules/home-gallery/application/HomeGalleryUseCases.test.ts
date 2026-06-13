import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { GetPublishedHomeGalleryUseCase } from "./GetPublishedHomeGalleryUseCase";
import type { HomeGalleryMediaAssetDto } from "./HomeGalleryDtos";
import { RotateHomeGalleryUseCase } from "./RotateHomeGalleryUseCase";
import type { HomeGalleryClock } from "./ports/HomeGalleryClock";
import type { HomeGalleryIdGenerator } from "./ports/HomeGalleryIdGenerator";
import type { HomeGalleryMediaReader } from "./ports/HomeGalleryMediaReader";
import type { HomeGalleryRepository } from "./ports/HomeGalleryRepository";
import { HomeGalleryComposition } from "../domain/HomeGalleryComposition";
import type { HomeGallerySlotKey } from "../domain/HomeGalleryComposition";

describe("home gallery use cases", () => {
  it("rotates a due gallery composition", async () => {
    const repository = new FakeHomeGalleryRepository();
    const media = new FakeHomeGalleryMediaReader(candidates());
    const useCase = new RotateHomeGalleryUseCase(
      repository,
      media,
      new FakeHomeGalleryIds(),
      fixedClock("2026-06-13T09:00:00.000Z"),
    );

    const result = await useCase.execute({
      trigger: "AUTOMATIC",
    });

    expect(result).toMatchObject({
      compositionId: "home-gallery-composition-1",
      outcome: "ROTATED",
      trigger: "AUTOMATIC",
    });
    expect(repository.savedComposition?.toSnapshot().slots).toHaveLength(5);
    expect(repository.savedComposition?.toSnapshot()).toMatchObject({
      mosaicVariant: expect.any(String),
      slots: expect.arrayContaining([
        expect.objectContaining({
          position: 1,
        }),
      ]),
    });
  });

  it("skips automatic rotation while the current composition is fresh", async () => {
    const repository = new FakeHomeGalleryRepository(
      composition({
        expiresAt: "2026-06-13T10:00:00.000Z",
        id: "current",
        publishedAt: "2026-06-13T09:00:00.000Z",
      }),
    );
    const useCase = new RotateHomeGalleryUseCase(
      repository,
      new FakeHomeGalleryMediaReader(candidates()),
      new FakeHomeGalleryIds(),
      fixedClock("2026-06-13T09:30:00.000Z"),
    );

    const result = await useCase.execute({
      trigger: "AUTOMATIC",
    });

    expect(result).toMatchObject({
      compositionId: "current",
      outcome: "SKIPPED",
    });
    expect(repository.savedComposition).toBeNull();
  });

  it("forces manual rotation even when the current composition is fresh", async () => {
    const repository = new FakeHomeGalleryRepository(
      composition({
        expiresAt: "2026-06-13T10:00:00.000Z",
        id: "current",
        publishedAt: "2026-06-13T09:00:00.000Z",
      }),
    );
    const useCase = new RotateHomeGalleryUseCase(
      repository,
      new FakeHomeGalleryMediaReader(candidates()),
      new FakeHomeGalleryIds(),
      fixedClock("2026-06-13T09:30:00.000Z"),
    );

    const result = await useCase.execute({
      force: true,
      trigger: "MANUAL",
    });

    expect(result.outcome).toBe("ROTATED");
    expect(repository.savedComposition?.toSnapshot().trigger).toBe("MANUAL");
  });

  it("rejects rotation without enough ready gallery assets", async () => {
    const useCase = new RotateHomeGalleryUseCase(
      new FakeHomeGalleryRepository(),
      new FakeHomeGalleryMediaReader(candidates().slice(0, 4)),
      new FakeHomeGalleryIds(),
      fixedClock("2026-06-13T09:00:00.000Z"),
    );

    await expect(useCase.execute({ trigger: "AUTOMATIC" })).rejects.toThrow(
      ApplicationError,
    );
  });

  it("returns the latest published gallery with ready media assets", async () => {
    const repository = new FakeHomeGalleryRepository(
      composition({
        expiresAt: "2026-06-13T10:00:00.000Z",
        id: "current",
        publishedAt: "2026-06-13T09:00:00.000Z",
      }),
    );
    const useCase = new GetPublishedHomeGalleryUseCase(
      repository,
      new FakeHomeGalleryMediaReader(candidates()),
    );

    const result = await useCase.execute();

    expect(result?.slots.map((slot) => slot.asset.id)).toEqual([
      "asset-1",
      "asset-2",
      "asset-3",
      "asset-4",
      "asset-5",
    ]);
    expect(result?.mosaicVariant).toBe("BALANCED_CLASSIC");
  });
});

class FakeHomeGalleryRepository implements HomeGalleryRepository {
  savedComposition: HomeGalleryComposition | null = null;

  constructor(private readonly current: HomeGalleryComposition | null = null) {}

  async findLatestPublished() {
    return this.savedComposition ?? this.current;
  }

  async listRecentMediaAssetIds() {
    return (
      this.current?.toSnapshot().slots.map((slot) => slot.mediaAssetId) ?? []
    );
  }

  async save(composition: HomeGalleryComposition) {
    this.savedComposition = composition;
  }
}

class FakeHomeGalleryMediaReader implements HomeGalleryMediaReader {
  constructor(private readonly assets: HomeGalleryMediaAssetDto[]) {}

  async findReadyGalleryAssetsByIds(assetIds: string[]) {
    const assetIdsSet = new Set(assetIds);

    return this.assets.filter((asset) => assetIdsSet.has(asset.id));
  }

  async listReadyGalleryCandidates() {
    return this.assets;
  }
}

class FakeHomeGalleryIds implements HomeGalleryIdGenerator {
  newHomeGalleryCompositionId() {
    return "home-gallery-composition-1";
  }

  newHomeGalleryCompositionSlotId(input: {
    compositionId: string;
    position: number;
  }) {
    return `${input.compositionId}-slot-${input.position}`;
  }
}

function fixedClock(isoDate: string): HomeGalleryClock {
  return {
    now: () => new Date(isoDate),
  };
}

function composition(input: {
  expiresAt: string;
  id: string;
  publishedAt: string;
}) {
  const slotKeys: HomeGallerySlotKey[] = [
    "feature",
    "pairTop",
    "pairBottom",
    "lowerLeft",
    "lowerRight",
  ];

  return HomeGalleryComposition.create({
    createdAt: new Date(input.publishedAt),
    expiresAt: new Date(input.expiresAt),
    id: input.id,
    layout: "BALANCED",
    mosaicVariant: "BALANCED_CLASSIC",
    publishedAt: new Date(input.publishedAt),
    seed: "seed",
    slots: [1, 2, 3, 4, 5].map((position) => ({
      id: `${input.id}-slot-${position}`,
      mediaAssetId: `asset-${position}`,
      orientation: position % 2 === 0 ? "PORTRAIT" : "LANDSCAPE",
      position,
      slotKey: slotKeys[position - 1] ?? "feature",
    })),
    trigger: "AUTOMATIC",
  });
}

function candidates(): HomeGalleryMediaAssetDto[] {
  return [1, 2, 3, 4, 5, 6].map((position) => ({
    altText: {
      en: `Gallery asset ${position}`,
    },
    id: `asset-${position}`,
    original: {
      height: position % 2 === 0 ? 1400 : 900,
      width: position % 2 === 0 ? 900 : 1400,
    },
    title: `Gallery asset ${position}`,
    variants: [
      {
        fileSizeBytes: 120_000,
        format: "webp",
        height: 720,
        publicPath: `/media/gallery/asset-${position}-720.webp`,
        width: 720,
      },
    ],
  }));
}
