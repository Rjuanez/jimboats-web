import type {
  MediaAssetCollection,
  MediaAssetMimeType,
  MediaAssetOriginal,
} from "../../domain/MediaAsset";

export type SaveMediaOriginalInput = {
  assetId: string;
  collection: MediaAssetCollection;
  contents: Uint8Array;
  filename: string;
  mimeType: MediaAssetMimeType;
};

export type MediaStorage = {
  saveOriginal(input: SaveMediaOriginalInput): Promise<MediaAssetOriginal>;
};
