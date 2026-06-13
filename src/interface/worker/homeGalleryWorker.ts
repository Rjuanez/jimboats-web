import type { RotateHomeGalleryResultDto } from "@/modules/home-gallery/application/HomeGalleryDtos";

export type HomeGalleryWorkerLogger = {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
};

export type RunHomeGalleryWorkerInput = {
  intervalMs: number;
  logger?: HomeGalleryWorkerLogger;
  rotateIfDue(): Promise<RotateHomeGalleryResultDto>;
  signal: AbortSignal;
};

export async function runHomeGalleryWorker(input: RunHomeGalleryWorkerInput) {
  const logger = input.logger ?? console;

  logger.info("Home gallery worker started.");

  while (!input.signal.aborted) {
    try {
      const result = await input.rotateIfDue();

      logResult(logger, result);
    } catch (error) {
      logger.error("Home gallery worker iteration failed.", error);
    }

    if (!input.signal.aborted) {
      await delay(input.intervalMs, input.signal);
    }
  }

  logger.info("Home gallery worker stopped.");
}

function logResult(
  logger: HomeGalleryWorkerLogger,
  result: RotateHomeGalleryResultDto,
) {
  if (result.outcome === "SKIPPED") {
    return;
  }

  logger.info("Home gallery rotated.", {
    compositionId: result.compositionId,
    expiresAt: result.expiresAt,
    publishedAt: result.publishedAt,
    trigger: result.trigger,
  });
}

function delay(milliseconds: number, signal: AbortSignal) {
  if (signal.aborted) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, milliseconds);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      {
        once: true,
      },
    );
  });
}
