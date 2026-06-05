import type { AdminMediaListDto } from "./AdminMediaDtos";
import { mediaAssetToAdminDto } from "./MediaLibraryMappers";
import type { MediaAssetRepository } from "./ports/MediaAssetRepository";

export class ListAdminMediaAssetsUseCase {
  constructor(private readonly assets: MediaAssetRepository) {}

  async execute(): Promise<AdminMediaListDto> {
    const assets = await this.assets.list();

    return {
      assets: assets
        .map((asset) => mediaAssetToAdminDto(asset))
        .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)),
    };
  }
}
