import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { ClaimNextMediaProcessingJobUseCase } from "./ClaimNextMediaProcessingJobUseCase";
import { CompleteMediaProcessingJobUseCase } from "./CompleteMediaProcessingJobUseCase";
import { FailMediaProcessingJobUseCase } from "./FailMediaProcessingJobUseCase";
import { GetAdminMediaAssetUseCase } from "./GetAdminMediaAssetUseCase";
import { ListAdminMediaAssetsUseCase } from "./ListAdminMediaAssetsUseCase";
import { ProcessNextMediaProcessingJobUseCase } from "./ProcessNextMediaProcessingJobUseCase";
import { RequestMediaReprocessUseCase } from "./RequestMediaReprocessUseCase";
import { UpdateMediaAssetMetadataUseCase } from "./UpdateMediaAssetMetadataUseCase";
import { UploadMediaAssetUseCase } from "./UploadMediaAssetUseCase";
import type { MediaAssetRepository } from "./ports/MediaAssetRepository";
import type { MediaClock } from "./ports/MediaClock";
import type { MediaIdGenerator } from "./ports/MediaIdGenerator";
import type { MediaLibraryRepositories } from "./ports/MediaLibraryUnitOfWork";
import type { MediaLibraryUnitOfWork } from "./ports/MediaLibraryUnitOfWork";
import type { MediaProcessingJobRepository } from "./ports/MediaProcessingJobRepository";
import type { MediaStorage } from "./ports/MediaStorage";
import type { MediaVariantGenerator } from "./ports/MediaVariantGenerator";
import { MediaAsset } from "../domain/MediaAsset";
import type {
  MediaAssetCollection,
  MediaAssetMimeType,
  MediaAssetOriginal,
  MediaAssetVariant,
} from "../domain/MediaAsset";
import { MediaProcessingJob } from "../domain/MediaProcessingJob";

describe("Media library use cases", () => {
  it("uploads a media asset and enqueues a processing job", async () => {
    const dependencies = createDependencies();

    const result = await new UploadMediaAssetUseCase(
      dependencies.unitOfWork,
      dependencies.storage,
      dependencies.ids,
      dependencies.clock,
    ).execute({
      altText: {
        en: "Private sunset charter in Barcelona.",
      },
      collection: "EXPERIENCES",
      file: uploadFile(),
      title: "Sunset Experience hero",
    });

    expect(result.asset).toMatchObject({
      id: "asset-1",
      missingAltLocales: ["es", "ca"],
      status: "PROCESSING",
      title: "Sunset Experience hero",
    });
    expect(result.job).toMatchObject({
      assetId: "asset-1",
      id: "job-1",
      status: "PENDING",
    });
    await expect(
      dependencies.assets.findById("asset-1"),
    ).resolves.not.toBeNull();
    await expect(dependencies.jobs.findById("job-1")).resolves.not.toBeNull();
  });

  it("lists admin media assets newest first", async () => {
    const dependencies = createDependencies({
      assets: [
        createAsset({
          id: "asset-old",
          updatedAt: date("2026-06-01T10:00:00.000Z"),
        }),
        createAsset({
          id: "asset-new",
          updatedAt: date("2026-06-01T11:00:00.000Z"),
        }),
      ],
    });

    const result = await new ListAdminMediaAssetsUseCase(
      dependencies.assets,
    ).execute();

    expect(result.assets.map((asset) => asset.id)).toEqual([
      "asset-new",
      "asset-old",
    ]);
  });

  it("gets a media asset or fails with an application error", async () => {
    const dependencies = createDependencies();
    const useCase = new GetAdminMediaAssetUseCase(dependencies.assets);

    await expect(useCase.execute("missing")).rejects.toBeInstanceOf(
      ApplicationError,
    );
  });

  it("updates media asset metadata", async () => {
    const dependencies = createDependencies({
      assets: [createAsset()],
      clockDates: ["2026-06-01T12:00:00.000Z"],
    });

    const result = await new UpdateMediaAssetMetadataUseCase(
      dependencies.assets,
      dependencies.clock,
    ).execute({
      altText: {
        ca: "Catamara privat al capvespre a Barcelona.",
        en: "Private sunset charter in Barcelona.",
        es: "Charter privado al atardecer en Barcelona.",
      },
      assetId: "asset-sunset",
      title: "Updated sunset hero",
    });

    expect(result).toMatchObject({
      missingAltLocales: [],
      title: "Updated sunset hero",
      updatedAt: "2026-06-01T12:00:00.000Z",
    });
  });

  it("requests media reprocessing by putting the asset back into processing", async () => {
    const dependencies = createDependencies({
      assets: [createAsset({ status: "READY", variants: [variant()] })],
      clockDates: ["2026-06-01T12:00:00.000Z"],
      jobIds: ["job-reprocess"],
    });

    const result = await new RequestMediaReprocessUseCase(
      dependencies.unitOfWork,
      dependencies.ids,
      dependencies.clock,
    ).execute({
      assetId: "asset-sunset",
    });

    expect(result.asset.status).toBe("PROCESSING");
    expect(result.job).toMatchObject({
      assetId: "asset-sunset",
      id: "job-reprocess",
      status: "PENDING",
    });
  });

  it("claims the next pending processing job", async () => {
    const dependencies = createDependencies({
      jobs: [createJob()],
      clockDates: ["2026-06-01T10:01:00.000Z"],
    });

    const result = await new ClaimNextMediaProcessingJobUseCase(
      dependencies.jobs,
      dependencies.clock,
    ).execute();

    expect(result).toMatchObject({
      attempts: 1,
      id: "job-1",
      startedAt: "2026-06-01T10:01:00.000Z",
      status: "RUNNING",
    });
  });

  it("completes a processing job and marks the asset ready", async () => {
    const dependencies = createDependencies({
      assets: [createAsset()],
      jobs: [createJob().claim(date("2026-06-01T10:01:00.000Z"))],
      clockDates: ["2026-06-01T10:05:00.000Z"],
    });

    const result = await new CompleteMediaProcessingJobUseCase(
      dependencies.unitOfWork,
      dependencies.clock,
    ).execute({
      jobId: "job-1",
      variants: [variant()],
    });

    expect(result.asset).toMatchObject({
      primaryVariant: {
        publicPath: "/media/experiences/sunset-a1b2c3-1024.webp",
      },
      status: "READY",
    });
    expect(result.job.status).toBe("COMPLETED");
  });

  it("fails a processing job and keeps the original metadata", async () => {
    const dependencies = createDependencies({
      assets: [createAsset()],
      jobs: [createJob().claim(date("2026-06-01T10:01:00.000Z"))],
      clockDates: ["2026-06-01T10:05:00.000Z"],
    });

    const result = await new FailMediaProcessingJobUseCase(
      dependencies.unitOfWork,
      dependencies.clock,
    ).execute({
      jobId: "job-1",
      reason: "Variant generation failed.",
    });

    expect(result.asset).toMatchObject({
      failureReason: "Variant generation failed.",
      status: "FAILED",
    });
    expect(result.job).toMatchObject({
      lastError: "Variant generation failed.",
      status: "FAILED",
    });
    expect(result.asset.original.privatePath).toContain("/originals/");
  });

  it("processes the next pending job and marks the asset ready", async () => {
    const dependencies = createDependencies({
      assets: [createAsset()],
      clockDates: ["2026-06-01T10:01:00.000Z", "2026-06-01T10:05:00.000Z"],
      jobs: [createJob()],
    });

    const result = await new ProcessNextMediaProcessingJobUseCase(
      dependencies.unitOfWork,
      new SuccessfulMediaVariantGenerator([variant({ id: "1280w" })]),
      dependencies.clock,
    ).execute();

    expect(result).toMatchObject({
      asset: {
        status: "READY",
      },
      job: {
        attempts: 1,
        status: "COMPLETED",
      },
      outcome: "COMPLETED",
    });
  });

  it("returns idle when there are no pending media jobs", async () => {
    const dependencies = createDependencies();

    const result = await new ProcessNextMediaProcessingJobUseCase(
      dependencies.unitOfWork,
      new SuccessfulMediaVariantGenerator([variant()]),
      dependencies.clock,
    ).execute();

    expect(result).toEqual({
      asset: null,
      job: null,
      outcome: "IDLE",
    });
  });

  it("marks the asset failed when variant generation fails", async () => {
    const dependencies = createDependencies({
      assets: [createAsset()],
      clockDates: ["2026-06-01T10:01:00.000Z", "2026-06-01T10:05:00.000Z"],
      jobs: [createJob()],
    });

    const result = await new ProcessNextMediaProcessingJobUseCase(
      dependencies.unitOfWork,
      new FailingMediaVariantGenerator("Sharp failed."),
      dependencies.clock,
    ).execute();

    expect(result).toMatchObject({
      asset: {
        failureReason: "Sharp failed.",
        status: "FAILED",
      },
      job: {
        lastError: "Sharp failed.",
        status: "FAILED",
      },
      outcome: "FAILED",
      reason: "Sharp failed.",
    });
  });
});

class InMemoryMediaAssetRepository implements MediaAssetRepository {
  private readonly records = new Map<string, MediaAsset>();

  constructor(assets: MediaAsset[]) {
    for (const asset of assets) {
      this.records.set(asset.id, asset);
    }
  }

  async findById(id: string) {
    return this.records.get(id) ?? null;
  }

  async list() {
    return [...this.records.values()];
  }

  async save(asset: MediaAsset) {
    this.records.set(asset.id, asset);
  }
}

class InMemoryMediaProcessingJobRepository implements MediaProcessingJobRepository {
  private readonly records = new Map<string, MediaProcessingJob>();

  constructor(jobs: MediaProcessingJob[]) {
    for (const job of jobs) {
      this.records.set(job.id, job);
    }
  }

  async findById(id: string) {
    return this.records.get(id) ?? null;
  }

  async findNextPending() {
    return (
      [...this.records.values()].find((job) => job.status === "PENDING") ?? null
    );
  }

  async save(job: MediaProcessingJob) {
    this.records.set(job.id, job);
  }
}

class InMemoryMediaLibraryUnitOfWork implements MediaLibraryUnitOfWork {
  constructor(
    private readonly assets: MediaAssetRepository,
    private readonly processingJobs: MediaProcessingJobRepository,
  ) {}

  async run<T>(
    operation: (repositories: MediaLibraryRepositories) => Promise<T>,
  ): Promise<T> {
    return operation({
      assets: this.assets,
      processingJobs: this.processingJobs,
    });
  }
}

class InMemoryMediaStorage implements MediaStorage {
  async saveOriginal(input: {
    assetId: string;
    collection: MediaAssetCollection;
    contents: Uint8Array;
    filename: string;
    mimeType: MediaAssetMimeType;
  }): Promise<MediaAssetOriginal> {
    return {
      dimensions: {
        height: 1600,
        width: 2400,
      },
      fileSizeBytes: input.contents.byteLength,
      filename: input.filename,
      hash: `hash-${input.assetId}`,
      mimeType: input.mimeType,
      privatePath: `/var/lib/jimboats/media/originals/${input.collection.toLowerCase()}/${input.filename}`,
    };
  }
}

class SuccessfulMediaVariantGenerator implements MediaVariantGenerator {
  constructor(private readonly variants: MediaAssetVariant[]) {}

  async generateVariants() {
    return this.variants;
  }
}

class FailingMediaVariantGenerator implements MediaVariantGenerator {
  constructor(private readonly reason: string) {}

  async generateVariants(): Promise<MediaAssetVariant[]> {
    throw new Error(this.reason);
  }
}

class SequenceMediaIdGenerator implements MediaIdGenerator {
  private assetIndex = 0;
  private jobIndex = 0;

  constructor(
    private readonly assetIds: string[],
    private readonly jobIds: string[],
  ) {}

  newAssetId() {
    return this.assetIds[this.assetIndex++] ?? `asset-${this.assetIndex}`;
  }

  newProcessingJobId() {
    return this.jobIds[this.jobIndex++] ?? `job-${this.jobIndex}`;
  }
}

class SequenceMediaClock implements MediaClock {
  private index = 0;

  constructor(private readonly dates: Date[]) {}

  now() {
    return this.dates[this.index++] ?? this.dates[this.dates.length - 1];
  }
}

function createDependencies(
  input: {
    assetIds?: string[];
    assets?: MediaAsset[];
    clockDates?: string[];
    jobIds?: string[];
    jobs?: MediaProcessingJob[];
  } = {},
) {
  const assets = new InMemoryMediaAssetRepository(input.assets ?? []);
  const jobs = new InMemoryMediaProcessingJobRepository(input.jobs ?? []);

  return {
    assets,
    clock: new SequenceMediaClock(
      (input.clockDates ?? ["2026-06-01T10:00:00.000Z"]).map(date),
    ),
    ids: new SequenceMediaIdGenerator(
      input.assetIds ?? ["asset-1"],
      input.jobIds ?? ["job-1"],
    ),
    jobs,
    storage: new InMemoryMediaStorage(),
    unitOfWork: new InMemoryMediaLibraryUnitOfWork(assets, jobs),
  };
}

function createAsset(
  patch: Partial<Parameters<typeof MediaAsset.create>[0]> = {},
) {
  return MediaAsset.create({
    altText: {
      en: "Private sunset charter in Barcelona.",
    },
    collection: "EXPERIENCES",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    failureReason: null,
    id: "asset-sunset",
    original: original(),
    status: "PROCESSING",
    title: "Sunset Experience hero",
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    variants: [],
    ...patch,
  });
}

function createJob() {
  return MediaProcessingJob.pending({
    assetId: "asset-sunset",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    id: "job-1",
  });
}

function uploadFile() {
  return {
    contents: new Uint8Array([1, 2, 3]),
    filename: "sunset.jpg",
    mimeType: "image/jpeg" as const,
  };
}

function original(patch: Partial<MediaAssetOriginal> = {}) {
  return {
    dimensions: {
      height: 1600,
      width: 2400,
    },
    fileSizeBytes: 1_200_000,
    filename: "sunset.jpg",
    hash: "a1b2c3",
    mimeType: "image/jpeg" as const,
    privatePath: "/var/lib/jimboats/media/originals/experiences/sunset.jpg",
    ...patch,
  };
}

function variant(patch: Partial<MediaAssetVariant> = {}): MediaAssetVariant {
  return {
    dimensions: {
      height: 1024,
      width: 1024,
    },
    fileSizeBytes: 186_000,
    format: "webp",
    hash: "a1b2c3",
    id: "sunset-1024",
    publicPath: "/media/experiences/sunset-a1b2c3-1024.webp",
    ...patch,
  };
}

function date(value: string) {
  return new Date(value);
}
