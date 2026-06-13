import type { PublishedHomeGalleryDto } from "./HomeGalleryDtos";
import type { HomeGalleryMediaReader } from "./ports/HomeGalleryMediaReader";
import type { HomeGalleryRepository } from "./ports/HomeGalleryRepository";

export class GetPublishedHomeGalleryUseCase {
  constructor(
    private readonly gallery: HomeGalleryRepository,
    private readonly media: HomeGalleryMediaReader,
  ) {}

  async execute(): Promise<PublishedHomeGalleryDto | null> {
    const composition = await this.gallery.findLatestPublished();

    if (!composition) {
      return null;
    }

    const snapshot = composition.toSnapshot();
    const slots = snapshot.slots
      .slice()
      .sort((left, right) => left.position - right.position);
    const assets = await this.media.findReadyGalleryAssetsByIds(
      slots.map((slot) => slot.mediaAssetId),
    );
    const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
    const publishedSlots = slots.map((slot) => {
      const asset = assetsById.get(slot.mediaAssetId);

      if (!asset || asset.variants.length === 0) {
        return null;
      }

      return {
        asset,
        orientation: slot.orientation,
        position: slot.position,
        slotKey: slot.slotKey,
      };
    });

    if (publishedSlots.some((slot) => slot === null)) {
      return null;
    }

    return {
      expiresAt: snapshot.expiresAt,
      id: snapshot.id,
      layout: snapshot.layout,
      mosaicVariant: snapshot.mosaicVariant,
      publishedAt: snapshot.publishedAt,
      slots: publishedSlots.filter((slot) => slot !== null),
    };
  }
}
