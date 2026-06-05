import { applicationError } from "@/shared/application/ApplicationError";

import type {
  FailMediaProcessingJobCommand,
  FailMediaProcessingJobResultDto,
} from "./AdminMediaDtos";
import { mediaAssetToAdminDto, mediaJobToAdminDto } from "./MediaLibraryMappers";
import type { MediaClock } from "./ports/MediaClock";
import type { MediaLibraryUnitOfWork } from "./ports/MediaLibraryUnitOfWork";

export class FailMediaProcessingJobUseCase {
  constructor(
    private readonly unitOfWork: MediaLibraryUnitOfWork,
    private readonly clock: MediaClock,
  ) {}

  async execute(
    command: FailMediaProcessingJobCommand,
  ): Promise<FailMediaProcessingJobResultDto> {
    return this.unitOfWork.run(async ({ assets, processingJobs }) => {
      const job = await processingJobs.findById(command.jobId);

      if (!job) {
        throw applicationError(
          "MEDIA_PROCESSING_JOB_NOT_FOUND",
          "Media processing job was not found.",
        );
      }

      const asset = await assets.findById(job.assetId);

      if (!asset) {
        throw applicationError(
          "MEDIA_ASSET_NOT_FOUND",
          "Media asset was not found.",
        );
      }

      const now = this.clock.now();
      const failedJob = job.fail(command.reason, now);
      const failedAsset = asset.markFailed(command.reason, now);

      await assets.save(failedAsset);
      await processingJobs.save(failedJob);

      return {
        asset: mediaAssetToAdminDto(failedAsset),
        job: mediaJobToAdminDto(failedJob),
      };
    });
  }
}
