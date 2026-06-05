import { domainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";

export type CancellationDepositOutcome =
  | "FULL_REFUND"
  | "MANUAL_REVIEW"
  | "NO_REFUND"
  | "PARTIAL_REFUND";

export type CancellationPolicyStatus = "ACTIVE" | "ARCHIVED";
export type CancellationPolicyVersionStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";

export type CancellationPolicyTierProps = {
  depositOutcome: CancellationDepositOutcome;
  fromMinutesBeforeDeparture: number | null;
  id: string;
  label: string;
  position: number;
  refundAmount: Money | null;
  toMinutesBeforeDeparture: number | null;
};

export type CancellationPolicyVersionProps = {
  activatedAt: Date | null;
  createdAt: Date;
  id: string;
  policyId: string;
  status: CancellationPolicyVersionStatus;
  summaries: Record<"ca" | "en" | "es", string>;
  tiers: CancellationPolicyTier[];
  updatedAt: Date;
  version: number;
};

export type CancellationPolicyProps = {
  createdAt: Date;
  id: string;
  isDefault: boolean;
  name: string;
  status: CancellationPolicyStatus;
  updatedAt: Date;
  versions: CancellationPolicyVersion[];
};

export type CancellationPolicyTierSnapshot = {
  depositOutcome: CancellationDepositOutcome;
  fromMinutesBeforeDeparture: number | null;
  id: string;
  label: string;
  position: number;
  refundAmount: ReturnType<Money["toSnapshot"]> | null;
  toMinutesBeforeDeparture: number | null;
};

export type CancellationPolicyVersionSnapshot = {
  activatedAt: string | null;
  createdAt: string;
  id: string;
  policyId: string;
  status: CancellationPolicyVersionStatus;
  summaries: Record<"ca" | "en" | "es", string>;
  tiers: CancellationPolicyTierSnapshot[];
  updatedAt: string;
  version: number;
};

export type CancellationPolicySnapshot = {
  activeVersion: CancellationPolicyVersionSnapshot | null;
  createdAt: string;
  id: string;
  isDefault: boolean;
  name: string;
  status: CancellationPolicyStatus;
  updatedAt: string;
  versions: CancellationPolicyVersionSnapshot[];
};

export type BookingCancellationPolicySnapshot = {
  policyId: string;
  policyName: string;
  summaries: Record<"ca" | "en" | "es", string>;
  tiers: CancellationPolicyTierSnapshot[];
  version: number;
  versionId: string;
};

export class CancellationPolicyTier {
  private constructor(private readonly props: CancellationPolicyTierProps) {}

  static create(input: CancellationPolicyTierProps) {
    const id = input.id.trim();
    const label = input.label.trim();

    if (!id) {
      throw domainError(
        "CANCELLATION_POLICY_TIER_ID_MISSING",
        "Cancellation policy tier id is required.",
      );
    }

    if (!label) {
      throw domainError(
        "CANCELLATION_POLICY_TIER_LABEL_MISSING",
        "Cancellation policy tier label is required.",
      );
    }

    if (
      input.fromMinutesBeforeDeparture === null &&
      input.toMinutesBeforeDeparture === null
    ) {
      throw domainError(
        "CANCELLATION_POLICY_TIER_BOUNDARY_INVALID",
        "Cancellation policy tier needs at least one boundary.",
      );
    }

    assertBoundary(input.fromMinutesBeforeDeparture);
    assertBoundary(input.toMinutesBeforeDeparture);

    if (
      input.fromMinutesBeforeDeparture !== null &&
      input.toMinutesBeforeDeparture !== null &&
      input.fromMinutesBeforeDeparture >= input.toMinutesBeforeDeparture
    ) {
      throw domainError(
        "CANCELLATION_POLICY_TIER_BOUNDARY_INVALID",
        "Cancellation policy tier range is invalid.",
      );
    }

    if (input.depositOutcome === "PARTIAL_REFUND" && !input.refundAmount) {
      throw domainError(
        "CANCELLATION_POLICY_TIER_REFUND_MISSING",
        "Partial refund tiers require a refund amount.",
      );
    }

    return new CancellationPolicyTier({
      ...input,
      id,
      label,
    });
  }

  toSnapshot(): CancellationPolicyTierSnapshot {
    return {
      depositOutcome: this.props.depositOutcome,
      fromMinutesBeforeDeparture: this.props.fromMinutesBeforeDeparture,
      id: this.props.id,
      label: this.props.label,
      position: this.props.position,
      refundAmount: this.props.refundAmount?.toSnapshot() ?? null,
      toMinutesBeforeDeparture: this.props.toMinutesBeforeDeparture,
    };
  }
}

export class CancellationPolicyVersion {
  private constructor(private readonly props: CancellationPolicyVersionProps) {}

  static create(input: CancellationPolicyVersionProps) {
    const id = input.id.trim();
    const policyId = input.policyId.trim();

    if (!id || !policyId) {
      throw domainError(
        "CANCELLATION_POLICY_VERSION_ID_MISSING",
        "Cancellation policy version ids are required.",
      );
    }

    if (!Number.isInteger(input.version) || input.version <= 0) {
      throw domainError(
        "CANCELLATION_POLICY_VERSION_INVALID",
        "Cancellation policy version must be positive.",
      );
    }

    if (input.status === "ACTIVE" && input.tiers.length === 0) {
      throw domainError(
        "CANCELLATION_POLICY_TIERS_MISSING",
        "Active cancellation policy versions require tiers.",
      );
    }

    assertNoTierOverlaps(input.tiers);

    return new CancellationPolicyVersion({
      ...input,
      id,
      policyId,
      summaries: {
        ca: input.summaries.ca.trim(),
        en: input.summaries.en.trim(),
        es: input.summaries.es.trim(),
      },
      tiers: input.tiers
        .slice()
        .sort((left, right) => left.toSnapshot().position - right.toSnapshot().position),
    });
  }

  activate(input: { activatedAt: Date }) {
    return CancellationPolicyVersion.create({
      ...this.props,
      activatedAt: input.activatedAt,
      status: "ACTIVE",
      updatedAt: input.activatedAt,
    });
  }

  archive(input: { archivedAt: Date }) {
    return CancellationPolicyVersion.create({
      ...this.props,
      status: "ARCHIVED",
      updatedAt: input.archivedAt,
    });
  }

  toSnapshot(): CancellationPolicyVersionSnapshot {
    return {
      activatedAt: this.props.activatedAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
      id: this.props.id,
      policyId: this.props.policyId,
      status: this.props.status,
      summaries: { ...this.props.summaries },
      tiers: this.props.tiers.map((tier) => tier.toSnapshot()),
      updatedAt: this.props.updatedAt.toISOString(),
      version: this.props.version,
    };
  }
}

export class CancellationPolicy {
  private constructor(private readonly props: CancellationPolicyProps) {}

  static create(input: CancellationPolicyProps) {
    const id = input.id.trim();
    const name = input.name.trim();

    if (!id || !name) {
      throw domainError(
        "CANCELLATION_POLICY_INVALID",
        "Cancellation policy id and name are required.",
      );
    }

    const activeVersions = input.versions.filter((version) => {
      return version.toSnapshot().status === "ACTIVE";
    });

    if (activeVersions.length > 1) {
      throw domainError(
        "CANCELLATION_POLICY_ACTIVE_VERSION_INVALID",
        "Cancellation policy can only have one active version.",
      );
    }

    return new CancellationPolicy({
      ...input,
      id,
      name,
      versions: input.versions
        .slice()
        .sort((left, right) => left.toSnapshot().version - right.toSnapshot().version),
    });
  }

  get id() {
    return this.props.id;
  }

  get activeVersion() {
    return (
      this.props.versions.find((version) => {
        return version.toSnapshot().status === "ACTIVE";
      }) ?? null
    );
  }

  toBookingSnapshot(): BookingCancellationPolicySnapshot | null {
    const activeVersion = this.activeVersion?.toSnapshot();

    if (!activeVersion) {
      return null;
    }

    return {
      policyId: this.props.id,
      policyName: this.props.name,
      summaries: activeVersion.summaries,
      tiers: activeVersion.tiers,
      version: activeVersion.version,
      versionId: activeVersion.id,
    };
  }

  toSnapshot(): CancellationPolicySnapshot {
    const versions = this.props.versions.map((version) => version.toSnapshot());

    return {
      activeVersion:
        versions.find((version) => version.status === "ACTIVE") ?? null,
      createdAt: this.props.createdAt.toISOString(),
      id: this.props.id,
      isDefault: this.props.isDefault,
      name: this.props.name,
      status: this.props.status,
      updatedAt: this.props.updatedAt.toISOString(),
      versions,
    };
  }
}

function assertBoundary(value: number | null) {
  if (value !== null && (!Number.isInteger(value) || value < 0)) {
    throw domainError(
      "CANCELLATION_POLICY_TIER_BOUNDARY_INVALID",
      "Cancellation policy tier boundary must be a non-negative integer.",
    );
  }
}

function assertNoTierOverlaps(tiers: CancellationPolicyTier[]) {
  const ranges = tiers.map((tier) => tier.toSnapshot());

  for (let leftIndex = 0; leftIndex < ranges.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < ranges.length; rightIndex += 1) {
      const left = ranges[leftIndex];
      const right = ranges[rightIndex];

      if (
        (left.fromMinutesBeforeDeparture ?? -Infinity) <
          (right.toMinutesBeforeDeparture ?? Infinity) &&
        (right.fromMinutesBeforeDeparture ?? -Infinity) <
          (left.toMinutesBeforeDeparture ?? Infinity)
      ) {
        throw domainError(
          "CANCELLATION_POLICY_TIER_OVERLAP",
          "Cancellation policy tiers must not overlap.",
        );
      }
    }
  }
}
