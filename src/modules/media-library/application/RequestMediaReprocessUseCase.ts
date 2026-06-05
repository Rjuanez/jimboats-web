import { applicationError } from "@/shared/application/ApplicationError";

import type {
  RequestMediaReprocessCommand,
  RequestMediaReprocessResultDto,
} from "./AdminMediaDtos";
import { mediaAssetToAdminDto, mediaJobToAdminDto } from "./MediaLibraryMappers";
import type { MediaClock } from "./ports/MediaClock";
import type { MediaIdGenerator } from "./ports/MediaIdGenerator";
import type { MediaLibraryUnitOfWork } from "./ports/MediaLibraryUnitOfWork";
import { MediaProcessingJob } from "../domain/MediaProcessingJob";

export class RequestMediaReprocessUseCase {
  constructor(
    private readonly unitOfWork: MediaLibraryUnitOfWork,
    private readonly ids: MediaIdGenerator,
    private readonly clock: MediaClock,
  ) {}

  async execute(
    command: RequestMediaReprocessCommand,
  ): Promise<RequestMediaReprocessResultDto> {
    return this.unitOfWork.run(async ({ assets, processingJobs }) => {
      const asset = await assets.findById(command.assetId);

      if (!asset) {
        throw applicationError(
          "MEDIA_ASSET_NOT_FOUND",
          "Media asset was not found.",
        );
      }

      const now = this.clock.now();
      const processingAsset = asset.markProcessing(now);
      const job = MediaProcessingJob.pending({
        assetId: command.assetId,
        createdAt: now,
        id: this.ids.newProcessingJobId(),
      });

      await assets.save(processingAsset);
      await processingJobs.save(job);

      return {
        asset: mediaAssetToAdminDto(processingAsset),
        job: mediaJobToAdminDto(job),
      };
    });
  }
}
