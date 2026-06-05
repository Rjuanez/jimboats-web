import type {
  MediaAssetCollection,
  MediaAssetOriginal,
  MediaAssetVariant,
} from "../../domain/MediaAsset";

export type GenerateMediaVariantsInput = {
  assetId: string;
  collection: MediaAssetCollection;
  original: MediaAssetOriginal;
};

export type MediaVariantGenerator = {
  generateVariants(
    input: GenerateMediaVariantsInput,
  ): Promise<MediaAssetVariant[]>;
};
