import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type {
  HomeGalleryLayout,
  HomeGalleryMosaicVariant,
  HomeGalleryRotationTrigger,
  HomeGallerySlotKey,
  HomeGallerySlotOrientation,
} from "../domain/HomeGalleryComposition";

export type HomeGalleryMediaVariantDto = {
  fileSizeBytes: number;
  format: string;
  height: number;
  publicPath: string;
  width: number;
};

export type HomeGalleryMediaAssetDto = {
  altText: Partial<Record<SupportedLocaleCode, string>>;
  id: string;
  original: {
    height: number;
    width: number;
  };
  title: string;
  variants: HomeGalleryMediaVariantDto[];
};

export type PublishedHomeGallerySlotDto = {
  asset: HomeGalleryMediaAssetDto;
  orientation: HomeGallerySlotOrientation;
  position: number;
  slotKey: HomeGallerySlotKey;
};

export type PublishedHomeGalleryDto = {
  expiresAt: string;
  id: string;
  layout: HomeGalleryLayout;
  mosaicVariant: HomeGalleryMosaicVariant;
  publishedAt: string;
  slots: PublishedHomeGallerySlotDto[];
};

export type RotateHomeGalleryResultDto = {
  compositionId: string | null;
  expiresAt: string | null;
  outcome: "ROTATED" | "SKIPPED";
  publishedAt: string | null;
  trigger: HomeGalleryRotationTrigger;
};
