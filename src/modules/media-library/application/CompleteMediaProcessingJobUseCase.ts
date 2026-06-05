import { applicationError } from "@/shared/application/ApplicationError";

import type {
  CompleteMediaProcessingJobCommand,
  CompleteMediaProcessingJobResultDto,
} from "./AdminMediaDtos";
import { mediaAssetToAdminDto, mediaJobToAdminDto } from "./MediaLibraryMappers";
import type { MediaClock } from "./ports/MediaClock";
import type { MediaLibraryUnitOfWork } from "./ports/MediaLibraryUnitOfWork";

export class CompleteMediaProcessingJobUseCase {
  constructor(
    private readonly unitOfWork: MediaLibraryUnitOfWork,
    private readonly clock: MediaClock,
  ) {}

  async execute(
    command: CompleteMediaProcessingJobCommand,
  ): Promise<CompleteMediaProcessingJobResultDto> {
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
      const completedJob = job.complete(now);
      const readyAsset = asset.markReady(command.variants, now);

      await assets.save(readyAsset);
      await processingJobs.save(completedJob);

      return {
        asset: mediaAssetToAdminDto(readyAsset),
        job: mediaJobToAdminDto(completedJob),
      };
    });
  }
}
