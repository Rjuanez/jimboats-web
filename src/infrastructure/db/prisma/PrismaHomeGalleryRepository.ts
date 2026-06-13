import type { HomeGalleryMediaAssetDto } from "@/modules/home-gallery/application/HomeGalleryDtos";
import type { HomeGalleryMediaReader } from "@/modules/home-gallery/application/ports/HomeGalleryMediaReader";
import type { HomeGalleryRepository } from "@/modules/home-gallery/application/ports/HomeGalleryRepository";
import { HomeGalleryComposition } from "@/modules/home-gallery/domain/HomeGalleryComposition";
import type {
  HomeGalleryLayout,
  HomeGalleryMosaicVariant,
  HomeGalleryRotationTrigger,
  HomeGallerySlotKey,
  HomeGallerySlotOrientation,
} from "@/modules/home-gallery/domain/HomeGalleryComposition";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type {
  PrismaMediaAltTextRecord,
  PrismaMediaAssetRecord,
  PrismaMediaAssetVariantRecord,
} from "./PrismaMediaLibraryMappers";

type HomeGalleryCompositionFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  take?: number;
};

type HomeGalleryCompositionCreateArgs = {
  data: unknown;
};

type MediaAssetFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type HomeGalleryCompositionDelegate = {
  create(args: HomeGalleryCompositionCreateArgs): Promise<unknown>;
  findFirst(
    args: HomeGalleryCompositionFindArgs,
  ): Promise<PrismaHomeGalleryCompositionRecord | null>;
  findMany(
    args: HomeGalleryCompositionFindArgs,
  ): Promise<PrismaHomeGalleryCompositionRecord[]>;
};

type MediaAssetDelegate = {
  findMany(args: MediaAssetFindArgs): Promise<PrismaMediaAssetRecord[]>;
};

export type PrismaHomeGalleryRepositoryClient = {
  homeGalleryComposition: HomeGalleryCompositionDelegate;
  mediaAsset: MediaAssetDelegate;
};

type PrismaHomeGalleryCompositionSlotRecord = {
  compositionId: string;
  createdAt: Date;
  id: string;
  mediaAssetId: string;
  orientation: string;
  position: number;
  slotKey: string;
};

type PrismaHomeGalleryCompositionRecord = {
  createdAt: Date;
  expiresAt: Date;
  id: string;
  layout: string;
  mosaicVariant: string;
  publishedAt: Date;
  seed: string;
  slots: PrismaHomeGalleryCompositionSlotRecord[];
  trigger: string;
};

const homeGalleryCompositionInclude = {
  slots: {
    orderBy: {
      position: "asc",
    },
  },
};

const homeGalleryMediaAssetInclude = {
  altTexts: {
    orderBy: {
      locale: "asc",
    },
  },
  variants: {
    orderBy: {
      width: "asc",
    },
  },
};

export class PrismaHomeGalleryRepository
  implements HomeGalleryRepository, HomeGalleryMediaReader
{
  constructor(private readonly prisma: PrismaHomeGalleryRepositoryClient) {}

  async findLatestPublished() {
    const record = await this.prisma.homeGalleryComposition.findFirst({
      include: homeGalleryCompositionInclude,
      orderBy: {
        publishedAt: "desc",
      },
    });

    return record ? homeGalleryCompositionFromPrismaRecord(record) : null;
  }

  async listRecentMediaAssetIds(input: { limit: number }) {
    const records = await this.prisma.homeGalleryComposition.findMany({
      include: homeGalleryCompositionInclude,
      orderBy: {
        publishedAt: "desc",
      },
      take: input.limit,
    });
    const mediaAssetIds = new Set<string>();

    for (const record of records) {
      for (const slot of record.slots) {
        mediaAssetIds.add(slot.mediaAssetId);
      }
    }

    return [...mediaAssetIds];
  }

  async save(composition: HomeGalleryComposition) {
    const snapshot = composition.toSnapshot();

    await this.prisma.homeGalleryComposition.create({
      data: {
        createdAt: new Date(snapshot.createdAt),
        expiresAt: new Date(snapshot.expiresAt),
        id: snapshot.id,
        layout: snapshot.layout,
        mosaicVariant: snapshot.mosaicVariant,
        publishedAt: new Date(snapshot.publishedAt),
        seed: snapshot.seed,
        slots: {
          create: snapshot.slots.map((slot) => ({
            createdAt: new Date(snapshot.createdAt),
            id: slot.id,
            mediaAssetId: slot.mediaAssetId,
            orientation: slot.orientation,
            position: slot.position,
            slotKey: slot.slotKey,
          })),
        },
        trigger: snapshot.trigger,
      },
    });
  }

  async findReadyGalleryAssetsByIds(assetIds: string[]) {
    if (assetIds.length === 0) {
      return [];
    }

    const records = await this.prisma.mediaAsset.findMany({
      include: homeGalleryMediaAssetInclude,
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        collection: "GALLERY",
        id: {
          in: assetIds,
        },
        status: "READY",
        variants: {
          some: {},
        },
      },
    });

    return records.map(homeGalleryMediaAssetFromPrismaRecord);
  }

  async listReadyGalleryCandidates() {
    const records = await this.prisma.mediaAsset.findMany({
      include: homeGalleryMediaAssetInclude,
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        collection: "GALLERY",
        status: "READY",
        variants: {
          some: {},
        },
      },
    });

    return records.map(homeGalleryMediaAssetFromPrismaRecord);
  }
}

function homeGalleryCompositionFromPrismaRecord(
  record: PrismaHomeGalleryCompositionRecord,
) {
  return HomeGalleryComposition.create({
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    id: record.id,
    layout: homeGalleryLayoutFromPrisma(record.layout),
    mosaicVariant: homeGalleryMosaicVariantFromPrisma(record.mosaicVariant),
    publishedAt: record.publishedAt,
    seed: record.seed,
    slots: record.slots.map((slot) => ({
      id: slot.id,
      mediaAssetId: slot.mediaAssetId,
      orientation: homeGallerySlotOrientationFromPrisma(slot.orientation),
      position: slot.position,
      slotKey: homeGallerySlotKeyFromPrisma(slot.slotKey),
    })),
    trigger: homeGalleryRotationTriggerFromPrisma(record.trigger),
  });
}

function homeGalleryMediaAssetFromPrismaRecord(
  record: PrismaMediaAssetRecord,
): HomeGalleryMediaAssetDto {
  return {
    altText: altTextFromPrismaRecords(record.altTexts),
    id: record.id,
    original: {
      height: record.originalHeight,
      width: record.originalWidth,
    },
    title: record.title,
    variants: record.variants.map(homeGalleryMediaVariantFromPrismaRecord),
  };
}

function homeGalleryMediaVariantFromPrismaRecord(
  record: PrismaMediaAssetVariantRecord,
) {
  return {
    fileSizeBytes: record.sizeBytes,
    format: record.format,
    height: record.height,
    publicPath: record.publicPath,
    width: record.width,
  };
}

function altTextFromPrismaRecords(records: PrismaMediaAltTextRecord[]) {
  const altText: Partial<Record<SupportedLocaleCode, string>> = {};

  for (const record of records) {
    const locale = supportedLocaleFromPrisma(record.locale);

    if (locale) {
      altText[locale] = record.altText;
    }
  }

  return altText;
}

function homeGalleryLayoutFromPrisma(value: string): HomeGalleryLayout {
  if (
    value === "BALANCED" ||
    value === "LANDSCAPE_LED" ||
    value === "PORTRAIT_LED"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted home gallery layout.");
}

function homeGalleryMosaicVariantFromPrisma(
  value: string,
): HomeGalleryMosaicVariant {
  if (
    value === "BALANCED_CLASSIC" ||
    value === "BALANCED_RHYTHM" ||
    value === "BALANCED_STACK" ||
    value === "LANDSCAPE_HERO_LEFT" ||
    value === "LANDSCAPE_PANORAMA_TOP" ||
    value === "LANDSCAPE_WIDE_DUO" ||
    value === "PORTRAIT_COLUMNS" ||
    value === "PORTRAIT_EDITORIAL" ||
    value === "PORTRAIT_FEATURE_PAIR"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted home gallery mosaic variant.");
}

function homeGalleryRotationTriggerFromPrisma(
  value: string,
): HomeGalleryRotationTrigger {
  if (value === "AUTOMATIC" || value === "MANUAL") {
    return value;
  }

  throw new Error("Unsupported persisted home gallery trigger.");
}

function homeGallerySlotOrientationFromPrisma(
  value: string,
): HomeGallerySlotOrientation {
  if (value === "LANDSCAPE" || value === "PORTRAIT" || value === "SQUARE") {
    return value;
  }

  throw new Error("Unsupported persisted home gallery slot orientation.");
}

function homeGallerySlotKeyFromPrisma(value: string): HomeGallerySlotKey {
  if (
    value === "feature" ||
    value === "pairTop" ||
    value === "pairBottom" ||
    value === "lowerLeft" ||
    value === "lowerRight"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted home gallery slot key.");
}

function supportedLocaleFromPrisma(value: string): SupportedLocaleCode | null {
  if (value === "ca" || value === "en" || value === "es") {
    return value;
  }

  return null;
}
