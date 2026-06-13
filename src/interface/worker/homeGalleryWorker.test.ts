import { describe, expect, it, vi } from "vitest";

import { runHomeGalleryWorker } from "./homeGalleryWorker";

describe("runHomeGalleryWorker", () => {
  it("rotates once before a requested shutdown", async () => {
    const abortController = new AbortController();
    const logger = {
      error: vi.fn(),
      info: vi.fn(),
    };
    const rotateIfDue = vi.fn(async () => {
      abortController.abort();

      return {
        compositionId: "composition-1",
        expiresAt: "2026-06-13T10:00:00.000Z",
        outcome: "ROTATED" as const,
        publishedAt: "2026-06-13T09:00:00.000Z",
        trigger: "AUTOMATIC" as const,
      };
    });

    await runHomeGalleryWorker({
      intervalMs: 1_000,
      logger,
      rotateIfDue,
      signal: abortController.signal,
    });

    expect(rotateIfDue).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      "Home gallery rotated.",
      expect.objectContaining({
        compositionId: "composition-1",
      }),
    );
  });
});
