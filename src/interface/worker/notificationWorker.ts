import type { ProcessNextNotificationWorkResultDto } from "@/modules/notifications/application/NotificationDtos";

export type NotificationWorkerLogger = {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
};

export type RunNotificationWorkerInput = {
  logger?: NotificationWorkerLogger;
  pollIntervalMs: number;
  processNextWork(): Promise<ProcessNextNotificationWorkResultDto>;
  signal: AbortSignal;
};

export async function runNotificationWorker(input: RunNotificationWorkerInput) {
  const logger = input.logger ?? console;

  logger.info("Notification worker started.");

  while (!input.signal.aborted) {
    try {
      const result = await input.processNextWork();

      logResult(logger, result);

      if (result.outcome === "IDLE") {
        await delay(input.pollIntervalMs, input.signal);
      }
    } catch (error) {
      logger.error("Notification worker iteration failed.", error);
      await delay(input.pollIntervalMs, input.signal);
    }
  }

  logger.info("Notification worker stopped.");
}

function logResult(
  logger: NotificationWorkerLogger,
  result: ProcessNextNotificationWorkResultDto,
) {
  if (result.outcome === "IDLE") {
    return;
  }

  if (result.outcome === "OUTBOX_PROCESSED") {
    logger.info("Notification outbox event processed.", {
      createdDeliveryIds: result.createdDeliveryIds,
      outboxMessageId: result.outboxMessageId,
    });
    return;
  }

  logger.info("Notification delivery sent.", {
    notificationDeliveryId: result.notificationDeliveryId,
    status: result.status,
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
