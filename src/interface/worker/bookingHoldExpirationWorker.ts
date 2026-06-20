import type { ReleaseExpiredBookingHoldsResultDto } from "@/modules/booking/application/ReleaseExpiredBookingHoldsUseCase";

export type BookingHoldExpirationWorkerLogger = {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
};

export type RunBookingHoldExpirationWorkerInput = {
  intervalMs: number;
  limit: number;
  logger?: BookingHoldExpirationWorkerLogger;
  releaseExpired(input: {
    limit: number;
  }): Promise<ReleaseExpiredBookingHoldsResultDto>;
  signal: AbortSignal;
};

export async function runBookingHoldExpirationWorker(
  input: RunBookingHoldExpirationWorkerInput,
) {
  const logger = input.logger ?? console;

  logger.info("Booking hold expiration worker started.");

  while (!input.signal.aborted) {
    try {
      const result = await input.releaseExpired({
        limit: input.limit,
      });

      if (result.expiredBookingIds.length > 0) {
        logger.info("Expired booking holds released.", {
          bookingIds: result.expiredBookingIds,
        });
      }
    } catch (error) {
      logger.error("Booking hold expiration iteration failed.", error);
    }

    await delay(input.intervalMs, input.signal);
  }

  logger.info("Booking hold expiration worker stopped.");
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
