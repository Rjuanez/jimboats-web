import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type {
  MediaAssetAltText,
  MediaAssetCollection,
  MediaAssetMimeType,
  MediaAssetOriginal,
  MediaAssetSnapshot,
  MediaAssetVariant,
} from "../domain/MediaAsset";
import type { MediaProcessingJobSnapshot } from "../domain/MediaProcessingJob";

export type AdminMediaAssetVariantDto = MediaAssetVariant & {
  publicUrl: string;
};

export type AdminMediaAssetDto = Omit<MediaAssetSnapshot, "variants"> & {
  missingAltLocales: SupportedLocaleCode[];
  primaryVariant: AdminMediaAssetVariantDto | null;
  variants: AdminMediaAssetVariantDto[];
};

export type AdminMediaListDto = {
  assets: AdminMediaAssetDto[];
};

export type AdminMediaProcessingJobDto = MediaProcessingJobSnapshot;

export type AdminMediaUploadFileCommand = {
  contents: Uint8Array;
  filename: string;
  mimeType: MediaAssetMimeType;
};

export type UploadMediaAssetCommand = {
  altText?: MediaAssetAltText;
  collection: MediaAssetCollection;
  file: AdminMediaUploadFileCommand;
  title: string;
};

export type UploadMediaAssetResultDto = {
  asset: AdminMediaAssetDto;
  job: AdminMediaProcessingJobDto;
};

export type UpdateMediaAssetMetadataCommand = {
  altText?: MediaAssetAltText;
  assetId: string;
  collection?: MediaAssetCollection;
  title?: string;
};

export type RequestMediaReprocessCommand = {
  assetId: string;
};

export type RequestMediaReprocessResultDto = {
  asset: AdminMediaAssetDto;
  job: AdminMediaProcessingJobDto;
};

export type ClaimNextMediaProcessingJobResultDto =
  AdminMediaProcessingJobDto | null;

export type CompleteMediaProcessingJobCommand = {
  jobId: string;
  variants: MediaAssetVariant[];
};

export type CompleteMediaProcessingJobResultDto = {
  asset: AdminMediaAssetDto;
  job: AdminMediaProcessingJobDto;
};

export type FailMediaProcessingJobCommand = {
  jobId: string;
  reason: string;
};

export type FailMediaProcessingJobResultDto = {
  asset: AdminMediaAssetDto;
  job: AdminMediaProcessingJobDto;
};

export type ProcessNextMediaProcessingJobResultDto = {
  asset: AdminMediaAssetDto | null;
  job: AdminMediaProcessingJobDto | null;
  outcome: "COMPLETED" | "FAILED" | "IDLE";
  reason?: string;
};

export type StoredMediaOriginalDto = MediaAssetOriginal;
