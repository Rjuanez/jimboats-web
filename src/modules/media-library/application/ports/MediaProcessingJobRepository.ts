import type { MediaProcessingJob } from "../../domain/MediaProcessingJob";

export type MediaProcessingJobRepository = {
  findById(id: string): Promise<MediaProcessingJob | null>;
  findNextPending(): Promise<MediaProcessingJob | null>;
  save(job: MediaProcessingJob): Promise<void>;
};
