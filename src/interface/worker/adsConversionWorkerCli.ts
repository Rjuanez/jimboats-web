import { setTimeout } from "node:timers/promises";
import { getAdsConversionWorker } from "@/container";

const controller = new AbortController();
process.once("SIGINT", () => controller.abort());
process.once("SIGTERM", () => controller.abort());

async function main() {
  const worker = getAdsConversionWorker();
  if (!worker.enabled) {
    console.info(
      "ChatGPT Ads integration disabled; no conversions will be sent.",
    );
    return;
  }
  console.info("ChatGPT Ads worker started.");
  while (!controller.signal.aborted) {
    try {
      await worker.processNext();
    } catch {
      console.error(
        "Ads conversion iteration failed; pending jobs retain their lease for retry.",
      );
    }
    try {
      await setTimeout(2_000, undefined, { signal: controller.signal });
    } catch {
      if (!controller.signal.aborted)
        throw new Error("Ads worker timer failed.");
    }
  }
}
void main().catch(() => {
  console.error("Ads conversion worker could not start; check configuration.");
  process.exitCode = 1;
});
