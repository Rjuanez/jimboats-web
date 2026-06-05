import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";

import { MediaProcessingJob } from "./MediaProcessingJob";

describe("MediaProcessingJob", () => {
  it("creates a pending job", () => {
    const job = MediaProcessingJob.pending({
      assetId: "asset-sunset",
      createdAt: date("2026-06-01T10:00:00.000Z"),
      id: "job-1",
    });

    expect(job.toSnapshot()).toMatchObject({
      assetId: "asset-sunset",
      attempts: 0,
      id: "job-1",
      status: "PENDING",
    });
  });

  it("claims a pending job", () => {
    const claimedJob = createJob().claim(date("2026-06-01T10:01:00.000Z"));

    expect(claimedJob.toSnapshot()).toMatchObject({
      attempts: 1,
      startedAt: "2026-06-01T10:01:00.000Z",
      status: "RUNNING",
    });
  });

  it("completes a running job", () => {
    const completedJob = createJob()
      .claim(date("2026-06-01T10:01:00.000Z"))
      .complete(date("2026-06-01T10:05:00.000Z"));

    expect(completedJob.toSnapshot()).toMatchObject({
      completedAt: "2026-06-01T10:05:00.000Z",
      status: "COMPLETED",
    });
  });

  it("fails a running job with a normalized reason", () => {
    const failedJob = createJob()
      .claim(date("2026-06-01T10:01:00.000Z"))
      .fail("  sharp   crashed ", date("2026-06-01T10:05:00.000Z"));

    expect(failedJob.toSnapshot()).toMatchObject({
      completedAt: "2026-06-01T10:05:00.000Z",
      lastError: "sharp crashed",
      status: "FAILED",
    });
  });

  it("does not claim a completed job", () => {
    const completedJob = createJob()
      .claim(date("2026-06-01T10:01:00.000Z"))
      .complete(date("2026-06-01T10:05:00.000Z"));

    expect(() =>
      completedJob.claim(date("2026-06-01T10:06:00.000Z")),
    ).toThrow(DomainError);
  });
});

function createJob() {
  return MediaProcessingJob.pending({
    assetId: "asset-sunset",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    id: "job-1",
  });
}

function date(value: string) {
  return new Date(value);
}
