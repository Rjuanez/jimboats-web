import type {
  AdminCouponDto,
  AdminCouponEventDto,
  AdminCouponRedemptionDto,
  AdminCouponStatus,
  AdminCouponVersionDto,
  CreateAdminCouponCommand,
  UpdateAdminCouponCommand,
} from "@/modules/coupons/application/AdminCouponDtos";
import type { AdminCouponRepository } from "@/modules/coupons/application/ports/AdminCouponRepository";
import { normalizeCouponCode } from "@/modules/coupons/application/CouponValidation";
import type {
  ActiveCouponVersionReadModel,
  CouponRepository,
} from "@/modules/coupons/application/ports/CouponRepository";
import type { CouponDiscountType } from "@/modules/coupons/application/CouponDtos";

type CouponVersionRecord = {
  coupon: {
    campaignName: string;
    displayCode: string;
    id: string;
    status: string;
  };
  currency: string;
  discountAmountMinor: number | null;
  discountPercentageBps: number | null;
  discountType: string;
  experienceIds: string[];
  id: string;
  maxTotalRedemptions: number | null;
  status: string;
  validFrom: Date;
  validUntil: Date | null;
  versionNumber?: number;
};

type CouponRedemptionRecord = {
  bookingId: string;
  confirmedAt: Date | null;
  customerEmailNormalized: string;
  discountAmountMinor: number;
  finalCashRemainingAmountMinor: number;
  finalDepositAmountMinor: number;
  finalTotalAmountMinor: number;
  id: string;
  originalCashRemainingAmountMinor: number;
  originalDepositAmountMinor: number;
  originalTotalAmountMinor: number;
  releasedAt: Date | null;
  reservedAt: Date;
  status: string;
};

type CouponEventRecord = {
  actorId: string | null;
  actorType: string;
  bookingId: string | null;
  couponVersionId: string | null;
  id: string;
  metadataJson: unknown;
  occurredAt: Date;
  redemptionId: string | null;
  type: string;
};

type CouponRecord = {
  campaignName: string;
  codeNormalized: string;
  createdAt: Date;
  displayCode: string;
  events?: CouponEventRecord[];
  id: string;
  name: string;
  redemptions?: CouponRedemptionRecord[];
  status: string;
  updatedAt: Date;
  versions?: CouponVersionRecord[];
};

type CouponCreateModel = {
  campaignName: string;
  codeNormalized: string;
  displayCode: string;
  id: string;
  name: string;
  status: string;
};

type CouponVersionCreateModel = {
  couponId: string;
  currency: "EUR";
  discountAmountMinor: number | null;
  discountPercentageBps: number | null;
  discountType: CouponDiscountType;
  experienceIds: string[];
  id: string;
  maxTotalRedemptions: number | null;
  status: "ACTIVE";
  validFrom: Date;
  validUntil: Date | null;
  versionNumber: number;
};

type CouponVersionDelegate = {
  create(args: unknown): Promise<unknown>;
  findFirst(args: unknown): Promise<CouponVersionRecord | null>;
  updateMany(args: unknown): Promise<unknown>;
};

type CouponRedemptionDelegate = {
  count(args: unknown): Promise<number>;
  findUnique(args: unknown): Promise<{
    couponId: string;
    couponVersionId: string;
    id: string;
    status: string;
  } | null>;
  update(args: unknown): Promise<unknown>;
};

type CouponEventDelegate = {
  create(args: unknown): Promise<unknown>;
};

type CouponDelegate = {
  create(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<CouponRecord[]>;
  findUnique(args: unknown): Promise<CouponRecord | null>;
  update(args: unknown): Promise<unknown>;
};

type PrismaCouponTransactionClient = {
  coupon: CouponDelegate;
  couponEvent: CouponEventDelegate;
  couponRedemption: CouponRedemptionDelegate;
  couponVersion: CouponVersionDelegate;
};

export type PrismaCouponRepositoryClient = {
  $transaction<T>(
    callback: (transaction: PrismaCouponTransactionClient) => Promise<T>,
  ): Promise<T>;
  coupon: CouponDelegate;
  couponEvent: CouponEventDelegate;
  couponRedemption: CouponRedemptionDelegate;
  couponVersion: CouponVersionDelegate;
};

export class PrismaCouponRepository implements CouponRepository, AdminCouponRepository {
  constructor(private readonly prisma: PrismaCouponRepositoryClient) {}

  async list() {
    const records = await this.prisma.coupon.findMany({
      ...adminCouponIncludeArgs(),
      orderBy: {
        updatedAt: "desc",
      },
    });

    return records.map(adminCouponFromPrisma);
  }

  async findById(couponId: string) {
    const record = await this.prisma.coupon.findUnique({
      ...adminCouponIncludeArgs(),
      where: {
        id: couponId,
      },
    });

    return record ? adminCouponFromPrisma(record) : null;
  }

  async findByCodeNormalized(codeNormalized: string) {
    const record = await this.prisma.coupon.findUnique({
      ...adminCouponIncludeArgs(),
      where: {
        codeNormalized,
      },
    });

    return record ? adminCouponFromPrisma(record) : null;
  }

  async create(input: CreateAdminCouponCommand) {
    const codeNormalized = normalizeCouponCode(input.code);
    const version = couponVersionCreateModel({
      couponId: input.couponId,
      input,
      versionNumber: 1,
    });

    await this.prisma.$transaction(async (transaction) => {
      await transaction.coupon.create({
        data: {
          campaignName: input.campaignName,
          codeNormalized,
          displayCode: codeNormalized,
          id: input.couponId,
          name: input.name,
          status: input.status,
        } satisfies CouponCreateModel,
      });
      await transaction.couponVersion.create({
        data: version,
      });
      await transaction.couponEvent.create({
        data: {
          actorId: input.actorId ?? "admin",
          actorType: "ADMIN",
          couponId: input.couponId,
          couponVersionId: version.id,
          metadataJson: {
            action: "coupon-created",
            status: input.status,
          },
          occurredAt: input.now,
          type: "COUPON_CREATED",
        },
      });
      await transaction.couponEvent.create({
        data: {
          actorId: input.actorId ?? "admin",
          actorType: "ADMIN",
          couponId: input.couponId,
          couponVersionId: version.id,
          metadataJson: {
            action: "coupon-version-created",
            versionNumber: version.versionNumber,
          },
          occurredAt: input.now,
          type: "COUPON_VERSION_CREATED",
        },
      });
    });

    const created = await this.findById(input.couponId);

    if (!created) {
      throw new Error("Created coupon could not be loaded.");
    }

    return created;
  }

  async update(input: UpdateAdminCouponCommand) {
    await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.coupon.findUnique({
        include: {
          versions: {
            orderBy: {
              versionNumber: "desc",
            },
          },
        },
        where: {
          id: input.couponId,
        },
      });

      if (!current) {
        return;
      }

      const activeVersion = activeVersionFromRecord(current);
      const rulesChanged =
        !activeVersion || couponRulesChanged(activeVersion, input);

      await transaction.coupon.update({
        data: {
          campaignName: input.campaignName,
          name: input.name,
          status: input.status,
        },
        where: {
          id: input.couponId,
        },
      });

      if (rulesChanged) {
        await transaction.couponVersion.updateMany({
          data: {
            status: "ARCHIVED",
          },
          where: {
            couponId: input.couponId,
            status: "ACTIVE",
          },
        });

        const versionNumber = nextVersionNumber(current.versions ?? []);
        const version = couponVersionCreateModel({
          couponId: input.couponId,
          input,
          versionNumber,
        });

        await transaction.couponVersion.create({
          data: version,
        });
        await transaction.couponEvent.create({
          data: {
            actorId: input.actorId ?? "admin",
            actorType: "ADMIN",
            couponId: input.couponId,
            couponVersionId: version.id,
            metadataJson: {
              action: "coupon-rules-updated",
              versionNumber,
            },
            occurredAt: input.now,
            type: "COUPON_VERSION_CREATED",
          },
        });
        return;
      }

      await transaction.couponEvent.create({
        data: {
          actorId: input.actorId ?? "admin",
          actorType: "ADMIN",
          couponId: input.couponId,
          couponVersionId: activeVersion?.id ?? null,
          metadataJson: {
            action: "coupon-updated",
            status: input.status,
          },
          occurredAt: input.now,
          type: "COUPON_CREATED",
        },
      });
    });

    const updated = await this.findById(input.couponId);

    if (!updated) {
      throw new Error("Updated coupon could not be loaded.");
    }

    return updated;
  }

  async changeStatus(input: {
    actorId: string | null;
    couponId: string;
    now: Date;
    status: AdminCouponStatus;
  }) {
    await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.coupon.findUnique({
        include: {
          versions: {
            orderBy: {
              versionNumber: "desc",
            },
          },
        },
        where: {
          id: input.couponId,
        },
      });
      const activeVersion = current ? activeVersionFromRecord(current) : null;

      await transaction.coupon.update({
        data: {
          status: input.status,
        },
        where: {
          id: input.couponId,
        },
      });
      await transaction.couponEvent.create({
        data: {
          actorId: input.actorId ?? "admin",
          actorType: "ADMIN",
          couponId: input.couponId,
          couponVersionId: activeVersion?.id ?? null,
          metadataJson: {
            action: "coupon-status-changed",
            status: input.status,
          },
          occurredAt: input.now,
          type: "COUPON_CREATED",
        },
      });
    });

    const updated = await this.findById(input.couponId);

    if (!updated) {
      throw new Error("Updated coupon could not be loaded.");
    }

    return updated;
  }

  async findActiveVersionByCode(codeNormalized: string) {
    const record = await this.prisma.couponVersion.findFirst({
      include: {
        coupon: true,
      },
      orderBy: {
        versionNumber: "desc",
      },
      where: {
        coupon: {
          codeNormalized,
        },
        status: "ACTIVE",
      },
    });

    return record ? activeCouponVersionFromPrisma(record) : null;
  }

  countActiveRedemptions(input: { couponVersionId: string }) {
    return this.prisma.couponRedemption.count({
      where: {
        couponVersionId: input.couponVersionId,
        status: {
          in: ["CONFIRMED", "RESERVED"],
        },
      },
    });
  }

  async saveReservedRedemption() {
    // Public checkout persists reserved redemptions atomically through
    // PrismaBookingRepository.savePublicPendingBooking.
  }

  async confirmRedemptionForBooking(input: {
    bookingId: string;
    confirmedAt: Date;
  }) {
    const redemption = await this.prisma.couponRedemption.findUnique({
      where: {
        bookingId: input.bookingId,
      },
    });

    if (!redemption || redemption.status !== "RESERVED") {
      return;
    }

    await this.prisma.couponRedemption.update({
      data: {
        confirmedAt: input.confirmedAt,
        status: "CONFIRMED",
      },
      where: {
        id: redemption.id,
      },
    });
    await this.prisma.couponEvent.create({
      data: {
        actorId: "stripe-webhook",
        actorType: "SYSTEM",
        bookingId: input.bookingId,
        couponId: redemption.couponId,
        couponVersionId: redemption.couponVersionId,
        metadataJson: {},
        occurredAt: input.confirmedAt,
        redemptionId: redemption.id,
        type: "COUPON_CONFIRMED",
      },
    });
  }

  async releaseRedemptionForBooking(input: {
    bookingId: string;
    releasedAt: Date;
  }) {
    const redemption = await this.prisma.couponRedemption.findUnique({
      where: {
        bookingId: input.bookingId,
      },
    });

    if (!redemption || redemption.status !== "RESERVED") {
      return;
    }

    await this.prisma.couponRedemption.update({
      data: {
        releasedAt: input.releasedAt,
        status: "RELEASED",
      },
      where: {
        id: redemption.id,
      },
    });
    await this.prisma.couponEvent.create({
      data: {
        actorId: "stripe-webhook",
        actorType: "SYSTEM",
        bookingId: input.bookingId,
        couponId: redemption.couponId,
        couponVersionId: redemption.couponVersionId,
        metadataJson: {},
        occurredAt: input.releasedAt,
        redemptionId: redemption.id,
        type: "COUPON_RELEASED",
      },
    });
  }
}

function activeCouponVersionFromPrisma(
  record: CouponVersionRecord,
): ActiveCouponVersionReadModel {
  return {
    campaignName: record.coupon.campaignName,
    code: record.coupon.displayCode,
    couponId: record.coupon.id,
    couponStatus: couponStatus(record.coupon.status),
    couponVersionId: record.id,
    currency: "EUR",
    discountAmountMinor: record.discountAmountMinor,
    discountPercentageBps: record.discountPercentageBps,
    discountType: couponDiscountType(record.discountType),
    experienceIds: record.experienceIds,
    maxTotalRedemptions: record.maxTotalRedemptions,
    validFrom: record.validFrom,
    validUntil: record.validUntil,
    versionStatus: couponVersionStatus(record.status),
  };
}

function couponStatus(status: string): ActiveCouponVersionReadModel["couponStatus"] {
  if (
    status === "ACTIVE" ||
    status === "DRAFT" ||
    status === "EXPIRED" ||
    status === "PAUSED"
  ) {
    return status;
  }

  return "DRAFT";
}

function couponVersionStatus(
  status: string,
): ActiveCouponVersionReadModel["versionStatus"] {
  if (status === "ACTIVE" || status === "ARCHIVED" || status === "DRAFT") {
    return status;
  }

  return "DRAFT";
}

function couponDiscountType(status: string): CouponDiscountType {
  return status === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE";
}

function adminCouponIncludeArgs() {
  return {
    include: {
      events: {
        orderBy: {
          occurredAt: "desc",
        },
        take: 50,
      },
      redemptions: {
        orderBy: {
          reservedAt: "desc",
        },
      },
      versions: {
        orderBy: {
          versionNumber: "desc",
        },
      },
    },
  };
}

function adminCouponFromPrisma(record: CouponRecord): AdminCouponDto {
  const versions = (record.versions ?? []).map(adminCouponVersionFromPrisma);
  const redemptions = (record.redemptions ?? []).map(
    adminCouponRedemptionFromPrisma,
  );
  const activeVersion =
    versions.find((version) => version.status === "ACTIVE") ??
    versions[0] ??
    null;

  return {
    activeVersion,
    campaignName: record.campaignName,
    code: record.codeNormalized,
    confirmedRedemptions: redemptions.filter(
      (redemption) => redemption.status === "CONFIRMED",
    ).length,
    createdAt: record.createdAt.toISOString(),
    displayCode: record.displayCode,
    events: (record.events ?? []).map(adminCouponEventFromPrisma),
    id: record.id,
    name: record.name,
    redemptions,
    reservedRedemptions: redemptions.filter(
      (redemption) => redemption.status === "RESERVED",
    ).length,
    status: couponStatus(record.status),
    totalRedemptions: redemptions.length,
    updatedAt: record.updatedAt.toISOString(),
    versions,
  };
}

function adminCouponVersionFromPrisma(
  record: CouponVersionRecord,
): AdminCouponVersionDto {
  return {
    currency: "EUR",
    discountAmountMinor: record.discountAmountMinor,
    discountPercentageBps: record.discountPercentageBps,
    discountType: couponDiscountType(record.discountType),
    experienceIds: record.experienceIds,
    id: record.id,
    maxTotalRedemptions: record.maxTotalRedemptions,
    status: couponVersionStatus(record.status),
    validFrom: record.validFrom.toISOString(),
    validUntil: record.validUntil?.toISOString() ?? null,
    versionNumber: record.versionNumber ?? 1,
  };
}

function adminCouponRedemptionFromPrisma(
  record: CouponRedemptionRecord,
): AdminCouponRedemptionDto {
  return {
    bookingId: record.bookingId,
    confirmedAt: record.confirmedAt?.toISOString() ?? null,
    customerEmailNormalized: record.customerEmailNormalized,
    discountAmountMinor: record.discountAmountMinor,
    finalCashRemainingAmountMinor: record.finalCashRemainingAmountMinor,
    finalDepositAmountMinor: record.finalDepositAmountMinor,
    finalTotalAmountMinor: record.finalTotalAmountMinor,
    id: record.id,
    originalCashRemainingAmountMinor: record.originalCashRemainingAmountMinor,
    originalDepositAmountMinor: record.originalDepositAmountMinor,
    originalTotalAmountMinor: record.originalTotalAmountMinor,
    releasedAt: record.releasedAt?.toISOString() ?? null,
    reservedAt: record.reservedAt.toISOString(),
    status: couponRedemptionStatus(record.status),
  };
}

function adminCouponEventFromPrisma(
  record: CouponEventRecord,
): AdminCouponEventDto {
  return {
    actorId: record.actorId,
    actorType: couponActorType(record.actorType),
    bookingId: record.bookingId,
    couponVersionId: record.couponVersionId,
    id: record.id,
    metadata: metadataRecord(record.metadataJson),
    occurredAt: record.occurredAt.toISOString(),
    redemptionId: record.redemptionId,
    type: couponEventType(record.type),
  };
}

function activeVersionFromRecord(record: CouponRecord) {
  return (
    (record.versions ?? []).find((version) => version.status === "ACTIVE") ??
    record.versions?.[0] ??
    null
  );
}

function couponRulesChanged(
  current: CouponVersionRecord,
  next: UpdateAdminCouponCommand,
) {
  return (
    couponDiscountType(current.discountType) !== next.discountType ||
    current.discountAmountMinor !== (next.discountAmountMinor ?? null) ||
    current.discountPercentageBps !== (next.discountPercentageBps ?? null) ||
    current.maxTotalRedemptions !== (next.maxTotalRedemptions ?? null) ||
    current.validFrom.getTime() !== next.validFrom.getTime() ||
    (current.validUntil?.getTime() ?? null) !==
      (next.validUntil?.getTime() ?? null) ||
    arrayKey(current.experienceIds) !== arrayKey(next.experienceIds)
  );
}

function couponVersionCreateModel(input: {
  couponId: string;
  input: CreateAdminCouponCommand | UpdateAdminCouponCommand;
  versionNumber: number;
}): CouponVersionCreateModel {
  return {
    couponId: input.couponId,
    currency: "EUR",
    discountAmountMinor:
      input.input.discountType === "FIXED_AMOUNT"
        ? (input.input.discountAmountMinor ?? null)
        : null,
    discountPercentageBps:
      input.input.discountType === "PERCENTAGE"
        ? (input.input.discountPercentageBps ?? null)
        : null,
    discountType: input.input.discountType,
    experienceIds: [...new Set(input.input.experienceIds)].sort(),
    id: `${input.couponId}-v${input.versionNumber}`,
    maxTotalRedemptions: input.input.maxTotalRedemptions ?? null,
    status: "ACTIVE",
    validFrom: input.input.validFrom,
    validUntil: input.input.validUntil ?? null,
    versionNumber: input.versionNumber,
  };
}

function nextVersionNumber(versions: CouponVersionRecord[]) {
  const currentMax = versions.reduce((max, version) => {
    return Math.max(max, version.versionNumber ?? 1);
  }, 0);

  return currentMax + 1;
}

function arrayKey(values: string[]) {
  return [...new Set(values)].sort().join("\u0000");
}

function couponRedemptionStatus(
  status: string,
): AdminCouponRedemptionDto["status"] {
  if (
    status === "CONFIRMED" ||
    status === "REFUNDED" ||
    status === "RELEASED" ||
    status === "RESERVED" ||
    status === "VOIDED"
  ) {
    return status;
  }

  return "RESERVED";
}

function couponActorType(status: string): AdminCouponEventDto["actorType"] {
  if (status === "ADMIN" || status === "CUSTOMER" || status === "SYSTEM") {
    return status;
  }

  return "SYSTEM";
}

function couponEventType(status: string): AdminCouponEventDto["type"] {
  if (
    status === "COUPON_CONFIRMED" ||
    status === "COUPON_CREATED" ||
    status === "COUPON_RELEASED" ||
    status === "COUPON_RESERVED" ||
    status === "COUPON_VERSION_CREATED"
  ) {
    return status;
  }

  return "COUPON_CREATED";
}

function metadataRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }

  return {};
}
