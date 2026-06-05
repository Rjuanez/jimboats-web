import { randomUUID } from "node:crypto";

import type { MediaIdGenerator } from "@/modules/media-library/application/ports/MediaIdGenerator";

export class CryptoMediaIdGenerator implements MediaIdGenerator {
  newAssetId() {
    return `asset-${randomUUID()}`;
  }

  newProcessingJobId() {
    return `job-${randomUUID()}`;
  }
}
