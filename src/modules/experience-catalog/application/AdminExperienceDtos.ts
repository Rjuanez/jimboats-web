import type {
  ExperienceMediaStatus,
  ExperienceStatus,
  ExperienceSnapshot,
} from "../domain/Experience";
import type { ExtraSnapshot } from "../domain/Extra";
import type { ExtraSelectionRuleSnapshot } from "../domain/ExtraSelectionRule";
import type { SlotPolicyMode, SlotPolicySnapshot } from "../domain/SlotPolicy";
import type { AdminLocalizedExperienceContentReadModel } from "./ports/LocalizedExperienceContentReader";
import type { CancellationPolicySnapshot } from "@/modules/booking/domain/CancellationPolicy";

export type MoneyDto = ExperienceSnapshot["basePrice"];

export type TimeRangeDto = {
  endMinutes: number;
  startMinutes: number;
};

export type FixedSlotCommand = {
  enabled: boolean;
  endMinutes: number;
  id: string;
  label: string;
  startMinutes: number;
};

export type SlotPolicyCommand =
  | {
      fixedSlots: FixedSlotCommand[];
      mode: "FIXED_SLOTS";
      timeZone: string;
    }
  | {
      granularityMinutes: number;
      mode: "ANY_AVAILABLE";
      operatingWindow: TimeRangeDto;
      timeZone: string;
    }
  | {
      mode: "MANUAL_APPROVAL";
      timeZone: string;
    };

export type ExtraSelectionRuleCommand = {
  capacityReduction?: number;
  enabled: boolean;
  extraId: string;
  limitPerBooking: number;
  noticeMinutes: number;
  priceOverride?: MoneyDto | null;
};

export type AdminExperienceMediaDto = {
  assetId: string | null;
  status: ExperienceMediaStatus;
};

export type AdminExperiencePublicationReadinessDto = {
  blockingIssues: string[];
  score: number;
  warnings: string[];
};

export type AdminExperienceDto = {
  allowsManualScheduling: boolean;
  basePrice: MoneyDto;
  bufferMinutes: number;
  capacity: number;
  cancellationPolicyId?: string | null;
  depositAmount: MoneyDto;
  departurePort: string;
  displayOrder: number;
  durationMinutes: number;
  extraSelectionRules: ExtraSelectionRuleSnapshot[];
  id: string;
  includedItems: string;
  internalName: string;
  internalNotes: string;
  maximumAdvanceMonths: number;
  media: AdminExperienceMediaDto;
  minimumAdvanceMinutes: number;
  publicationReadiness: AdminExperiencePublicationReadinessDto;
  slotPolicy: SlotPolicySnapshot;
  status: ExperienceStatus;
  type: string;
};

export type AdminExperienceListItemDto = Pick<
  AdminExperienceDto,
  | "basePrice"
  | "capacity"
  | "displayOrder"
  | "durationMinutes"
  | "id"
  | "internalName"
  | "media"
  | "publicationReadiness"
  | "status"
  | "type"
> & {
  slotPolicyMode: SlotPolicyMode;
};

export type AdminExperienceListDto = {
  experiences: AdminExperienceListItemDto[];
};

export type AdminExtraDto = ExtraSnapshot;

export type AdminExperienceWorkspaceItemDto = {
  experience: AdminExperienceDto;
  localizedContents: AdminLocalizedExperienceContentReadModel[];
};

export type AdminExperiencesWorkspaceDto = {
  cancellationPolicies?: CancellationPolicySnapshot[];
  experiences: AdminExperienceWorkspaceItemDto[];
  extras: AdminExtraDto[];
  locales: string[];
};

export type CreateExperienceCommand = {
  allowsManualScheduling: boolean;
  basePrice: MoneyDto;
  bufferMinutes: number;
  capacity: number;
  depositAmount: MoneyDto;
  departurePort: string;
  displayOrder: number;
  durationMinutes: number;
  extraSelectionRules?: ExtraSelectionRuleCommand[];
  id: string;
  includedItems: string;
  internalName: string;
  internalNotes: string;
  maximumAdvanceMonths: number;
  media?: AdminExperienceMediaDto;
  minimumAdvanceMinutes: number;
  slotPolicy: SlotPolicyCommand;
  status?: Exclude<ExperienceStatus, "ARCHIVED" | "PUBLISHED">;
  type: string;
};

export type UpdateExperienceCoreCommand = {
  basePrice?: MoneyDto;
  capacity?: number;
  cancellationPolicyId?: string | null;
  depositAmount?: MoneyDto;
  departurePort?: string;
  displayOrder?: number;
  durationMinutes?: number;
  experienceId: string;
  includedItems?: string;
  internalName?: string;
  internalNotes?: string;
  type?: string;
};

export type UpdateExperienceAvailabilityCommand = {
  allowsManualScheduling?: boolean;
  bufferMinutes?: number;
  experienceId: string;
  maximumAdvanceMonths?: number;
  minimumAdvanceMinutes?: number;
  slotPolicy: SlotPolicyCommand;
};

export type UpdateExperienceExtrasCommand = {
  experienceId: string;
  extraSelectionRules: ExtraSelectionRuleCommand[];
};

export type UpdateExperienceMediaCommand = {
  experienceId: string;
  media: AdminExperienceMediaDto;
};

export type PublishExperienceCommand = {
  experienceId: string;
};

export type UpdateExperiencePublicationStateCommand = {
  experienceId: string;
  status: ExperienceStatus;
};

export type ArchiveExperienceCommand = {
  experienceId: string;
};

export type DuplicateExperienceCommand = {
  experienceId: string;
  newExperienceId: string;
  newInternalName: string;
};
