import { getContainer } from "@/container";

import { runBookingCalendarSyncWorker } from "./bookingCalendarSyncWorker";

const defaultIntervalMs = 60 * 60 * 1_000;
const defaultLimit = 100;

const abortController = new AbortController();

process.once("SIGINT", requestShutdown);
process.once("SIGTERM", requestShutdown);

void runBookingCalendarSyncWorker({
  intervalMs: readPositiveIntegerEnv(
    "BOOKING_CALENDAR_SYNC_INTERVAL_MS",
    defaultIntervalMs,
  ),
  limit: readPositiveIntegerEnv("BOOKING_CALENDAR_SYNC_LIMIT", defaultLimit),
  reconcile: (input) =>
    getContainer().bookingCalendarSyncWorker.reconcile(input),
  signal: abortController.signal,
}).catch((error) => {
  console.error("Booking calendar sync worker crashed.", error);
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
