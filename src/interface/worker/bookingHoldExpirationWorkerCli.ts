import { getContainer } from "@/container";

import { runBookingHoldExpirationWorker } from "./bookingHoldExpirationWorker";

const defaultIntervalMs = 60 * 1_000;
const defaultLimit = 100;

const abortController = new AbortController();

process.once("SIGINT", requestShutdown);
process.once("SIGTERM", requestShutdown);

void runBookingHoldExpirationWorker({
  intervalMs: readPositiveIntegerEnv(
    "BOOKING_HOLD_EXPIRATION_INTERVAL_MS",
    defaultIntervalMs,
  ),
  limit: readPositiveIntegerEnv("BOOKING_HOLD_EXPIRATION_LIMIT", defaultLimit),
  releaseExpired: (input) =>
    getContainer().bookingHoldExpirationWorker.releaseExpired(input),
  signal: abortController.signal,
}).catch((error) => {
  console.error("Booking hold expiration worker crashed.", error);
  process.exitCode = 1;
});

function requestShutdown() {
  abortController.abort();
}

function readPositiveIntegerEnv(name: string, fallback: number) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}
