import type {
  PublicBookingCalendarBlockReadModel,
  PublicBookingCatalogExperienceReadModel,
  PublicBookingCatalogMediaReadModel,
  PublicBookingCatalogReader,
} from "@/modules/booking/application/ports/PublicBookingCatalogReader";
import type { CurrencyCode } from "@/shared/domain/Money";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

type PublicBookingExperienceFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type PublicBookingMediaFindArgs = {
  include?: unknown;
  where?: unknown;
};

type PublicBookingCalendarBlockFindArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type PublicBookingExperienceDelegate = {
  findMany(
    args: PublicBookingExperienceFindArgs,
  ): Promise<PrismaPublicBookingExperienceRecord[]>;
};

type PublicBookingMediaDelegate = {
  findMany(
    args: PublicBookingMediaFindArgs,
  ): Promise<PrismaPublicBookingMediaRecord[]>;
};

type PublicBookingCalendarBlockDelegate = {
  findMany(
    args: PublicBookingCalendarBlockFindArgs,
  ): Promise<PrismaPublicBookingCalendarBlockRecord[]>;
};

export type PrismaPublicBookingCatalogReaderClient = {
  calendarBlock: PublicBookingCalendarBlockDelegate;
  experience: PublicBookingExperienceDelegate;
  mediaAsset: PublicBookingMediaDelegate;
};

type PrismaPublicBookingLocalizedContentRecord = {
  imageAltText: string;
  mainContent: string;
  summary: string;
  title: string;
};

type PrismaPublicBookingFixedSlotRecord = {
  enabled: boolean;
  endMinutes: number;
  label: string;
  position: number;
  slotKey: string;
  startMinutes: number;
};

type PrismaPublicBookingExtraRecord = {
  id: string;
  name: string;
  priceAmountMinor: number;
  priceCurrency: string;
  primaryMediaAssetId: string | null;
  status: string;
};

type PrismaPublicBookingExtraRuleRecord = {
  capacityReduction: number;
  enabled: boolean;
  extra: PrismaPublicBookingExtraRecord;
  extraId: string;
  limitPerBooking: number;
  noticeMinutes: number;
  priceOverrideAmountMinor: number | null;
  priceOverrideCurrency: string | null;
};

type PrismaPublicBookingExperienceRecord = {
  basePriceAmountMinor: number;
  basePriceCurrency: string;
  bufferMinutes: number;
  capacity: number;
  cancellationPolicy: {
    versions: Array<{
      status: string;
      summaryCa: string;
      summaryEn: string;
      summaryEs: string;
    }>;
  } | null;
  depositAmountMinor: number;
  depositCurrency: string;
  displayOrder: number;
  durationMinutes: number;
  extraRules: PrismaPublicBookingExtraRuleRecord[];
  fixedSlots: PrismaPublicBookingFixedSlotRecord[];
  id: string;
  internalName: string;
  localizedContents: PrismaPublicBookingLocalizedContentRecord[];
  maximumAdvanceMonths: number;
  minimumAdvanceMinutes: number;
  primaryMediaAssetId: string | null;
  slotGranularityMinutes: number | null;
  slotOperatingEndMinutes: number | null;
  slotOperatingStartMinutes: number | null;
  slotPolicyMode: string;
  slotPolicyTimezone: string;
};

type PrismaPublicBookingMediaRecord = {
  altTexts: Array<{
    altText: string;
    locale: string;
  }>;
  id: string;
  status: string;
  variants: Array<{
    height: number;
    publicPath: string;
    variantKey: string;
    width: number;
  }>;
};

type PrismaPublicBookingCalendarBlockRecord = {
  id: string;
  protectedEndAt: Date;
  protectedStartAt: Date;
};

const bookableContentStatuses = ["PUBLISHED", "READY"] as const;

const mediaInclude = {
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

export class PrismaPublicBookingCatalogReader implements PublicBookingCatalogReader {
  constructor(
    private readonly prisma: PrismaPublicBookingCatalogReaderClient,
  ) {}

  async listBookableExperiences(input: { locale: SupportedLocaleCode }) {
    const records = await this.prisma.experience.findMany({
      include: {
        extraRules: {
          include: {
            extra: true,
          },
          orderBy: {
            extraId: "asc",
          },
        },
        fixedSlots: {
          orderBy: {
            position: "asc",
          },
        },
        cancellationPolicy: {
          include: {
            versions: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
        localizedContents: {
          where: {
            locale: input.locale,
            publicPageEnabled: true,
            status: {
              in: [...bookableContentStatuses],
            },
          },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { internalName: "asc" }],
      where: {
        localizedContents: {
          some: {
            locale: input.locale,
            publicPageEnabled: true,
            status: {
              in: [...bookableContentStatuses],
            },
          },
        },
        status: "PUBLISHED",
      },
    });
    const mediaById = await this.loadMediaById(
      mediaIdsFromExperiences(records),
    );

    return records.map((record) => experienceFromRecord(record, mediaById));
  }

  async listActiveCalendarBlocks(input: { from: Date; to: Date }) {
    const records = await this.prisma.calendarBlock.findMany({
      orderBy: [{ protectedStartAt: "asc" }],
      where: {
        protectedEndAt: {
          gt: input.from,
        },
        protectedStartAt: {
          lt: input.to,
        },
        status: "ACTIVE",
      },
    });

    return records.map(
      (record): PublicBookingCalendarBlockReadModel => ({
        id: record.id,
        protectedEndAt: record.protectedEndAt,
        protectedStartAt: record.protectedStartAt,
      }),
    );
  }

  private async loadMediaById(mediaIds: string[]) {
    const uniqueIds = [...new Set(mediaIds.filter(Boolean))];

    if (uniqueIds.length === 0) {
      return new Map<string, PublicBookingCatalogMediaReadModel>();
    }

    const records = await this.prisma.mediaAsset.findMany({
      include: mediaInclude,
      where: {
        id: {
          in: uniqueIds,
        },
      },
    });

    return new Map(
      records.map((record) => [record.id, mediaFromRecord(record)] as const),
    );
  }
}

function experienceFromRecord(
  record: PrismaPublicBookingExperienceRecord,
  mediaById: Map<string, PublicBookingCatalogMediaReadModel>,
): PublicBookingCatalogExperienceReadModel {
  const content = record.localizedContents[0];

  return {
    basePrice: {
      amountMinor: record.basePriceAmountMinor,
      currency: currencyFromPrisma(record.basePriceCurrency),
    },
    bufferMinutes: record.bufferMinutes,
    capacity: record.capacity,
    cancellationPolicySummary: cancellationSummaryFromRecord(record),
    depositAmount: {
      amountMinor: record.depositAmountMinor,
      currency: currencyFromPrisma(record.depositCurrency),
    },
    description:
      content?.summary || content?.mainContent || record.internalName,
    displayOrder: record.displayOrder,
    durationMinutes: record.durationMinutes,
    extras: record.extraRules.map((rule) => ({
      capacityReduction: rule.capacityReduction,
      description: rule.extra.name,
      enabled: rule.enabled,
      id: rule.extraId,
      limitPerBooking: rule.limitPerBooking,
      media: rule.extra.primaryMediaAssetId
        ? (mediaById.get(rule.extra.primaryMediaAssetId) ?? null)
        : null,
      name: rule.extra.name,
      noticeMinutes: rule.noticeMinutes,
      price: {
        amountMinor: rule.extra.priceAmountMinor,
        currency: currencyFromPrisma(rule.extra.priceCurrency),
      },
      priceOverride:
        rule.priceOverrideAmountMinor === null
          ? null
          : {
              amountMinor: rule.priceOverrideAmountMinor,
              currency: currencyFromPrisma(rule.priceOverrideCurrency),
            },
      status: extraStatusFromPrisma(rule.extra.status),
    })),
    id: record.id,
    internalName: record.internalName,
    maximumAdvanceMonths: record.maximumAdvanceMonths,
    media: record.primaryMediaAssetId
      ? (mediaById.get(record.primaryMediaAssetId) ?? null)
      : null,
    minimumAdvanceMinutes: record.minimumAdvanceMinutes,
    slotPolicy: slotPolicyFromRecord(record),
    title: content?.title || record.internalName,
  };
}

function cancellationSummaryFromRecord(
  record: PrismaPublicBookingExperienceRecord,
) {
  const activeVersion = record.cancellationPolicy?.versions[0];

  return (
    activeVersion?.summaryEn ||
    activeVersion?.summaryEs ||
    activeVersion?.summaryCa ||
    "Cancellation terms are confirmed before payment."
  );
}

function mediaFromRecord(
  record: PrismaPublicBookingMediaRecord,
): PublicBookingCatalogMediaReadModel {
  return {
    altText: Object.fromEntries(
      record.altTexts
        .map((item) => [localeFromPrisma(item.locale), item.altText] as const)
        .filter(([locale]) => Boolean(locale)),
    ),
    status: mediaStatusFromPrisma(record.status),
    variants: record.variants.map((variant) => ({
      height: variant.height,
      publicPath: variant.publicPath,
      width: variant.width,
    })),
  };
}

function mediaIdsFromExperiences(
  records: PrismaPublicBookingExperienceRecord[],
) {
  return records
    .flatMap((record) => [
      record.primaryMediaAssetId,
      ...record.extraRules.map((rule) => rule.extra.primaryMediaAssetId),
    ])
    .filter((id): id is string => Boolean(id));
}

function slotPolicyFromRecord(record: PrismaPublicBookingExperienceRecord) {
  if (record.slotPolicyMode === "FIXED_SLOTS") {
    return {
      fixedSlots: record.fixedSlots
        .slice()
        .sort((left, right) => left.position - right.position)
        .map((slot) => ({
          enabled: slot.enabled,
          endMinutes: slot.endMinutes,
          id: slot.slotKey,
          label: slot.label,
          startMinutes: slot.startMinutes,
        })),
      mode: "FIXED_SLOTS" as const,
      timeZone: record.slotPolicyTimezone,
    };
  }

  if (record.slotPolicyMode === "ANY_AVAILABLE") {
    return {
      granularityMinutes: record.slotGranularityMinutes,
      mode: "ANY_AVAILABLE" as const,
      operatingWindow:
        record.slotOperatingStartMinutes === null ||
        record.slotOperatingEndMinutes === null
          ? null
          : {
              endMinutes: record.slotOperatingEndMinutes,
              startMinutes: record.slotOperatingStartMinutes,
            },
      timeZone: record.slotPolicyTimezone,
    };
  }

  return {
    mode: "MANUAL_APPROVAL" as const,
    timeZone: record.slotPolicyTimezone,
  };
}

function mediaStatusFromPrisma(value: string) {
  if (value === "FAILED" || value === "PROCESSING" || value === "READY") {
    return value;
  }

  throw new Error("Unsupported persisted media asset status.");
}

function extraStatusFromPrisma(value: string) {
  if (value === "ACTIVE" || value === "ARCHIVED" || value === "DRAFT") {
    return value;
  }

  throw new Error("Unsupported persisted extra status.");
}

function currencyFromPrisma(value: string | null): CurrencyCode {
  if (value === "EUR") {
    return value;
  }

  throw new Error("Unsupported persisted currency.");
}

function localeFromPrisma(value: string): SupportedLocaleCode | null {
  if (value === "ca" || value === "en" || value === "es") {
    return value;
  }

  return null;
}
