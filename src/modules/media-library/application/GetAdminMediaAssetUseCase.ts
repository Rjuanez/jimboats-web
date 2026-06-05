import { applicationError } from "@/shared/application/ApplicationError";

import type { AdminMediaAssetDto } from "./AdminMediaDtos";
import { mediaAssetToAdminDto } from "./MediaLibraryMappers";
import type { MediaAssetRepository } from "./ports/MediaAssetRepository";

export class GetAdminMediaAssetUseCase {
  constructor(private readonly assets: MediaAssetRepository) {}

  async execute(assetId: string): Promise<AdminMediaAssetDto> {
    const asset = await this.assets.findById(assetId);

    if (!asset) {
      throw applicationError(
        "MEDIA_ASSET_NOT_FOUND",
        "Media asset was not found.",
      );
    }

    return mediaAssetToAdminDto(asset);
  }
}
