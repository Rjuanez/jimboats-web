import { domainError } from "@/shared/domain/DomainError";

export type HomeGalleryLayout = "BALANCED" | "LANDSCAPE_LED" | "PORTRAIT_LED";
export type HomeGalleryMosaicVariant =
  | "BALANCED_CLASSIC"
  | "BALANCED_RHYTHM"
  | "BALANCED_STACK"
  | "LANDSCAPE_HERO_LEFT"
  | "LANDSCAPE_PANORAMA_TOP"
  | "LANDSCAPE_WIDE_DUO"
  | "PORTRAIT_COLUMNS"
  | "PORTRAIT_EDITORIAL"
  | "PORTRAIT_FEATURE_PAIR";
export type HomeGalleryRotationTrigger = "AUTOMATIC" | "MANUAL";
export type HomeGallerySlotOrientation = "LANDSCAPE" | "PORTRAIT" | "SQUARE";
export type HomeGallerySlotKey =
  | "feature"
  | "pairTop"
  | "pairBottom"
  | "lowerLeft"
  | "lowerRight";

export const homeGallerySlotCount = 5;
export const homeGallerySlotKeys: readonly HomeGallerySlotKey[] = [
  "feature",
  "pairTop",
  "pairBottom",
  "lowerLeft",
  "lowerRight",
];

export type HomeGalleryCompositionSlotProps = {
  id: string;
  mediaAssetId: string;
  orientation: HomeGallerySlotOrientation;
  position: number;
  slotKey: HomeGallerySlotKey;
};

export type HomeGalleryCompositionProps = {
  createdAt: Date;
  expiresAt: Date;
  id: string;
  layout: HomeGalleryLayout;
  mosaicVariant: HomeGalleryMosaicVariant;
  publishedAt: Date;
  seed: string;
  slots: HomeGalleryCompositionSlotProps[];
  trigger: HomeGalleryRotationTrigger;
};

export type HomeGalleryCompositionSnapshot = {
  createdAt: string;
  expiresAt: string;
  id: string;
  layout: HomeGalleryLayout;
  mosaicVariant: HomeGalleryMosaicVariant;
  publishedAt: string;
  seed: string;
  slots: HomeGalleryCompositionSlotProps[];
  trigger: HomeGalleryRotationTrigger;
};

const supportedLayouts = new Set<HomeGalleryLayout>([
  "BALANCED",
  "LANDSCAPE_LED",
  "PORTRAIT_LED",
]);
const supportedMosaicVariantsByLayout = {
  BALANCED: ["BALANCED_CLASSIC", "BALANCED_RHYTHM", "BALANCED_STACK"],
  LANDSCAPE_LED: [
    "LANDSCAPE_HERO_LEFT",
    "LANDSCAPE_PANORAMA_TOP",
    "LANDSCAPE_WIDE_DUO",
  ],
  PORTRAIT_LED: [
    "PORTRAIT_COLUMNS",
    "PORTRAIT_EDITORIAL",
    "PORTRAIT_FEATURE_PAIR",
  ],
} satisfies Record<HomeGalleryLayout, readonly HomeGalleryMosaicVariant[]>;
const supportedMosaicVariants = new Set<HomeGalleryMosaicVariant>(
  Object.values(supportedMosaicVariantsByLayout).flat(),
);
const supportedMosaicVariantSetsByLayout: Record<
  HomeGalleryLayout,
  ReadonlySet<HomeGalleryMosaicVariant>
> = {
  BALANCED: new Set(supportedMosaicVariantsByLayout.BALANCED),
  LANDSCAPE_LED: new Set(supportedMosaicVariantsByLayout.LANDSCAPE_LED),
  PORTRAIT_LED: new Set(supportedMosaicVariantsByLayout.PORTRAIT_LED),
};
const supportedTriggers = new Set<HomeGalleryRotationTrigger>([
  "AUTOMATIC",
  "MANUAL",
]);
const supportedOrientations = new Set<HomeGallerySlotOrientation>([
  "LANDSCAPE",
  "PORTRAIT",
  "SQUARE",
]);
const supportedSlotKeys = new Set<HomeGallerySlotKey>(homeGallerySlotKeys);

export class HomeGalleryComposition {
  private constructor(private readonly props: HomeGalleryCompositionProps) {}

  static create(input: HomeGalleryCompositionProps) {
    const id = input.id.trim();
    const seed = input.seed.trim();
    const slots = input.slots.map(validateSlot);

    if (!id) {
      throw domainError(
        "HOME_GALLERY_COMPOSITION_ID_MISSING",
        "Home gallery composition id is required.",
      );
    }

    if (!seed) {
      throw domainError(
        "HOME_GALLERY_SEED_MISSING",
        "Home gallery composition seed is required.",
      );
    }

    if (!supportedLayouts.has(input.layout)) {
      throw domainError(
        "HOME_GALLERY_COMPOSITION_INVALID",
        "Home gallery layout is not supported.",
      );
    }

    if (
      !supportedMosaicVariants.has(input.mosaicVariant) ||
      !supportedMosaicVariantSetsByLayout[input.layout].has(input.mosaicVariant)
    ) {
      throw domainError(
        "HOME_GALLERY_COMPOSITION_INVALID",
        "Home gallery mosaic variant is not supported by its layout.",
      );
    }

    if (!supportedTriggers.has(input.trigger)) {
      throw domainError(
        "HOME_GALLERY_COMPOSITION_INVALID",
        "Home gallery trigger is not supported.",
      );
    }

    if (input.expiresAt.getTime() <= input.publishedAt.getTime()) {
      throw domainError(
        "HOME_GALLERY_COMPOSITION_INVALID",
        "Home gallery expiration must be after publication.",
      );
    }

    assertSlots(slots);

    return new HomeGalleryComposition({
      ...input,
      id,
      seed,
      slots,
    });
  }

  get expiresAt() {
    return new Date(this.props.expiresAt);
  }

  get id() {
    return this.props.id;
  }

  isExpiredAt(date: Date) {
    return this.props.expiresAt.getTime() <= date.getTime();
  }

  toSnapshot(): HomeGalleryCompositionSnapshot {
    return {
      createdAt: this.props.createdAt.toISOString(),
      expiresAt: this.props.expiresAt.toISOString(),
      id: this.props.id,
      layout: this.props.layout,
      mosaicVariant: this.props.mosaicVariant,
      publishedAt: this.props.publishedAt.toISOString(),
      seed: this.props.seed,
      slots: this.props.slots.map((slot) => ({ ...slot })),
      trigger: this.props.trigger,
    };
  }
}

function validateSlot(
  slot: HomeGalleryCompositionSlotProps,
): HomeGalleryCompositionSlotProps {
  const id = slot.id.trim();
  const mediaAssetId = slot.mediaAssetId.trim();

  if (
    !id ||
    !mediaAssetId ||
    !Number.isInteger(slot.position) ||
    slot.position < 1 ||
    slot.position > homeGallerySlotCount ||
    !supportedSlotKeys.has(slot.slotKey) ||
    !supportedOrientations.has(slot.orientation)
  ) {
    throw domainError(
      "HOME_GALLERY_SLOT_INVALID",
      "Home gallery slot is invalid.",
    );
  }

  return {
    ...slot,
    id,
    mediaAssetId,
  };
}

function assertSlots(slots: HomeGalleryCompositionSlotProps[]) {
  if (slots.length !== homeGallerySlotCount) {
    throw domainError(
      "HOME_GALLERY_COMPOSITION_SLOTS_INVALID",
      "Home gallery composition requires five slots.",
    );
  }

  const positions = new Set<number>();
  const keys = new Set<HomeGallerySlotKey>();
  const mediaAssetIds = new Set<string>();

  for (const slot of slots) {
    positions.add(slot.position);
    keys.add(slot.slotKey);
    mediaAssetIds.add(slot.mediaAssetId);
  }

  if (
    positions.size !== homeGallerySlotCount ||
    keys.size !== homeGallerySlotCount ||
    mediaAssetIds.size !== homeGallerySlotCount
  ) {
    throw domainError(
      "HOME_GALLERY_COMPOSITION_SLOTS_INVALID",
      "Home gallery composition slots must be unique.",
    );
  }
}
