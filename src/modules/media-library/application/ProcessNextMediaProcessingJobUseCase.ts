import { applicationError } from "@/shared/application/ApplicationError";

import type { ProcessNextMediaProcessingJobResultDto } from "./AdminMediaDtos";
import {
  mediaAssetToAdminDto,
  mediaJobToAdminDto,
} from "./MediaLibraryMappers";
import type { MediaClock } from "./ports/MediaClock";
import type { MediaLibraryUnitOfWork } from "./ports/MediaLibraryUnitOfWork";
import type { MediaVariantGenerator } from "./ports/MediaVariantGenerator";
import type {
  MediaAssetSnapshot,
  MediaAssetVariant,
} from "../domain/MediaAsset";

type ClaimedMediaProcessingJob = {
  asset: MediaAssetSnapshot | null;
  jobId: string;
};

export class ProcessNextMediaProcessingJobUseCase {
  constructor(
    private readonly unitOfWork: MediaLibraryUnitOfWork,
    private readonly variants: MediaVariantGenerator,
    private readonly clock: MediaClock,
  ) {}

  async execute(): Promise<ProcessNextMediaProcessingJobResultDto> {
    const claimedJob = await this.claimNextJob();

    if (!claimedJob) {
      return {
        asset: null,
        job: null,
        outcome: "IDLE",
      };
    }

    if (!claimedJob.asset) {
      return this.failClaimedJob(
        claimedJob.jobId,
        "Media asset was not found.",
      );
    }

    try {
      const variants = await this.variants.generateVariants({
        assetId: claimedJob.asset.id,
        collection: claimedJob.asset.collection,
        original: claimedJob.asset.original,
      });

      return await this.completeClaimedJob(claimedJob.jobId, variants);
    } catch (error) {
      return this.failClaimedJob(claimedJob.jobId, errorToMessage(error));
    }
  }

  private async claimNextJob(): Promise<ClaimedMediaProcessingJob | null> {
    return this.unitOfWork.run(async ({ assets, processingJobs }) => {
      const pendingJob = await processingJobs.findNextPending();

      if (!pendingJob) {
        return null;
      }

      const claimedJob = pendingJob.claim(this.clock.now());
      const asset = await assets.findById(claimedJob.assetId);

      await processingJobs.save(claimedJob);

      return {
        asset: asset?.toSnapshot() ?? null,
        jobId: claimedJob.id,
      };
    });
  }

  private async completeClaimedJob(
    jobId: string,
    variants: MediaAssetVariant[],
  ): Promise<ProcessNextMediaProcessingJobResultDto> {
    return this.unitOfWork.run(async ({ assets, processingJobs }) => {
      const job = await processingJobs.findById(jobId);

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
      const readyAsset = asset.markReady(variants, now);
      const completedJob = job.complete(now);

      await assets.save(readyAsset);
      await processingJobs.save(completedJob);

      return {
        asset: mediaAssetToAdminDto(readyAsset),
        job: mediaJobToAdminDto(completedJob),
        outcome: "COMPLETED",
      };
    });
  }

  private async failClaimedJob(
    jobId: string,
    reason: string,
  ): Promise<ProcessNextMediaProcessingJobResultDto> {
    return this.unitOfWork.run(async ({ assets, processingJobs }) => {
      const job = await processingJobs.findById(jobId);

      if (!job) {
        throw applicationError(
          "MEDIA_PROCESSING_JOB_NOT_FOUND",
          "Media processing job was not found.",
        );
      }

      const now = this.clock.now();
      const failedJob = job.fail(reason, now);
      const asset = await assets.findById(job.assetId);
      const failedAsset = asset?.markFailed(reason, now) ?? null;

      if (failedAsset) {
        await assets.save(failedAsset);
      }

      await processingJobs.save(failedJob);

      return {
        asset: failedAsset ? mediaAssetToAdminDto(failedAsset) : null,
        job: mediaJobToAdminDto(failedJob),
        outcome: "FAILED",
        reason,
      };
    });
  }
}

function errorToMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Media processing failed.";
}
