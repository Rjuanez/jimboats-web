import { getContainer } from "@/container";

import { runHomeGalleryWorker } from "./homeGalleryWorker";

const defaultIntervalMs = 5 * 60 * 1_000;

const abortController = new AbortController();

process.once("SIGINT", requestShutdown);
process.once("SIGTERM", requestShutdown);

void runHomeGalleryWorker({
  intervalMs: readPositiveIntegerEnv(
    "HOME_GALLERY_WORKER_INTERVAL_MS",
    defaultIntervalMs,
  ),
  rotateIfDue: () => getContainer().homeGalleryWorker.rotateIfDue(),
  signal: abortController.signal,
}).catch((error) => {
  console.error("Home gallery worker crashed.", error);
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
