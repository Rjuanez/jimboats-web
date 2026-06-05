import { getContainer } from "@/container";

import { runMediaWorker } from "./mediaWorker";

const defaultPollIntervalMs = 2_000;

const abortController = new AbortController();

process.once("SIGINT", requestShutdown);
process.once("SIGTERM", requestShutdown);

void runMediaWorker({
  pollIntervalMs: readPollIntervalMs(),
  processNextJob: () => getContainer().mediaWorker.processNextJob(),
  signal: abortController.signal,
}).catch((error) => {
  console.error("Media worker crashed.", error);
  process.exitCode = 1;
});

function requestShutdown() {
  abortController.abort();
}

function readPollIntervalMs() {
  const rawValue = process.env.MEDIA_WORKER_POLL_INTERVAL_MS;

  if (!rawValue) {
    return defaultPollIntervalMs;
  }

  const value = Number.parseInt(rawValue, 10);

  return Number.isInteger(value) && value > 0 ? value : defaultPollIntervalMs;
}
