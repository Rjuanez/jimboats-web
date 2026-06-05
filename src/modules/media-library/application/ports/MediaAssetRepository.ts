import type { MediaAsset } from "../../domain/MediaAsset";

export type MediaAssetRepository = {
  findById(id: string): Promise<MediaAsset | null>;
  list(): Promise<MediaAsset[]>;
  save(asset: MediaAsset): Promise<void>;
};
