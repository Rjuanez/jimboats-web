import type { MediaAssetRepository } from "./MediaAssetRepository";
import type { MediaProcessingJobRepository } from "./MediaProcessingJobRepository";

export type MediaLibraryRepositories = {
  assets: MediaAssetRepository;
  processingJobs: MediaProcessingJobRepository;
};

export type MediaLibraryUnitOfWork = {
  run<T>(
    operation: (repositories: MediaLibraryRepositories) => Promise<T>,
  ): Promise<T>;
};
