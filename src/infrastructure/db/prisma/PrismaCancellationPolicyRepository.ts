import type { CancellationPolicyRepository } from "@/modules/booking/application/ports/CancellationPolicyRepository";
import {
  CancellationPolicy,
  CancellationPolicyTier,
  CancellationPolicyVersion,
} from "@/modules/booking/domain/CancellationPolicy";
import type {
  CancellationDepositOutcome,
  CancellationPolicyStatus,
  CancellationPolicyVersionStatus,
} from "@/modules/booking/domain/CancellationPolicy";
import { Money } from "@/shared/domain/Money";
import type { CurrencyCode } from "@/shared/domain/Money";

type PolicyFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type PolicyUpsertArgs = {
  create: {
    createdAt: Date;
    id: string;
    isDefault: boolean;
    name: string;
    status: CancellationPolicyStatus;
    updatedAt: Date;
  };
  update: {
    isDefault: boolean;
    name: string;
    status: CancellationPolicyStatus;
    updatedAt: Date;
  };
  where: { id: string };
};

type PolicyUpdateManyArgs = {
  data: { isDefault: boolean };
  where?: unknown;
};

type VersionCreateArgs = {
  data: {
    activatedAt: Date | null;
    createdAt: Date;
    id: string;
    policyId: string;
    status: CancellationPolicyVersionStatus;
    summaryCa: string;
    summaryEn: string;
    summaryEs: string;
    updatedAt: Date;
    version: number;
  };
};

type VersionUpdateManyArgs = {
  data: { status: CancellationPolicyVersionStatus; updatedAt: Date };
  where?: unknown;
};

type TierCreateManyArgs = {
  data: Array<{
    createdAt: Date;
    depositOutcome: CancellationDepositOutcome;
    fromMinutesBeforeDeparture: number | null;
    id: string;
    label: string;
    position: number;
    refundAmountMinor: number | null;
    refundCurrency: CurrencyCode | null;
    toMinutesBeforeDeparture: number | null;
    updatedAt: Date;
    versionId: string;
  }>;
};

type ExperienceFindArgs = {
  select?: unknown;
  where?: unknown;
};

type CancellationPolicyDelegate = {
  findFirst(args: PolicyFindArgs): Promise<PrismaCancellationPolicyRecord | null>;
  findMany(args: PolicyFindArgs): Promise<PrismaCancellationPolicyRecord[]>;
  upsert(args: PolicyUpsertArgs): Promise<unknown>;
  updateMany(args: PolicyUpdateManyArgs): Promise<unknown>;
};

type CancellationPolicyVersionDelegate = {
  create(args: VersionCreateArgs): Promise<unknown>;
  updateMany(args: VersionUpdateManyArgs): Promise<unknown>;
};

type CancellationPolicyTierDelegate = {
  createMany(args: TierCreateManyArgs): Promise<unknown>;
};

type ExperienceDelegate = {
  findUnique(
    args: ExperienceFindArgs,
  ): Promise<{ cancellationPolicyId: string | null } | null>;
};

export type PrismaCancellationPolicyRepositoryTransaction = {
  cancellationPolicy: CancellationPolicyDelegate;
  cancellationPolicyTier: CancellationPolicyTierDelegate;
  cancellationPolicyVersion: CancellationPolicyVersionDelegate;
};

export type PrismaCancellationPolicyRepositoryClient =
  PrismaCancellationPolicyRepositoryTransaction & {
    experience: ExperienceDelegate;
    $transaction<T>(
      operation: (
        transaction: PrismaCancellationPolicyRepositoryTransaction,
      ) => Promise<T>,
    ): Promise<T>;
  };

type PrismaCancellationPolicyTierRecord = {
  depositOutcome: string;
  fromMinutesBeforeDeparture: number | null;
  id: string;
  label: string;
  position: number;
  refundAmountMinor: number | null;
  refundCurrency: string | null;
  toMinutesBeforeDeparture: number | null;
};

type PrismaCancellationPolicyVersionRecord = {
  activatedAt: Date | null;
  createdAt: Date;
  id: string;
  policyId: string;
  status: string;
  summaryCa: string;
  summaryEn: string;
  summaryEs: string;
  tiers: PrismaCancellationPolicyTierRecord[];
  updatedAt: Date;
  version: number;
};

type PrismaCancellationPolicyRecord = {
  createdAt: Date;
  id: string;
  isDefault: boolean;
  name: string;
  status: string;
  updatedAt: Date;
  versions: PrismaCancellationPolicyVersionRecord[];
};

const policyInclude = {
  versions: {
    include: {
      tiers: {
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      version: "asc",
    },
  },
};

export class PrismaCancellationPolicyRepository
  implements CancellationPolicyRepository
{
  constructor(private readonly prisma: PrismaCancellationPolicyRepositoryClient) {}

  async list() {
    const records = await this.prisma.cancellationPolicy.findMany({
      include: policyInclude,
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return records.map(policyFromRecord);
  }

  async findActiveBookingSnapshotForExperience(experienceId: string) {
    const experience = await this.prisma.experience.findUnique({
      select: {
        cancellationPolicyId: true,
      },
      where: {
        id: experienceId,
      },
    });
    const policyId = experience?.cancellationPolicyId ?? undefined;
    const record = await this.prisma.cancellationPolicy.findFirst({
      include: policyInclude,
      where: {
        id: policyId,
        status: "ACTIVE",
      },
    });
    const fallback = record
      ? null
      : await this.prisma.cancellationPolicy.findFirst({
          include: policyInclude,
          where: {
            isDefault: true,
            status: "ACTIVE",
          },
        });

    const resolved = record ?? fallback;

    return resolved ? policyFromRecord(resolved).toBookingSnapshot() : null;
  }

  async saveNewActiveVersion(policy: CancellationPolicy) {
    const snapshot = policy.toSnapshot();
    const activeVersion = snapshot.activeVersion;

    if (!activeVersion) {
      throw new Error("Cancellation policy requires an active version.");
    }

    await this.prisma.$transaction(async (transaction) => {
      if (snapshot.isDefault) {
        await transaction.cancellationPolicy.updateMany({
          data: {
            isDefault: false,
          },
          where: {
            id: {
              not: snapshot.id,
            },
          },
        });
      }

      await transaction.cancellationPolicy.upsert({
        create: {
          createdAt: new Date(snapshot.createdAt),
          id: snapshot.id,
          isDefault: snapshot.isDefault,
          name: snapshot.name,
          status: snapshot.status,
          updatedAt: new Date(snapshot.updatedAt),
        },
        update: {
          isDefault: snapshot.isDefault,
          name: snapshot.name,
          status: snapshot.status,
          updatedAt: new Date(snapshot.updatedAt),
        },
        where: {
          id: snapshot.id,
        },
      });

      await transaction.cancellationPolicyVersion.updateMany({
        data: {
          status: "ARCHIVED",
          updatedAt: new Date(snapshot.updatedAt),
        },
        where: {
          policyId: snapshot.id,
          status: "ACTIVE",
        },
      });

      await transaction.cancellationPolicyVersion.create({
        data: {
          activatedAt: activeVersion.activatedAt
            ? new Date(activeVersion.activatedAt)
            : null,
          createdAt: new Date(activeVersion.createdAt),
          id: activeVersion.id,
          policyId: snapshot.id,
          status: "ACTIVE",
          summaryCa: activeVersion.summaries.ca,
          summaryEn: activeVersion.summaries.en,
          summaryEs: activeVersion.summaries.es,
          updatedAt: new Date(activeVersion.updatedAt),
          version: activeVersion.version,
        },
      });

      await transaction.cancellationPolicyTier.createMany({
        data: activeVersion.tiers.map((tier) => ({
          createdAt: new Date(activeVersion.createdAt),
          depositOutcome: tier.depositOutcome,
          fromMinutesBeforeDeparture: tier.fromMinutesBeforeDeparture,
          id: tier.id,
          label: tier.label,
          position: tier.position,
          refundAmountMinor: tier.refundAmount?.amountMinor ?? null,
          refundCurrency: tier.refundAmount?.currency ?? null,
          toMinutesBeforeDeparture: tier.toMinutesBeforeDeparture,
          updatedAt: new Date(activeVersion.updatedAt),
          versionId: activeVersion.id,
        })),
      });
    });
  }
}

function policyFromRecord(record: PrismaCancellationPolicyRecord) {
  return CancellationPolicy.create({
    createdAt: record.createdAt,
    id: record.id,
    isDefault: record.isDefault,
    name: record.name,
    status: policyStatusFromPrisma(record.status),
    updatedAt: record.updatedAt,
    versions: record.versions.map(versionFromRecord),
  });
}

function versionFromRecord(record: PrismaCancellationPolicyVersionRecord) {
  return CancellationPolicyVersion.create({
    activatedAt: record.activatedAt,
    createdAt: record.createdAt,
    id: record.id,
    policyId: record.policyId,
    status: versionStatusFromPrisma(record.status),
    summaries: {
      ca: record.summaryCa,
      en: record.summaryEn,
      es: record.summaryEs,
    },
    tiers: record.tiers.map(tierFromRecord),
    updatedAt: record.updatedAt,
    version: record.version,
  });
}

function tierFromRecord(record: PrismaCancellationPolicyTierRecord) {
  return CancellationPolicyTier.create({
    depositOutcome: depositOutcomeFromPrisma(record.depositOutcome),
    fromMinutesBeforeDeparture: record.fromMinutesBeforeDeparture,
    id: record.id,
    label: record.label,
    position: record.position,
    refundAmount:
      record.refundAmountMinor === null
        ? null
        : Money.create({
            amountMinor: record.refundAmountMinor,
            currency: currencyFromPrisma(record.refundCurrency),
          }),
    toMinutesBeforeDeparture: record.toMinutesBeforeDeparture,
  });
}

function policyStatusFromPrisma(value: string): CancellationPolicyStatus {
  if (value === "ACTIVE" || value === "ARCHIVED") {
    return value;
  }

  throw new Error("Unsupported cancellation policy status.");
}

function versionStatusFromPrisma(value: string): CancellationPolicyVersionStatus {
  if (value === "ACTIVE" || value === "ARCHIVED" || value === "DRAFT") {
    return value;
  }

  throw new Error("Unsupported cancellation policy version status.");
}

function depositOutcomeFromPrisma(value: string): CancellationDepositOutcome {
  if (
    value === "FULL_REFUND" ||
    value === "MANUAL_REVIEW" ||
    value === "NO_REFUND" ||
    value === "PARTIAL_REFUND"
  ) {
    return value;
  }

  throw new Error("Unsupported cancellation deposit outcome.");
}

function currencyFromPrisma(value: string | null): CurrencyCode {
  if (value !== "EUR") {
    throw new Error("Unsupported cancellation refund currency.");
  }

  return value;
}
