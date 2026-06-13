import type { HomeGalleryComposition } from "../../domain/HomeGalleryComposition";

export type HomeGalleryRepository = {
  findLatestPublished(): Promise<HomeGalleryComposition | null>;
  listRecentMediaAssetIds(input: { limit: number }): Promise<string[]>;
  save(composition: HomeGalleryComposition): Promise<void>;
};
