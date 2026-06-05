import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";

import { MediaAsset } from "./MediaAsset";
import type { MediaAssetProps, MediaAssetVariant } from "./MediaAsset";

describe("MediaAsset", () => {
  it("creates a processing media asset with normalized metadata", () => {
    const asset = MediaAsset.processing({
      altText: {
        en: "  Private sunset charter   in Barcelona ",
      },
      collection: "EXPERIENCES",
      createdAt: date("2026-06-01T10:00:00.000Z"),
      id: " asset-sunset ",
      original: original(),
      title: "  Sunset   hero ",
    });

    expect(asset.toSnapshot()).toMatchObject({
      altText: {
        en: "Private sunset charter in Barcelona",
      },
      id: "asset-sunset",
      status: "PROCESSING",
      title: "Sunset hero",
      variants: [],
    });
  });

  it("rejects an empty title", () => {
    expect(() =>
      MediaAsset.processing({
        altText: {},
        collection: "EXPERIENCES",
        createdAt: date("2026-06-01T10:00:00.000Z"),
        id: "asset-sunset",
        original: original(),
        title: " ",
      }),
    ).toThrow(DomainError);
  });

  it("rejects public paths for originals", () => {
    expect(() =>
      MediaAsset.processing({
        altText: {},
        collection: "EXPERIENCES",
        createdAt: date("2026-06-01T10:00:00.000Z"),
        id: "asset-sunset",
        original: original({
          privatePath: "/media/experiences/sunset.jpg",
        }),
        title: "Sunset hero",
      }),
    ).toThrow(DomainError);
  });

  it("does not allow ready assets without variants", () => {
    expect(() =>
      MediaAsset.create({
        ...assetProps(),
        status: "READY",
        variants: [],
      }),
    ).toThrow(DomainError);
  });

  it("marks an asset as ready with validated public variants", () => {
    const asset = MediaAsset.processing({
      altText: {},
      collection: "EXPERIENCES",
      createdAt: date("2026-06-01T10:00:00.000Z"),
      id: "asset-sunset",
      original: original(),
      title: "Sunset hero",
    });

    const readyAsset = asset.markReady(
      [variant()],
      date("2026-06-01T10:10:00.000Z"),
    );

    expect(readyAsset.toSnapshot()).toMatchObject({
      status: "READY",
      updatedAt: "2026-06-01T10:10:00.000Z",
      variants: [
        {
          publicPath: "/media/experiences/sunset-a1b2c3-1024.webp",
        },
      ],
    });
  });

  it("updates metadata and reports missing alt locales", () => {
    const asset = MediaAsset.create(assetProps()).withMetadata(
      {
        altText: {
          ca: "",
          en: "Private sunset charter in Barcelona.",
          es: "Charter privado al atardecer en Barcelona.",
        },
        title: "Updated hero",
      },
      date("2026-06-01T11:00:00.000Z"),
    );

    expect(asset.toSnapshot()).toMatchObject({
      title: "Updated hero",
      updatedAt: "2026-06-01T11:00:00.000Z",
    });
    expect(asset.getMissingAltLocales(["en", "es", "ca"])).toEqual(["ca"]);
  });
});

function assetProps(
  patch: Partial<MediaAssetProps> = {},
): MediaAssetProps {
  return {
    altText: {},
    collection: "EXPERIENCES",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    failureReason: null,
    id: "asset-sunset",
    original: original(),
    status: "PROCESSING",
    title: "Sunset hero",
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    variants: [],
    ...patch,
  };
}

function original(patch: Partial<MediaAssetProps["original"]> = {}) {
  return {
    dimensions: {
      height: 1600,
      width: 2400,
    },
    fileSizeBytes: 1_200_000,
    filename: "sunset.jpg",
    hash: "a1b2c3",
    mimeType: "image/jpeg" as const,
    privatePath: "/var/lib/jimboats/media/originals/experiences/sunset.jpg",
    ...patch,
  };
}

function variant(patch: Partial<MediaAssetVariant> = {}): MediaAssetVariant {
  return {
    dimensions: {
      height: 1024,
      width: 1024,
    },
    fileSizeBytes: 186_000,
    format: "webp",
    hash: "a1b2c3",
    id: "sunset-1024",
    publicPath: "/media/experiences/sunset-a1b2c3-1024.webp",
    ...patch,
  };
}

function date(value: string) {
  return new Date(value);
}
