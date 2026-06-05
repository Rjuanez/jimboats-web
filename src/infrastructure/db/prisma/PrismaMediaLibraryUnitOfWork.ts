import type { MediaLibraryUnitOfWork } from "@/modules/media-library/application/ports/MediaLibraryUnitOfWork";
import type { MediaLibraryRepositories } from "@/modules/media-library/application/ports/MediaLibraryUnitOfWork";

import { PrismaMediaAssetRepository } from "./PrismaMediaAssetRepository";
import type { PrismaMediaAssetRepositoryTransaction } from "./PrismaMediaAssetRepository";
import { PrismaMediaProcessingJobRepository } from "./PrismaMediaProcessingJobRepository";
import type { PrismaMediaProcessingJobRepositoryTransaction } from "./PrismaMediaProcessingJobRepository";

export type PrismaMediaLibraryUnitOfWorkTransaction =
  PrismaMediaAssetRepositoryTransaction &
    PrismaMediaProcessingJobRepositoryTransaction;

export type PrismaMediaLibraryUnitOfWorkClient =
  PrismaMediaLibraryUnitOfWorkTransaction & {
    $transaction<T>(
      operation: (
        transaction: PrismaMediaLibraryUnitOfWorkTransaction,
      ) => Promise<T>,
    ): Promise<T>;
  };

export class PrismaMediaLibraryUnitOfWork implements MediaLibraryUnitOfWork {
  constructor(private readonly prisma: PrismaMediaLibraryUnitOfWorkClient) {}

  async run<T>(
    operation: (repositories: MediaLibraryRepositories) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (transaction) => {
      return operation({
        assets: new PrismaMediaAssetRepository(transaction),
        processingJobs: new PrismaMediaProcessingJobRepository(transaction),
      });
    });
  }
}
