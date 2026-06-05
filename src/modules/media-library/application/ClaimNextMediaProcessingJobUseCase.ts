import type { ClaimNextMediaProcessingJobResultDto } from "./AdminMediaDtos";
import { mediaJobToAdminDto } from "./MediaLibraryMappers";
import type { MediaClock } from "./ports/MediaClock";
import type { MediaProcessingJobRepository } from "./ports/MediaProcessingJobRepository";

export class ClaimNextMediaProcessingJobUseCase {
  constructor(
    private readonly jobs: MediaProcessingJobRepository,
    private readonly clock: MediaClock,
  ) {}

  async execute(): Promise<ClaimNextMediaProcessingJobResultDto> {
    const pendingJob = await this.jobs.findNextPending();

    if (!pendingJob) {
      return null;
    }

    const claimedJob = pendingJob.claim(this.clock.now());

    await this.jobs.save(claimedJob);

    return mediaJobToAdminDto(claimedJob);
  }
}
