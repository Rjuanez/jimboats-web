import { domainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";

import type { Extra } from "./Extra";
import type { ExtraSelectionRule } from "./ExtraSelectionRule";
import type { SlotPolicy } from "./SlotPolicy";

export type ExperienceStatus = "ARCHIVED" | "DRAFT" | "PUBLISHED" | "READY";
export type ExperienceMediaStatus =
  | "FAILED"
  | "MISSING"
  | "PROCESSING"
  | "READY";

export type ExperienceMediaReference = {
  assetId: string | null;
  status: ExperienceMediaStatus;
};

export type PublishableLocalizedContent = {
  isPublishable(): boolean;
};

export type ExperienceProps = {
  allowsManualScheduling: boolean;
  basePrice: Money;
  bufferMinutes: number;
  capacity: number;
  depositAmount: Money;
  departurePort: string;
  displayOrder: number;
  durationMinutes: number;
  extraSelectionRules: ExtraSelectionRule[];
  id: string;
  includedItems: string;
  internalName: string;
  internalNotes: string;
  maximumAdvanceMonths: number;
  media: ExperienceMediaReference;
  minimumAdvanceMinutes: number;
  slotPolicy: SlotPolicy;
  status: ExperienceStatus;
  type: string;
};

export type ExperiencePublicationReadiness = {
  blockingIssues: string[];
  score: number;
  warnings: string[];
};

export type ExperienceSnapshot = {
  allowsManualScheduling: boolean;
  basePrice: ReturnType<Money["toSnapshot"]>;
  bufferMinutes: number;
  capacity: number;
  depositAmount: ReturnType<Money["toSnapshot"]>;
  departurePort: string;
  displayOrder: number;
  durationMinutes: number;
  extraSelectionRules: Array<ReturnType<ExtraSelectionRule["toSnapshot"]>>;
  id: string;
  includedItems: string;
  internalName: string;
  internalNotes: string;
  maximumAdvanceMonths: number;
  media: ExperienceMediaReference;
  minimumAdvanceMinutes: number;
  slotPolicy: ReturnType<SlotPolicy["toSnapshot"]>;
  status: ExperienceStatus;
  type: string;
};

export class Experience {
  private constructor(private readonly props: ExperienceProps) {}

  static create(input: ExperienceProps) {
    const id = input.id.trim();
    const departurePort = input.departurePort.trim();
    const internalName = input.internalName.trim();
    const type = input.type.trim();

    if (!id) {
      throw domainError("EXPERIENCE_ID_MISSING", "Experience id is required.");
    }

    if (!internalName) {
      throw domainError(
        "EXPERIENCE_NAME_MISSING",
        "Experience internal name is required.",
      );
    }

    if (!departurePort) {
      throw domainError(
        "EXPERIENCE_DEPARTURE_PORT_MISSING",
        "Experience departure port is required.",
      );
    }

    if (
      !Number.isInteger(input.durationMinutes) ||
      input.durationMinutes <= 0
    ) {
      throw domainError(
        "EXPERIENCE_DURATION_INVALID",
        "Experience duration must be a positive integer.",
      );
    }

    if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
      throw domainError(
        "EXPERIENCE_CAPACITY_INVALID",
        "Experience capacity must be a positive integer.",
      );
    }

    if (!Number.isInteger(input.displayOrder) || input.displayOrder <= 0) {
      throw domainError(
        "EXPERIENCE_DISPLAY_ORDER_INVALID",
        "Experience display order must be a positive integer.",
      );
    }

    if (!Number.isInteger(input.bufferMinutes) || input.bufferMinutes < 0) {
      throw domainError(
        "EXPERIENCE_BUFFER_INVALID",
        "Experience buffer must be a non-negative integer.",
      );
    }

    if (
      !Number.isInteger(input.minimumAdvanceMinutes) ||
      input.minimumAdvanceMinutes < 0
    ) {
      throw domainError(
        "EXPERIENCE_MINIMUM_ADVANCE_INVALID",
        "Experience minimum advance must be a non-negative integer.",
      );
    }

    if (
      !Number.isInteger(input.maximumAdvanceMonths) ||
      input.maximumAdvanceMonths < 1 ||
      input.maximumAdvanceMonths > 6
    ) {
      throw domainError(
        "EXPERIENCE_MAXIMUM_ADVANCE_INVALID",
        "Experience maximum advance must be between one and six months.",
      );
    }

    return new Experience({
      ...input,
      departurePort,
      id,
      includedItems: input.includedItems.trim(),
      internalName,
      internalNotes: input.internalNotes.trim(),
      type,
    });
  }

  get id() {
    return this.props.id;
  }

  get status() {
    return this.props.status;
  }

  withCoreConfiguration(
    patch: Partial<
      Pick<
        ExperienceProps,
        | "basePrice"
        | "capacity"
        | "depositAmount"
        | "departurePort"
        | "displayOrder"
        | "durationMinutes"
        | "includedItems"
        | "internalName"
        | "internalNotes"
        | "type"
      >
    >,
  ) {
    const nextProps: ExperienceProps = { ...this.props };

    if (patch.basePrice !== undefined) {
      nextProps.basePrice = patch.basePrice;
    }

    if (patch.capacity !== undefined) {
      nextProps.capacity = patch.capacity;
    }

    if (patch.depositAmount !== undefined) {
      nextProps.depositAmount = patch.depositAmount;
    }

    if (patch.departurePort !== undefined) {
      nextProps.departurePort = patch.departurePort;
    }

    if (patch.displayOrder !== undefined) {
      nextProps.displayOrder = patch.displayOrder;
    }

    if (patch.durationMinutes !== undefined) {
      nextProps.durationMinutes = patch.durationMinutes;
    }

    if (patch.includedItems !== undefined) {
      nextProps.includedItems = patch.includedItems;
    }

    if (patch.internalName !== undefined) {
      nextProps.internalName = patch.internalName;
    }

    if (patch.internalNotes !== undefined) {
      nextProps.internalNotes = patch.internalNotes;
    }

    if (patch.type !== undefined) {
      nextProps.type = patch.type;
    }

    return Experience.create(nextProps);
  }

  withAvailabilityConfiguration(
    patch: Partial<
      Pick<
        ExperienceProps,
        | "allowsManualScheduling"
        | "bufferMinutes"
        | "maximumAdvanceMonths"
        | "minimumAdvanceMinutes"
        | "slotPolicy"
      >
    >,
  ) {
    return Experience.create({
      ...this.props,
      ...patch,
    });
  }

  withSlotPolicy(slotPolicy: SlotPolicy) {
    return this.withAvailabilityConfiguration({
      slotPolicy,
    });
  }

  withExtraSelectionRules(extraSelectionRules: ExtraSelectionRule[]) {
    return Experience.create({
      ...this.props,
      extraSelectionRules,
    });
  }

  withMedia(media: ExperienceMediaReference) {
    return Experience.create({
      ...this.props,
      media: { ...media },
    });
  }

  withPublicationState(status: ExperienceStatus) {
    return Experience.create({
      ...this.props,
      status,
    });
  }

  duplicate(input: Pick<ExperienceProps, "id" | "internalName">) {
    return Experience.create({
      ...this.props,
      id: input.id,
      internalName: input.internalName,
      status: "DRAFT",
    });
  }

  archive() {
    return this.withPublicationState("ARCHIVED");
  }

  publish(input: {
    localizedContents: PublishableLocalizedContent[];
    selectableExtras: Extra[];
  }) {
    const readiness = this.getPublicationReadiness(input);

    if (readiness.blockingIssues.length > 0) {
      throw domainError(
        "EXPERIENCE_NOT_PUBLISHABLE",
        readiness.blockingIssues.join(" "),
      );
    }

    return this.withPublicationState("PUBLISHED");
  }

  getPublicationReadiness(input: {
    localizedContents: PublishableLocalizedContent[];
    selectableExtras: Extra[];
  }): ExperiencePublicationReadiness {
    const blockingIssues: string[] = [];
    const warnings: string[] = [];

    if (this.props.status === "ARCHIVED") {
      blockingIssues.push("Archived experience cannot be published.");
    }

    if (this.props.basePrice.isZero()) {
      blockingIssues.push("Base price must be greater than zero.");
    }

    if (
      !this.props.depositAmount.equals(
        Money.create({
          amountMinor: 10_000,
          currency: this.props.depositAmount.currency,
        }),
      )
    ) {
      warnings.push("Launch deposit is expected to be EUR 100.");
    }

    if (!this.props.media.assetId) {
      blockingIssues.push("Primary image must be attached.");
    } else if (this.props.media.status !== "READY") {
      blockingIssues.push("Primary image must be ready.");
    }

    if (!input.localizedContents.some((content) => content.isPublishable())) {
      blockingIssues.push("At least one public locale must be publishable.");
    }

    for (const rule of this.props.extraSelectionRules) {
      if (!rule.enabled) {
        continue;
      }

      const extra = input.selectableExtras.find((candidate) => {
        return candidate.id === rule.extraId;
      });

      if (!extra || !extra.isSelectable()) {
        blockingIssues.push(`Enabled extra ${rule.extraId} is not selectable.`);
      }
    }

    const readyPieces = [
      this.props.status !== "ARCHIVED",
      !this.props.basePrice.isZero(),
      this.props.media.assetId !== null && this.props.media.status === "READY",
      input.localizedContents.some((content) => content.isPublishable()),
      this.props.extraSelectionRules.every((rule) => {
        if (!rule.enabled) {
          return true;
        }

        return input.selectableExtras.some((extra) => {
          return extra.id === rule.extraId && extra.isSelectable();
        });
      }),
    ];

    return {
      blockingIssues,
      score: Math.round(
        (readyPieces.filter(Boolean).length / readyPieces.length) * 100,
      ),
      warnings,
    };
  }

  toSnapshot(): ExperienceSnapshot {
    return {
      allowsManualScheduling: this.props.allowsManualScheduling,
      basePrice: this.props.basePrice.toSnapshot(),
      bufferMinutes: this.props.bufferMinutes,
      capacity: this.props.capacity,
      depositAmount: this.props.depositAmount.toSnapshot(),
      departurePort: this.props.departurePort,
      displayOrder: this.props.displayOrder,
      durationMinutes: this.props.durationMinutes,
      extraSelectionRules: this.props.extraSelectionRules.map((rule) =>
        rule.toSnapshot(),
      ),
      id: this.props.id,
      includedItems: this.props.includedItems,
      internalName: this.props.internalName,
      internalNotes: this.props.internalNotes,
      maximumAdvanceMonths: this.props.maximumAdvanceMonths,
      media: { ...this.props.media },
      minimumAdvanceMinutes: this.props.minimumAdvanceMinutes,
      slotPolicy: this.props.slotPolicy.toSnapshot(),
      status: this.props.status,
      type: this.props.type,
    };
  }
}
