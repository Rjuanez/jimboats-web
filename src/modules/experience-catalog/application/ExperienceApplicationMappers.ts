import { Money } from "@/shared/domain/Money";
import { TimeRange } from "@/shared/domain/TimeRange";

import type {
  AdminExperienceDto,
  AdminExperienceListItemDto,
  AdminExtraDto,
  ExtraSelectionRuleCommand,
  MoneyDto,
  SlotPolicyCommand,
} from "./AdminExperienceDtos";
import type { Extra } from "../domain/Extra";
import type {
  Experience,
  PublishableLocalizedContent,
} from "../domain/Experience";
import { ExtraSelectionRule } from "../domain/ExtraSelectionRule";
import { SlotPolicy } from "../domain/SlotPolicy";

export function moneyFromMinor(input: MoneyDto) {
  return Money.create(input);
}

export function slotPolicyFromCommand(command: SlotPolicyCommand) {
  if (command.mode === "FIXED_SLOTS") {
    return SlotPolicy.fixedSlots({
      fixedSlots: command.fixedSlots.map((slot) => ({
        enabled: slot.enabled,
        id: slot.id,
        label: slot.label,
        range: TimeRange.create({
          endMinutes: slot.endMinutes,
          startMinutes: slot.startMinutes,
        }),
      })),
      timeZone: command.timeZone,
    });
  }

  if (command.mode === "ANY_AVAILABLE") {
    return SlotPolicy.anyAvailable({
      granularityMinutes: command.granularityMinutes,
      operatingWindow: TimeRange.create(command.operatingWindow),
      timeZone: command.timeZone,
    });
  }

  return SlotPolicy.manualApproval({
    timeZone: command.timeZone,
  });
}

export function extraRulesFromCommand(command: ExtraSelectionRuleCommand[]) {
  return command.map((rule) =>
    ExtraSelectionRule.create({
      capacityReduction: rule.capacityReduction,
      enabled: rule.enabled,
      extraId: rule.extraId,
      limitPerBooking: rule.limitPerBooking,
      noticeMinutes: rule.noticeMinutes,
      priceOverride: rule.priceOverride
        ? moneyFromMinor(rule.priceOverride)
        : null,
    }),
  );
}

export function experienceToAdminDto(
  experience: Experience,
  input: {
    localizedContents: PublishableLocalizedContent[];
    selectableExtras: Extra[];
  },
): AdminExperienceDto {
  const snapshot = experience.toSnapshot();

  return {
    ...snapshot,
    publicationReadiness: experience.getPublicationReadiness(input),
  };
}

export function experienceToAdminListItemDto(
  experience: Experience,
  input: {
    localizedContents: PublishableLocalizedContent[];
    selectableExtras: Extra[];
  },
): AdminExperienceListItemDto {
  const snapshot = experience.toSnapshot();
  const publicationReadiness = experience.getPublicationReadiness(input);

  return {
    basePrice: snapshot.basePrice,
    capacity: snapshot.capacity,
    displayOrder: snapshot.displayOrder,
    durationMinutes: snapshot.durationMinutes,
    id: snapshot.id,
    internalName: snapshot.internalName,
    media: snapshot.media,
    publicationReadiness,
    slotPolicyMode: snapshot.slotPolicy.mode,
    status: snapshot.status,
    type: snapshot.type,
  };
}

export function extraToAdminDto(extra: Extra): AdminExtraDto {
  return extra.toSnapshot();
}
