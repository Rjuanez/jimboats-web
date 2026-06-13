import { describe, expect, it } from "vitest";

import {
  HomeGalleryComposition,
  type HomeGallerySlotKey,
} from "@/modules/home-gallery/domain/HomeGalleryComposition";

import {
  PrismaHomeGalleryRepository,
  type PrismaHomeGalleryRepositoryClient,
} from "./PrismaHomeGalleryRepository";

describe("PrismaHomeGalleryRepository", () => {
  it("maps the latest persisted composition into the domain", async () => {
    const repository = new PrismaHomeGalleryRepository(
      new FakePrismaHomeGalleryClient() as unknown as PrismaHomeGalleryRepositoryClient,
    );

    const composition = await repository.findLatestPublished();

    const snapshot = composition?.toSnapshot();

    expect(snapshot).toMatchObject({
      id: "composition-1",
      layout: "BALANCED",
      mosaicVariant: "BALANCED_CLASSIC",
    });
    expect(snapshot?.slots[0]).toMatchObject({
      mediaAssetId: "asset-1",
      position: 1,
      slotKey: "feature",
    });
  });

  it("persists a new immutable composition with slots", async () => {
    const client = new FakePrismaHomeGalleryClient();
    const repository = new PrismaHomeGalleryRepository(
      client as unknown as PrismaHomeGalleryRepositoryClient,
    );
    const slotKeys: HomeGallerySlotKey[] = [
      "feature",
      "pairTop",
      "pairBottom",
      "lowerLeft",
      "lowerRight",
    ];

    await repository.save(
      HomeGalleryComposition.create({
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        expiresAt: new Date("2026-06-13T10:00:00.000Z"),
        id: "composition-new",
        layout: "LANDSCAPE_LED",
        mosaicVariant: "LANDSCAPE_HERO_LEFT",
        publishedAt: new Date("2026-06-13T09:00:00.000Z"),
        seed: "seed",
        slots: [1, 2, 3, 4, 5].map((position) => ({
          id: `slot-${position}`,
          mediaAssetId: `asset-${position}`,
          orientation: "LANDSCAPE",
          position,
          slotKey: slotKeys[position - 1] ?? "feature",
        })),
        trigger: "MANUAL",
      }),
    );

    expect(client.createdComposition).toMatchObject({
      id: "composition-new",
      layout: "LANDSCAPE_LED",
      mosaicVariant: "LANDSCAPE_HERO_LEFT",
      slots: {
        create: expect.arrayContaining([
          expect.objectContaining({
            id: "slot-1",
            mediaAssetId: "asset-1",
            position: 1,
          }),
        ]),
      },
      trigger: "MANUAL",
    });
  });

  it("maps ready gallery media candidates with localized alt text", async () => {
    const repository = new PrismaHomeGalleryRepository(
      new FakePrismaHomeGalleryClient() as unknown as PrismaHomeGalleryRepositoryClient,
    );

    const candidates = await repository.listReadyGalleryCandidates();

    expect(candidates[0]).toMatchObject({
      altText: {
        en: "Boat at sunset",
        es: "Barco al atardecer",
      },
      id: "asset-1",
      variants: [
        expect.objectContaining({
          publicPath: "/media/gallery/asset-1-720.webp",
          width: 720,
        }),
      ],
    });
  });
});

class FakePrismaHomeGalleryClient {
  createdComposition: unknown = null;

  readonly homeGalleryComposition = {
    create: async (args: { data: unknown }) => {
      this.createdComposition = args.data;
    },
    findFirst: async () => compositionRecord(),
    findMany: async () => [compositionRecord()],
  };

  readonly mediaAsset = {
    findMany: async () => [mediaAssetRecord()],
  };
}

function compositionRecord() {
  return {
    createdAt: new Date("2026-06-13T09:00:00.000Z"),
    expiresAt: new Date("2026-06-13T10:00:00.000Z"),
    id: "composition-1",
    layout: "BALANCED",
    mosaicVariant: "BALANCED_CLASSIC",
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    seed: "seed",
    slots: [
      {
        compositionId: "composition-1",
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        id: "slot-1",
        mediaAssetId: "asset-1",
        orientation: "LANDSCAPE",
        position: 1,
        slotKey: "feature",
      },
      {
        compositionId: "composition-1",
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        id: "slot-2",
        mediaAssetId: "asset-2",
        orientation: "PORTRAIT",
        position: 2,
        slotKey: "pairTop",
      },
      {
        compositionId: "composition-1",
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        id: "slot-3",
        mediaAssetId: "asset-3",
        orientation: "SQUARE",
        position: 3,
        slotKey: "pairBottom",
      },
      {
        compositionId: "composition-1",
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        id: "slot-4",
        mediaAssetId: "asset-4",
        orientation: "LANDSCAPE",
        position: 4,
        slotKey: "lowerLeft",
      },
      {
        compositionId: "composition-1",
        createdAt: new Date("2026-06-13T09:00:00.000Z"),
        id: "slot-5",
        mediaAssetId: "asset-5",
        orientation: "PORTRAIT",
        position: 5,
        slotKey: "lowerRight",
      },
    ],
    trigger: "AUTOMATIC",
  };
}

function mediaAssetRecord() {
  return {
    altTexts: [
      {
        altText: "Boat at sunset",
        id: "alt-en",
        locale: "en",
        mediaAssetId: "asset-1",
      },
      {
        altText: "Barco al atardecer",
        id: "alt-es",
        locale: "es",
        mediaAssetId: "asset-1",
      },
    ],
    collection: "GALLERY",
    createdAt: new Date("2026-06-13T09:00:00.000Z"),
    failureReason: null,
    id: "asset-1",
    mimeType: "image/jpeg",
    originalContentHash: "hash",
    originalFilename: "asset-1.jpg",
    originalHeight: 900,
    originalPrivatePath:
      "/var/lib/jimboats/media/originals/gallery/asset-1.jpg",
    originalSizeBytes: 240_000,
    originalWidth: 1400,
    status: "READY",
    title: "Gallery asset 1",
    updatedAt: new Date("2026-06-13T09:00:00.000Z"),
    variants: [
      {
        contentHash: "variant-hash",
        format: "webp",
        height: 720,
        id: "variant-1",
        mediaAssetId: "asset-1",
        publicPath: "/media/gallery/asset-1-720.webp",
        sizeBytes: 90_000,
        variantKey: "webp_720",
        width: 720,
      },
    ],
  };
}
