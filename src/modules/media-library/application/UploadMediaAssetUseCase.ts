import { applicationError } from "@/shared/application/ApplicationError";

import type {
  UploadMediaAssetCommand,
  UploadMediaAssetResultDto,
} from "./AdminMediaDtos";
import { mediaAssetToAdminDto, mediaJobToAdminDto } from "./MediaLibraryMappers";
import type { MediaClock } from "./ports/MediaClock";
import type { MediaIdGenerator } from "./ports/MediaIdGenerator";
import type { MediaLibraryUnitOfWork } from "./ports/MediaLibraryUnitOfWork";
import type { MediaStorage } from "./ports/MediaStorage";
import { MediaAsset } from "../domain/MediaAsset";
import { MediaProcessingJob } from "../domain/MediaProcessingJob";

export class UploadMediaAssetUseCase {
  constructor(
    private readonly unitOfWork: MediaLibraryUnitOfWork,
    private readonly storage: MediaStorage,
    private readonly ids: MediaIdGenerator,
    private readonly clock: MediaClock,
  ) {}

  async execute(
    command: UploadMediaAssetCommand,
  ): Promise<UploadMediaAssetResultDto> {
    const assetId = this.ids.newAssetId();
    const jobId = this.ids.newProcessingJobId();
    const storedOriginal = await this.storage.saveOriginal({
      assetId,
      collection: command.collection,
      contents: command.file.contents,
      filename: command.file.filename,
      mimeType: command.file.mimeType,
    });

    return this.unitOfWork.run(async ({ assets, processingJobs }) => {
      const existingAsset = await assets.findById(assetId);

      if (existingAsset) {
        throw applicationError(
          "MEDIA_ASSET_ALREADY_EXISTS",
          "Media asset already exists.",
        );
      }

      const now = this.clock.now();
      const asset = MediaAsset.processing({
        altText: command.altText ?? {},
        collection: command.collection,
        createdAt: now,
        id: assetId,
        original: storedOriginal,
        title: command.title,
      });
      const job = MediaProcessingJob.pending({
        assetId,
        createdAt: now,
        id: jobId,
      });

      await assets.save(asset);
      await processingJobs.save(job);

      return {
        asset: mediaAssetToAdminDto(asset),
        job: mediaJobToAdminDto(job),
      };
    });
  }
}
