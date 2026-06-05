import { domainError } from "@/shared/domain/DomainError";

export type MediaProcessingJobStatus =
  | "COMPLETED"
  | "FAILED"
  | "PENDING"
  | "RUNNING";

export type MediaProcessingJobProps = {
  assetId: string;
  attempts: number;
  completedAt: Date | null;
  createdAt: Date;
  id: string;
  lastError: string | null;
  startedAt: Date | null;
  status: MediaProcessingJobStatus;
  updatedAt: Date;
};

export type MediaProcessingJobSnapshot = {
  assetId: string;
  attempts: number;
  completedAt: string | null;
  createdAt: string;
  id: string;
  lastError: string | null;
  startedAt: string | null;
  status: MediaProcessingJobStatus;
  updatedAt: string;
};

export class MediaProcessingJob {
  private constructor(private readonly props: MediaProcessingJobProps) {}

  static create(input: MediaProcessingJobProps) {
    const id = input.id.trim();
    const assetId = input.assetId.trim();

    if (!id) {
      throw domainError(
        "MEDIA_PROCESSING_JOB_ID_MISSING",
        "Media processing job id is required.",
      );
    }

    if (!assetId) {
      throw domainError(
        "MEDIA_PROCESSING_JOB_ASSET_ID_MISSING",
        "Media processing job asset id is required.",
      );
    }

    if (!Number.isInteger(input.attempts) || input.attempts < 0) {
      throw domainError(
        "MEDIA_PROCESSING_JOB_INVALID_TRANSITION",
        "Media processing job attempts are invalid.",
      );
    }

    return new MediaProcessingJob({
      ...input,
      assetId,
      id,
      lastError: input.lastError ? normalizeText(input.lastError) : null,
    });
  }

  static pending(input: Pick<MediaProcessingJobProps, "assetId" | "createdAt" | "id">) {
    return MediaProcessingJob.create({
      ...input,
      attempts: 0,
      completedAt: null,
      lastError: null,
      startedAt: null,
      status: "PENDING",
      updatedAt: input.createdAt,
    });
  }

  get id() {
    return this.props.id;
  }

  get assetId() {
    return this.props.assetId;
  }

  get status() {
    return this.props.status;
  }

  claim(startedAt: Date) {
    this.assertStatus("PENDING");

    return MediaProcessingJob.create({
      ...this.props,
      attempts: this.props.attempts + 1,
      lastError: null,
      startedAt,
      status: "RUNNING",
      updatedAt: startedAt,
    });
  }

  complete(completedAt: Date) {
    this.assertStatus("RUNNING");

    return MediaProcessingJob.create({
      ...this.props,
      completedAt,
      status: "COMPLETED",
      updatedAt: completedAt,
    });
  }

  fail(reason: string, failedAt: Date) {
    if (!["PENDING", "RUNNING"].includes(this.props.status)) {
      throw domainError(
        "MEDIA_PROCESSING_JOB_INVALID_TRANSITION",
        "Only pending or running media processing jobs can fail.",
      );
    }

    return MediaProcessingJob.create({
      ...this.props,
      completedAt: failedAt,
      lastError: normalizeText(reason) || "Media processing failed.",
      status: "FAILED",
      updatedAt: failedAt,
    });
  }

  toSnapshot(): MediaProcessingJobSnapshot {
    return {
      assetId: this.props.assetId,
      attempts: this.props.attempts,
      completedAt: this.props.completedAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
      id: this.props.id,
      lastError: this.props.lastError,
      startedAt: this.props.startedAt?.toISOString() ?? null,
      status: this.props.status,
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  private assertStatus(expectedStatus: MediaProcessingJobStatus) {
    if (this.props.status !== expectedStatus) {
      throw domainError(
        "MEDIA_PROCESSING_JOB_INVALID_TRANSITION",
        `Media processing job must be ${expectedStatus}.`,
      );
    }
  }
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
