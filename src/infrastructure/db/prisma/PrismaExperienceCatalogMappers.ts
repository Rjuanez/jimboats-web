import { Money } from "@/shared/domain/Money";
import type { CurrencyCode } from "@/shared/domain/Money";
import { TimeRange } from "@/shared/domain/TimeRange";
import { Experience } from "@/modules/experience-catalog/domain/Experience";
import type {
  ExperienceMediaStatus,
  ExperienceStatus,
} from "@/modules/experience-catalog/domain/Experience";
import { Extra } from "@/modules/experience-catalog/domain/Extra";
import type { ExtraStatus } from "@/modules/experience-catalog/domain/Extra";
import { ExtraSelectionRule } from "@/modules/experience-catalog/domain/ExtraSelectionRule";
import { SlotPolicy } from "@/modules/experience-catalog/domain/SlotPolicy";
import type { SlotPolicyMode } from "@/modules/experience-catalog/domain/SlotPolicy";

export type PrismaExperienceFixedSlotRecord = {
  enabled: boolean;
  endMinutes: number;
  id: string;
  label: string;
  position: number;
  slotKey: string;
  startMinutes: number;
};

export type PrismaExperienceExtraRuleRecord = {
  capacityReduction: number;
  enabled: boolean;
  extraId: string;
  id: string;
  limitPerBooking: number;
  noticeMinutes: number;
  priceOverrideAmountMinor: number | null;
  priceOverrideCurrency: string | null;
  slotKey: string | null;
};

export type PrismaExperienceRecord = {
  allowsManualScheduling: boolean;
  basePriceAmountMinor: number;
  basePriceCurrency: string;
  bufferMinutes: number;
  capacity: number;
  depositAmountMinor: number;
  depositCurrency: string;
  departurePort: string;
  displayOrder: number;
  durationMinutes: number;
  extraRules: PrismaExperienceExtraRuleRecord[];
  fixedSlots: PrismaExperienceFixedSlotRecord[];
  id: string;
  includedItems: string;
  internalName: string;
  internalNotes: string;
  maximumAdvanceMonths: number;
  primaryMediaAssetId: string | null;
  primaryMediaStatus: string;
  minimumAdvanceMinutes: number;
  slotGranularityMinutes: number | null;
  slotOperatingEndMinutes: number | null;
  slotOperatingStartMinutes: number | null;
  slotPolicyMode: string;
  slotPolicyTimezone: string;
  status: string;
  type: string;
};

export type PrismaExtraRecord = {
  defaultNoticeMinutes: number;
  id: string;
  name: string;
  priceAmountMinor: number;
  priceCurrency: string;
  status: string;
};

export type PrismaExperienceWriteModel = {
  experience: {
    allowsManualScheduling: boolean;
    basePriceAmountMinor: number;
    basePriceCurrency: CurrencyCode;
    bufferMinutes: number;
    capacity: number;
    depositAmountMinor: number;
    depositCurrency: CurrencyCode;
    departurePort: string;
    displayOrder: number;
    durationMinutes: number;
    includedItems: string;
    internalName: string;
    internalNotes: string;
    maximumAdvanceMonths: number;
    primaryMediaAssetId: string | null;
    primaryMediaStatus: ExperienceMediaStatus;
    minimumAdvanceMinutes: number;
    slotGranularityMinutes: number | null;
    slotOperatingEndMinutes: number | null;
    slotOperatingStartMinutes: number | null;
    slotPolicyMode: SlotPolicyMode;
    slotPolicyTimezone: string;
    status: ExperienceStatus;
    type: string;
  };
  extraRules: Array<{
    capacityReduction: number;
    enabled: boolean;
    extraId: string;
    id: string;
    limitPerBooking: number;
    noticeMinutes: number;
    priceOverrideAmountMinor: number | null;
    priceOverrideCurrency: CurrencyCode | null;
    slotKey: string | null;
  }>;
  fixedSlots: Array<{
    enabled: boolean;
    endMinutes: number;
    id: string;
    label: string;
    position: number;
    slotKey: string;
    startMinutes: number;
  }>;
  id: string;
};

export function experienceFromPrismaRecord(record: PrismaExperienceRecord) {
  return Experience.create({
    allowsManualScheduling: record.allowsManualScheduling,
    basePrice: Money.create({
      amountMinor: record.basePriceAmountMinor,
      currency: currencyFromPrisma(record.basePriceCurrency),
    }),
    bufferMinutes: record.bufferMinutes,
    capacity: record.capacity,
    depositAmount: Money.create({
      amountMinor: record.depositAmountMinor,
      currency: currencyFromPrisma(record.depositCurrency),
    }),
    departurePort: record.departurePort,
    displayOrder: record.displayOrder,
    durationMinutes: record.durationMinutes,
    extraSelectionRules: record.extraRules.map(extraRuleFromPrismaRecord),
    id: record.id,
    includedItems: record.includedItems,
    internalName: record.internalName,
    internalNotes: record.internalNotes,
    maximumAdvanceMonths: record.maximumAdvanceMonths,
    media: {
      assetId: record.primaryMediaAssetId,
      status: experienceMediaStatusFromPrisma(record.primaryMediaStatus),
    },
    minimumAdvanceMinutes: record.minimumAdvanceMinutes,
    slotPolicy: slotPolicyFromPrismaRecord(record),
    status: experienceStatusFromPrisma(record.status),
    type: record.type,
  });
}

export function extraFromPrismaRecord(record: PrismaExtraRecord) {
  return Extra.create({
    defaultNoticeMinutes: record.defaultNoticeMinutes,
    id: record.id,
    name: record.name,
    price: Money.create({
      amountMinor: record.priceAmountMinor,
      currency: currencyFromPrisma(record.priceCurrency),
    }),
    status: extraStatusFromPrisma(record.status),
  });
}

export function experienceToPrismaWriteModel(
  experience: Experience,
): PrismaExperienceWriteModel {
  const snapshot = experience.toSnapshot();
  const slotPolicy = snapshot.slotPolicy;

  return {
    experience: {
      allowsManualScheduling: snapshot.allowsManualScheduling,
      basePriceAmountMinor: snapshot.basePrice.amountMinor,
      basePriceCurrency: snapshot.basePrice.currency,
      bufferMinutes: snapshot.bufferMinutes,
      capacity: snapshot.capacity,
      depositAmountMinor: snapshot.depositAmount.amountMinor,
      depositCurrency: snapshot.depositAmount.currency,
      departurePort: snapshot.departurePort,
      displayOrder: snapshot.displayOrder,
      durationMinutes: snapshot.durationMinutes,
      includedItems: snapshot.includedItems,
      internalName: snapshot.internalName,
      internalNotes: snapshot.internalNotes,
      maximumAdvanceMonths: snapshot.maximumAdvanceMonths,
      primaryMediaAssetId: snapshot.media.assetId,
      primaryMediaStatus: snapshot.media.status,
      minimumAdvanceMinutes: snapshot.minimumAdvanceMinutes,
      slotGranularityMinutes: slotPolicy.granularityMinutes,
      slotOperatingEndMinutes: slotPolicy.operatingWindow?.endMinutes ?? null,
      slotOperatingStartMinutes:
        slotPolicy.operatingWindow?.startMinutes ?? null,
      slotPolicyMode: slotPolicy.mode,
      slotPolicyTimezone: slotPolicy.timeZone,
      status: snapshot.status,
      type: snapshot.type,
    },
    extraRules: snapshot.extraSelectionRules.map((rule) => ({
      capacityReduction: rule.capacityReduction,
      enabled: rule.enabled,
      extraId: rule.extraId,
      id: experienceExtraRuleId(snapshot.id, rule.extraId),
      limitPerBooking: rule.limitPerBooking,
      noticeMinutes: rule.noticeMinutes,
      priceOverrideAmountMinor: rule.priceOverride?.amountMinor ?? null,
      priceOverrideCurrency: rule.priceOverride?.currency ?? null,
      slotKey: null,
    })),
    fixedSlots: slotPolicy.fixedSlots.map((slot, position) => ({
      enabled: slot.enabled,
      endMinutes: slot.endMinutes,
      id: experienceFixedSlotId(snapshot.id, slot.id),
      label: slot.label,
      position,
      slotKey: slot.id,
      startMinutes: slot.startMinutes,
    })),
    id: snapshot.id,
  };
}

function slotPolicyFromPrismaRecord(record: PrismaExperienceRecord) {
  const mode = slotPolicyModeFromPrisma(record.slotPolicyMode);

  if (mode === "FIXED_SLOTS") {
    return SlotPolicy.fixedSlots({
      fixedSlots: record.fixedSlots
        .slice()
        .sort((left, right) => left.position - right.position)
        .map((slot) => ({
          enabled: slot.enabled,
          id: slot.slotKey,
          label: slot.label,
          range: TimeRange.create({
            endMinutes: slot.endMinutes,
            startMinutes: slot.startMinutes,
          }),
        })),
      timeZone: record.slotPolicyTimezone,
    });
  }

  if (mode === "ANY_AVAILABLE") {
    if (
      record.slotGranularityMinutes === null ||
      record.slotOperatingStartMinutes === null ||
      record.slotOperatingEndMinutes === null
    ) {
      throw new Error("Flexible slot policy is missing persistence fields.");
    }

    return SlotPolicy.anyAvailable({
      granularityMinutes: record.slotGranularityMinutes,
      operatingWindow: TimeRange.create({
        endMinutes: record.slotOperatingEndMinutes,
        startMinutes: record.slotOperatingStartMinutes,
      }),
      timeZone: record.slotPolicyTimezone,
    });
  }

  return SlotPolicy.manualApproval({
    timeZone: record.slotPolicyTimezone,
  });
}

function extraRuleFromPrismaRecord(record: PrismaExperienceExtraRuleRecord) {
  return ExtraSelectionRule.create({
    capacityReduction: record.capacityReduction,
    enabled: record.enabled,
    extraId: record.extraId,
    limitPerBooking: record.limitPerBooking,
    noticeMinutes: record.noticeMinutes,
    priceOverride:
      record.priceOverrideAmountMinor === null
        ? null
        : Money.create({
            amountMinor: record.priceOverrideAmountMinor,
            currency: currencyFromPrisma(record.priceOverrideCurrency),
          }),
  });
}

function currencyFromPrisma(value: string | null): CurrencyCode {
  if (value !== "EUR") {
    throw new Error("Unsupported persisted currency.");
  }

  return value;
}

function experienceStatusFromPrisma(value: string): ExperienceStatus {
  if (
    value === "ARCHIVED" ||
    value === "DRAFT" ||
    value === "PUBLISHED" ||
    value === "READY"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted experience status.");
}

function experienceMediaStatusFromPrisma(value: string): ExperienceMediaStatus {
  if (
    value === "FAILED" ||
    value === "MISSING" ||
    value === "PROCESSING" ||
    value === "READY"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted media status.");
}

function slotPolicyModeFromPrisma(value: string): SlotPolicyMode {
  if (
    value === "ANY_AVAILABLE" ||
    value === "FIXED_SLOTS" ||
    value === "MANUAL_APPROVAL"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted slot policy mode.");
}

function extraStatusFromPrisma(value: string): ExtraStatus {
  if (value === "ACTIVE" || value === "ARCHIVED" || value === "DRAFT") {
    return value;
  }

  throw new Error("Unsupported persisted extra status.");
}

function experienceFixedSlotId(experienceId: string, slotKey: string) {
  return `${experienceId}:slot:${slotKey}`;
}

function experienceExtraRuleId(experienceId: string, extraId: string) {
  return `${experienceId}:extra:${extraId}`;
}
