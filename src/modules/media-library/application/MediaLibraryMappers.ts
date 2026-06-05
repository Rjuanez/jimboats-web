import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type {
  AdminMediaAssetDto,
  AdminMediaProcessingJobDto,
} from "./AdminMediaDtos";
import type { MediaAsset } from "../domain/MediaAsset";
import type { MediaProcessingJob } from "../domain/MediaProcessingJob";

export const adminMediaLocales: SupportedLocaleCode[] = ["en", "es", "ca"];

export function mediaAssetToAdminDto(
  asset: MediaAsset,
  locales: SupportedLocaleCode[] = adminMediaLocales,
): AdminMediaAssetDto {
  const snapshot = asset.toSnapshot();
  const variants = snapshot.variants.map((variant) => ({
    ...variant,
    publicUrl: variant.publicPath,
  }));

  return {
    ...snapshot,
    missingAltLocales: asset.getMissingAltLocales(locales),
    primaryVariant: variants[0] ?? null,
    variants,
  };
}

export function mediaJobToAdminDto(
  job: MediaProcessingJob,
): AdminMediaProcessingJobDto {
  return job.toSnapshot();
}
