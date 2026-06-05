import type { MediaProcessingJobRepository } from "@/modules/media-library/application/ports/MediaProcessingJobRepository";
import type { MediaProcessingJob } from "@/modules/media-library/domain/MediaProcessingJob";

import {
  mediaProcessingJobFromPrismaRecord,
  mediaProcessingJobToPrismaWriteModel,
} from "./PrismaMediaLibraryMappers";
import type {
  PrismaMediaProcessingJobRecord,
  PrismaMediaProcessingJobWriteModel,
} from "./PrismaMediaLibraryMappers";

type MediaProcessingJobFindArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type MediaProcessingJobUpsertArgs = {
  create: PrismaMediaProcessingJobWriteModel["job"] & { id: string };
  update: PrismaMediaProcessingJobWriteModel["job"];
  where: { id: string };
};

type MediaProcessingJobDelegate = {
  findFirst(
    args: MediaProcessingJobFindArgs,
  ): Promise<PrismaMediaProcessingJobRecord | null>;
  findUnique(
    args: MediaProcessingJobFindArgs,
  ): Promise<PrismaMediaProcessingJobRecord | null>;
  upsert(args: MediaProcessingJobUpsertArgs): Promise<unknown>;
};

export type PrismaMediaProcessingJobRepositoryTransaction = {
  mediaProcessingJob: MediaProcessingJobDelegate;
};

export type PrismaMediaProcessingJobRepositoryClient =
  PrismaMediaProcessingJobRepositoryTransaction;

export class PrismaMediaProcessingJobRepository
  implements MediaProcessingJobRepository
{
  constructor(
    private readonly prisma: PrismaMediaProcessingJobRepositoryClient,
  ) {}

  async findById(id: string) {
    const record = await this.prisma.mediaProcessingJob.findUnique({
      where: {
        id,
      },
    });

    return record ? mediaProcessingJobFromPrismaRecord(record) : null;
  }

  async findNextPending() {
    const record = await this.prisma.mediaProcessingJob.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        status: "PENDING",
      },
    });

    return record ? mediaProcessingJobFromPrismaRecord(record) : null;
  }

  async save(job: MediaProcessingJob) {
    const writeModel = mediaProcessingJobToPrismaWriteModel(job);

    await this.prisma.mediaProcessingJob.upsert({
      create: {
        id: writeModel.id,
        ...writeModel.job,
      },
      update: writeModel.job,
      where: {
        id: writeModel.id,
      },
    });
  }
}

export type { PrismaMediaProcessingJobRecord };
