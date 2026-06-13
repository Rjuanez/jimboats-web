import type { HomeGalleryMediaAssetDto } from "../HomeGalleryDtos";

export type HomeGalleryMediaReader = {
  findReadyGalleryAssetsByIds(
    assetIds: string[],
  ): Promise<HomeGalleryMediaAssetDto[]>;
  listReadyGalleryCandidates(): Promise<HomeGalleryMediaAssetDto[]>;
};
