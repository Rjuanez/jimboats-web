import { MediaAsset } from "@/modules/media-library/domain/MediaAsset";
import type {
  MediaAssetAltText,
  MediaAssetCollection,
  MediaAssetFormat,
  MediaAssetMimeType,
  MediaAssetStatus,
} from "@/modules/media-library/domain/MediaAsset";
import { MediaProcessingJob } from "@/modules/media-library/domain/MediaProcessingJob";
import type { MediaProcessingJobStatus } from "@/modules/media-library/domain/MediaProcessingJob";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

export type PrismaMediaAssetVariantRecord = {
  contentHash: string;
  format: string;
  height: number;
  id: string;
  mediaAssetId: string;
  publicPath: string;
  sizeBytes: number;
  variantKey: string;
  width: number;
};

export type PrismaMediaAltTextRecord = {
  altText: string;
  id: string;
  locale: string;
  mediaAssetId: string;
};

export type PrismaMediaAssetRecord = {
  altTexts: PrismaMediaAltTextRecord[];
  collection: string;
  createdAt: Date;
  failureReason: string | null;
  id: string;
  mimeType: string;
  originalContentHash: string;
  originalFilename: string;
  originalHeight: number;
  originalPrivatePath: string;
  originalSizeBytes: number;
  originalWidth: number;
  status: string;
  title: string;
  updatedAt: Date;
  variants: PrismaMediaAssetVariantRecord[];
};

export type PrismaMediaProcessingJobRecord = {
  attempts: number;
  completedAt: Date | null;
  createdAt: Date;
  id: string;
  lastError: string | null;
  mediaAssetId: string;
  startedAt: Date | null;
  status: string;
  updatedAt: Date;
};

export type PrismaMediaAssetWriteModel = {
  altTexts: Array<{
    altText: string;
    id: string;
    locale: SupportedLocaleCode;
  }>;
  asset: {
    collection: MediaAssetCollection;
    createdAt: Date;
    failureReason: string | null;
    mimeType: MediaAssetMimeType;
    originalContentHash: string;
    originalFilename: string;
    originalHeight: number;
    originalPrivatePath: string;
    originalSizeBytes: number;
    originalWidth: number;
    status: MediaAssetStatus;
    title: string;
    updatedAt: Date;
  };
  id: string;
  variants: Array<{
    contentHash: string;
    format: MediaAssetFormat;
    height: number;
    id: string;
    publicPath: string;
    sizeBytes: number;
    variantKey: string;
    width: number;
  }>;
};

export type PrismaMediaProcessingJobWriteModel = {
  id: string;
  job: {
    attempts: number;
    completedAt: Date | null;
    createdAt: Date;
    lastError: string | null;
    mediaAssetId: string;
    startedAt: Date | null;
    status: MediaProcessingJobStatus;
    updatedAt: Date;
  };
};

export function mediaAssetFromPrismaRecord(record: PrismaMediaAssetRecord) {
  const altText: MediaAssetAltText = {};

  for (const persistedAltText of record.altTexts) {
    altText[localeFromPrisma(persistedAltText.locale)] =
      persistedAltText.altText;
  }

  return MediaAsset.create({
    altText,
    collection: mediaAssetCollectionFromPrisma(record.collection),
    createdAt: record.createdAt,
    failureReason: record.failureReason,
    id: record.id,
    original: {
      dimensions: {
        height: record.originalHeight,
        width: record.originalWidth,
      },
      fileSizeBytes: record.originalSizeBytes,
      filename: record.originalFilename,
      hash: record.originalContentHash,
      mimeType: mediaAssetMimeTypeFromPrisma(record.mimeType),
      privatePath: record.originalPrivatePath,
    },
    status: mediaAssetStatusFromPrisma(record.status),
    title: record.title,
    updatedAt: record.updatedAt,
    variants: record.variants.map((variant) => ({
      dimensions: {
        height: variant.height,
        width: variant.width,
      },
      fileSizeBytes: variant.sizeBytes,
      format: mediaAssetFormatFromPrisma(variant.format),
      hash: variant.contentHash,
      id: variant.variantKey,
      publicPath: variant.publicPath,
    })),
  });
}

export function mediaAssetToPrismaWriteModel(
  asset: MediaAsset,
): PrismaMediaAssetWriteModel {
  const snapshot = asset.toSnapshot();

  return {
    altTexts: Object.entries(snapshot.altText).map(([locale, altText]) => ({
      altText,
      id: mediaAltTextId(snapshot.id, localeFromPrisma(locale)),
      locale: localeFromPrisma(locale),
    })),
    asset: {
      collection: snapshot.collection,
      createdAt: new Date(snapshot.createdAt),
      failureReason: snapshot.failureReason,
      mimeType: snapshot.original.mimeType,
      originalContentHash: snapshot.original.hash,
      originalFilename: snapshot.original.filename,
      originalHeight: snapshot.original.dimensions.height,
      originalPrivatePath: snapshot.original.privatePath,
      originalSizeBytes: snapshot.original.fileSizeBytes,
      originalWidth: snapshot.original.dimensions.width,
      status: snapshot.status,
      title: snapshot.title,
      updatedAt: new Date(snapshot.updatedAt),
    },
    id: snapshot.id,
    variants: snapshot.variants.map((variant) => ({
      contentHash: variant.hash,
      format: variant.format,
      height: variant.dimensions.height,
      id: mediaAssetVariantId(snapshot.id, variant.id),
      publicPath: variant.publicPath,
      sizeBytes: variant.fileSizeBytes,
      variantKey: variant.id,
      width: variant.dimensions.width,
    })),
  };
}

export function mediaProcessingJobFromPrismaRecord(
  record: PrismaMediaProcessingJobRecord,
) {
  return MediaProcessingJob.create({
    assetId: record.mediaAssetId,
    attempts: record.attempts,
    completedAt: record.completedAt,
    createdAt: record.createdAt,
    id: record.id,
    lastError: record.lastError,
    startedAt: record.startedAt,
    status: mediaProcessingJobStatusFromPrisma(record.status),
    updatedAt: record.updatedAt,
  });
}

export function mediaProcessingJobToPrismaWriteModel(
  job: MediaProcessingJob,
): PrismaMediaProcessingJobWriteModel {
  const snapshot = job.toSnapshot();

  return {
    id: snapshot.id,
    job: {
      attempts: snapshot.attempts,
      completedAt: snapshot.completedAt ? new Date(snapshot.completedAt) : null,
      createdAt: new Date(snapshot.createdAt),
      lastError: snapshot.lastError,
      mediaAssetId: snapshot.assetId,
      startedAt: snapshot.startedAt ? new Date(snapshot.startedAt) : null,
      status: snapshot.status,
      updatedAt: new Date(snapshot.updatedAt),
    },
  };
}

function mediaAssetStatusFromPrisma(value: string): MediaAssetStatus {
  if (value === "FAILED" || value === "PROCESSING" || value === "READY") {
    return value;
  }

  throw new Error("Unsupported persisted media asset status.");
}

function mediaAssetCollectionFromPrisma(value: string): MediaAssetCollection {
  if (
    value === "EXPERIENCES" ||
    value === "EXTRAS" ||
    value === "GALLERY" ||
    value === "PAGES"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted media asset collection.");
}

function mediaAssetMimeTypeFromPrisma(value: string): MediaAssetMimeType {
  if (value === "image/jpeg" || value === "image/png" || value === "image/webp") {
    return value;
  }

  throw new Error("Unsupported persisted media mime type.");
}

function mediaAssetFormatFromPrisma(value: string): MediaAssetFormat {
  if (value === "jpeg" || value === "png" || value === "webp") {
    return value;
  }

  throw new Error("Unsupported persisted media format.");
}

function mediaProcessingJobStatusFromPrisma(
  value: string,
): MediaProcessingJobStatus {
  if (
    value === "COMPLETED" ||
    value === "FAILED" ||
    value === "PENDING" ||
    value === "RUNNING"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted media processing job status.");
}

function localeFromPrisma(value: string): SupportedLocaleCode {
  if (value === "ca" || value === "en" || value === "es") {
    return value;
  }

  throw new Error("Unsupported persisted locale.");
}

function mediaAssetVariantId(assetId: string, variantKey: string) {
  return `${assetId}:variant:${variantKey}`;
}

function mediaAltTextId(assetId: string, locale: SupportedLocaleCode) {
  return `${assetId}:alt:${locale}`;
}
