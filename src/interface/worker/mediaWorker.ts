import type { ProcessNextMediaProcessingJobResultDto } from "@/modules/media-library/application/AdminMediaDtos";

export type MediaWorkerLogger = {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
};

export type RunMediaWorkerInput = {
  logger?: MediaWorkerLogger;
  pollIntervalMs: number;
  processNextJob(): Promise<ProcessNextMediaProcessingJobResultDto>;
  signal: AbortSignal;
};

export async function runMediaWorker(input: RunMediaWorkerInput) {
  const logger = input.logger ?? console;

  logger.info("Media worker started.");

  while (!input.signal.aborted) {
    try {
      const result = await input.processNextJob();

      logResult(logger, result);

      if (result.outcome === "IDLE") {
        await delay(input.pollIntervalMs, input.signal);
      }
    } catch (error) {
      logger.error("Media worker iteration failed.", error);
      await delay(input.pollIntervalMs, input.signal);
    }
  }

  logger.info("Media worker stopped.");
}

function logResult(
  logger: MediaWorkerLogger,
  result: ProcessNextMediaProcessingJobResultDto,
) {
  if (result.outcome === "IDLE") {
    return;
  }

  if (result.outcome === "FAILED") {
    logger.error("Media job failed.", {
      assetId: result.asset?.id ?? null,
      jobId: result.job?.id ?? null,
      reason: result.reason ?? result.job?.lastError ?? null,
    });
    return;
  }

  logger.info("Media job completed.", {
    assetId: result.asset?.id ?? null,
    jobId: result.job?.id ?? null,
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
