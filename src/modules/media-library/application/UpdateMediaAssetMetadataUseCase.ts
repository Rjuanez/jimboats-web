import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminMediaAssetDto,
  UpdateMediaAssetMetadataCommand,
} from "./AdminMediaDtos";
import { mediaAssetToAdminDto } from "./MediaLibraryMappers";
import type { MediaAssetRepository } from "./ports/MediaAssetRepository";
import type { MediaClock } from "./ports/MediaClock";

export class UpdateMediaAssetMetadataUseCase {
  constructor(
    private readonly assets: MediaAssetRepository,
    private readonly clock: MediaClock,
  ) {}

  async execute(
    command: UpdateMediaAssetMetadataCommand,
  ): Promise<AdminMediaAssetDto> {
    const asset = await this.assets.findById(command.assetId);

    if (!asset) {
      throw applicationError(
        "MEDIA_ASSET_NOT_FOUND",
        "Media asset was not found.",
      );
    }

    const updatedAsset = asset.withMetadata(
      {
        altText: command.altText,
        collection: command.collection,
        title: command.title,
      },
      this.clock.now(),
    );

    await this.assets.save(updatedAsset);

    return mediaAssetToAdminDto(updatedAsset);
  }
}
