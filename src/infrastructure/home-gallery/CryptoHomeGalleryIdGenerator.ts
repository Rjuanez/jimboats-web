import { randomUUID } from "node:crypto";

import type { HomeGalleryIdGenerator } from "@/modules/home-gallery/application/ports/HomeGalleryIdGenerator";

export class CryptoHomeGalleryIdGenerator implements HomeGalleryIdGenerator {
  newHomeGalleryCompositionId() {
    return `home_gallery_${randomUUID()}`;
  }

  newHomeGalleryCompositionSlotId(input: {
    compositionId: string;
    position: number;
  }) {
    return `${input.compositionId}_slot_${input.position}`;
  }
}
