import type { ReconcileBookingCalendarSyncResultDto } from "@/modules/booking/application/ReconcileBookingCalendarSyncUseCase";

export type BookingCalendarSyncWorkerLogger = {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
};

export type RunBookingCalendarSyncWorkerInput = {
  intervalMs: number;
  limit: number;
  logger?: BookingCalendarSyncWorkerLogger;
  reconcile(input: { limit: number }): Promise<ReconcileBookingCalendarSyncResultDto>;
  signal: AbortSignal;
};

export async function runBookingCalendarSyncWorker(
  input: RunBookingCalendarSyncWorkerInput,
) {
  const logger = input.logger ?? console;

  logger.info("Booking calendar sync worker started.");

  while (!input.signal.aborted) {
    try {
      const result = await input.reconcile({
        limit: input.limit,
      });

      logger.info("Booking calendar sync reconciliation completed.", result);
    } catch (error) {
      logger.error("Booking calendar sync reconciliation failed.", error);
    }

    await delay(input.intervalMs, input.signal);
  }

  logger.info("Booking calendar sync worker stopped.");
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
