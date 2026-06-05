import { describe, expect, it } from "vitest";

import { PrismaMediaAssetRepository } from "./PrismaMediaAssetRepository";
import type {
  PrismaMediaAltTextRecord,
  PrismaMediaAssetRecord,
  PrismaMediaAssetRepositoryClient,
  PrismaMediaAssetVariantRecord,
} from "./PrismaMediaAssetRepository";
import { PrismaMediaLibraryUnitOfWork } from "./PrismaMediaLibraryUnitOfWork";
import type {
  PrismaMediaLibraryUnitOfWorkClient,
  PrismaMediaLibraryUnitOfWorkTransaction,
} from "./PrismaMediaLibraryUnitOfWork";
import { PrismaMediaProcessingJobRepository } from "./PrismaMediaProcessingJobRepository";
import type {
  PrismaMediaProcessingJobRecord,
  PrismaMediaProcessingJobRepositoryClient,
} from "./PrismaMediaProcessingJobRepository";
import {
  createMediaAsset,
  createMediaProcessingJob,
  mediaAssetRecord,
} from "./PrismaMediaLibraryMappers.test";

describe("Prisma media library repositories", () => {
  it("saves and loads media assets through the Prisma-shaped client", async () => {
    const client = new InMemoryMediaLibraryClient();
    const repository = new PrismaMediaAssetRepository(client);

    await repository.save(createMediaAsset());

    const loaded = await repository.findById("asset-sunset");
    const list = await repository.list();

    expect(loaded?.toSnapshot()).toMatchObject({
      altText: {
        en: "Private sunset charter in Barcelona.",
      },
      id: "asset-sunset",
      status: "READY",
      variants: [
        {
          id: "1024w",
        },
      ],
    });
    expect(list).toHaveLength(1);
  });

  it("saves and claims pending media processing jobs", async () => {
    const client = new InMemoryMediaLibraryClient();
    const repository = new PrismaMediaProcessingJobRepository(client);

    await repository.save(createMediaProcessingJob());

    const pendingJob = await repository.findNextPending();
    const claimedJob = pendingJob?.claim(date("2026-06-01T10:01:00.000Z"));

    expect(pendingJob?.toSnapshot()).toMatchObject({
      id: "job-1",
      status: "PENDING",
    });

    if (!claimedJob) {
      throw new Error("Expected pending job.");
    }

    await repository.save(claimedJob);

    const loaded = await repository.findById("job-1");

    expect(loaded?.toSnapshot()).toMatchObject({
      attempts: 1,
      startedAt: "2026-06-01T10:01:00.000Z",
      status: "RUNNING",
    });
  });

  it("runs media asset and job writes through the UnitOfWork", async () => {
    const client = new InMemoryMediaLibraryClient();
    const unitOfWork = new PrismaMediaLibraryUnitOfWork(client);

    await unitOfWork.run(async ({ assets, processingJobs }) => {
      await assets.save(createMediaAsset());
      await processingJobs.save(createMediaProcessingJob());
    });

    expect(client.transactions).toBe(1);
    await expect(
      new PrismaMediaAssetRepository(client).findById("asset-sunset"),
    ).resolves.not.toBeNull();
    await expect(
      new PrismaMediaProcessingJobRepository(client).findById("job-1"),
    ).resolves.not.toBeNull();
  });
});

class InMemoryMediaLibraryClient
  implements
    PrismaMediaAssetRepositoryClient,
    PrismaMediaProcessingJobRepositoryClient,
    PrismaMediaLibraryUnitOfWorkClient
{
  private readonly assets = new Map<
    string,
    Omit<PrismaMediaAssetRecord, "altTexts" | "variants">
  >();
  private readonly altTexts: PrismaMediaAltTextRecord[] = [];
  private readonly variants: PrismaMediaAssetVariantRecord[] = [];
  private readonly jobs = new Map<string, PrismaMediaProcessingJobRecord>();

  transactions = 0;

  readonly mediaAsset = {
    findMany: async () => {
      return [...this.assets.values()]
        .sort((left, right) => {
          return right.updatedAt.getTime() - left.updatedAt.getTime();
        })
        .map((asset) => this.hydrateAsset(asset.id));
    },
    findUnique: async (
      args: Parameters<
        PrismaMediaAssetRepositoryClient["mediaAsset"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.hydrateAsset(id) : null;
    },
    upsert: async (
      args: Parameters<
        PrismaMediaAssetRepositoryClient["mediaAsset"]["upsert"]
      >[0],
    ) => {
      const current = this.assets.get(args.where.id);
      const next = current
        ? {
            id: args.where.id,
            ...args.update,
          }
        : args.create;

      this.assets.set(args.where.id, next);
    },
  };

  readonly mediaAssetVariant = {
    createMany: async (
      args: Parameters<
        PrismaMediaAssetRepositoryClient["mediaAssetVariant"]["createMany"]
      >[0],
    ) => {
      this.variants.push(...args.data);
    },
    deleteMany: async (
      args: Parameters<
        PrismaMediaAssetRepositoryClient["mediaAssetVariant"]["deleteMany"]
      >[0],
    ) => {
      removeByAssetId(this.variants, args.where.mediaAssetId);
    },
  };

  readonly mediaAltText = {
    createMany: async (
      args: Parameters<
        PrismaMediaAssetRepositoryClient["mediaAltText"]["createMany"]
      >[0],
    ) => {
      this.altTexts.push(...args.data);
    },
    deleteMany: async (
      args: Parameters<
        PrismaMediaAssetRepositoryClient["mediaAltText"]["deleteMany"]
      >[0],
    ) => {
      removeByAssetId(this.altTexts, args.where.mediaAssetId);
    },
  };

  readonly mediaProcessingJob = {
    findFirst: async (
      args: Parameters<
        PrismaMediaProcessingJobRepositoryClient["mediaProcessingJob"]["findFirst"]
      >[0],
    ) => {
      const status = readStringProperty(args.where, "status");

      return (
        [...this.jobs.values()]
          .filter((job) => !status || job.status === status)
          .sort((left, right) => {
            return left.createdAt.getTime() - right.createdAt.getTime();
          })[0] ?? null
      );
    },
    findUnique: async (
      args: Parameters<
        PrismaMediaProcessingJobRepositoryClient["mediaProcessingJob"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.jobs.get(id) ?? null : null;
    },
    upsert: async (
      args: Parameters<
        PrismaMediaProcessingJobRepositoryClient["mediaProcessingJob"]["upsert"]
      >[0],
    ) => {
      const current = this.jobs.get(args.where.id);
      const next = current
        ? {
            id: args.where.id,
            ...args.update,
          }
        : args.create;

      this.jobs.set(args.where.id, next);
    },
  };

  async $transaction<T>(
    operation: (
      transaction: PrismaMediaLibraryUnitOfWorkTransaction,
    ) => Promise<T>,
  ) {
    this.transactions += 1;

    return operation({
      mediaAltText: this.mediaAltText,
      mediaAsset: this.mediaAsset,
      mediaAssetVariant: this.mediaAssetVariant,
      mediaProcessingJob: this.mediaProcessingJob,
    });
  }

  private hydrateAsset(id: string): PrismaMediaAssetRecord {
    const asset = this.assets.get(id) ?? mediaAssetRecord({ id });

    return {
      ...asset,
      altTexts: this.altTexts.filter((altText) => {
        return altText.mediaAssetId === id;
      }),
      variants: this.variants.filter((variant) => {
        return variant.mediaAssetId === id;
      }),
    };
  }
}

function readStringProperty(value: unknown, property: string) {
  if (!isRecord(value)) {
    return null;
  }

  const field = value[property];

  return typeof field === "string" ? field : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function removeByAssetId(records: Array<{ mediaAssetId: string }>, assetId: string) {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index].mediaAssetId === assetId) {
      records.splice(index, 1);
    }
  }
}

function date(value: string) {
  return new Date(value);
}
