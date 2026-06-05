import { describe, expect, it } from "vitest";

import { MediaAsset } from "@/modules/media-library/domain/MediaAsset";
import { MediaProcessingJob } from "@/modules/media-library/domain/MediaProcessingJob";

import {
  mediaAssetFromPrismaRecord,
  mediaAssetToPrismaWriteModel,
  mediaProcessingJobFromPrismaRecord,
  mediaProcessingJobToPrismaWriteModel,
} from "./PrismaMediaLibraryMappers";
import type {
  PrismaMediaAssetRecord,
  PrismaMediaProcessingJobRecord,
} from "./PrismaMediaLibraryMappers";

describe("Prisma media library mappers", () => {
  it("maps a media asset record into the domain model", () => {
    const asset = mediaAssetFromPrismaRecord(mediaAssetRecord());

    expect(asset.toSnapshot()).toMatchObject({
      altText: {
        en: "Private sunset charter in Barcelona.",
      },
      collection: "EXPERIENCES",
      id: "asset-sunset",
      original: {
        hash: "a1b2c3",
        privatePath: "/var/lib/jimboats/media/originals/experiences/sunset.jpg",
      },
      variants: [
        {
          id: "1024w",
          publicPath: "/media/experiences/sunset-a1b2c3-1024.webp",
        },
      ],
    });
  });

  it("maps a media asset domain model into persistence write data", () => {
    const writeModel = mediaAssetToPrismaWriteModel(createMediaAsset());

    expect(writeModel).toMatchObject({
      altTexts: [
        {
          id: "asset-sunset:alt:en",
          locale: "en",
        },
      ],
      asset: {
        collection: "EXPERIENCES",
        originalContentHash: "a1b2c3",
        status: "READY",
      },
      id: "asset-sunset",
      variants: [
        {
          id: "asset-sunset:variant:1024w",
          variantKey: "1024w",
        },
      ],
    });
  });

  it("maps a media processing job record into the domain model", () => {
    const job = mediaProcessingJobFromPrismaRecord(mediaProcessingJobRecord());

    expect(job.toSnapshot()).toMatchObject({
      assetId: "asset-sunset",
      attempts: 0,
      id: "job-1",
      status: "PENDING",
    });
  });

  it("maps a media processing job domain model into persistence write data", () => {
    const writeModel = mediaProcessingJobToPrismaWriteModel(
      createMediaProcessingJob(),
    );

    expect(writeModel).toMatchObject({
      id: "job-1",
      job: {
        mediaAssetId: "asset-sunset",
        status: "PENDING",
      },
    });
  });
});

export function mediaAssetRecord(
  patch: Partial<PrismaMediaAssetRecord> = {},
): PrismaMediaAssetRecord {
  return {
    altTexts: [
      {
        altText: "Private sunset charter in Barcelona.",
        id: "asset-sunset:alt:en",
        locale: "en",
        mediaAssetId: "asset-sunset",
      },
    ],
    collection: "EXPERIENCES",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    failureReason: null,
    id: "asset-sunset",
    mimeType: "image/jpeg",
    originalContentHash: "a1b2c3",
    originalFilename: "sunset.jpg",
    originalHeight: 1600,
    originalPrivatePath:
      "/var/lib/jimboats/media/originals/experiences/sunset.jpg",
    originalSizeBytes: 1_200_000,
    originalWidth: 2400,
    status: "READY",
    title: "Sunset Experience hero",
    updatedAt: date("2026-06-01T10:05:00.000Z"),
    variants: [
      {
        contentHash: "a1b2c3",
        format: "webp",
        height: 1024,
        id: "asset-sunset:variant:1024w",
        mediaAssetId: "asset-sunset",
        publicPath: "/media/experiences/sunset-a1b2c3-1024.webp",
        sizeBytes: 186_000,
        variantKey: "1024w",
        width: 1024,
      },
    ],
    ...patch,
  };
}

export function mediaProcessingJobRecord(
  patch: Partial<PrismaMediaProcessingJobRecord> = {},
): PrismaMediaProcessingJobRecord {
  return {
    attempts: 0,
    completedAt: null,
    createdAt: date("2026-06-01T10:00:00.000Z"),
    id: "job-1",
    lastError: null,
    mediaAssetId: "asset-sunset",
    startedAt: null,
    status: "PENDING",
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    ...patch,
  };
}

export function createMediaAsset() {
  return MediaAsset.create({
    altText: {
      en: "Private sunset charter in Barcelona.",
    },
    collection: "EXPERIENCES",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    failureReason: null,
    id: "asset-sunset",
    original: {
      dimensions: {
        height: 1600,
        width: 2400,
      },
      fileSizeBytes: 1_200_000,
      filename: "sunset.jpg",
      hash: "a1b2c3",
      mimeType: "image/jpeg",
      privatePath:
        "/var/lib/jimboats/media/originals/experiences/sunset.jpg",
    },
    status: "READY",
    title: "Sunset Experience hero",
    updatedAt: date("2026-06-01T10:05:00.000Z"),
    variants: [
      {
        dimensions: {
          height: 1024,
          width: 1024,
        },
        fileSizeBytes: 186_000,
        format: "webp",
        hash: "a1b2c3",
        id: "1024w",
        publicPath: "/media/experiences/sunset-a1b2c3-1024.webp",
      },
    ],
  });
}

export function createMediaProcessingJob() {
  return MediaProcessingJob.pending({
    assetId: "asset-sunset",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    id: "job-1",
  });
}

function date(value: string) {
  return new Date(value);
}
