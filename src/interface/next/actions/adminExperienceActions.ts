"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  AdminExperience,
  AdminExperienceActionResult,
  AdminExperienceCreateInput,
  AdminExperiencesState,
} from "@/components/sections/admin-experiences/AdminExperienceTypes";
import type { AdminMediaListDto } from "@/modules/media-library/application/AdminMediaDtos";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

import { presentAdminExperiencesWorkspace } from "../presenters/adminExperiencesPresenter";
import {
  parseAdminCreateExperience,
  parseAdminExperience,
  parseAdminExperienceId,
} from "../validators/adminExperienceValidators";

export async function createAdminExperienceAction(
  input: AdminExperienceCreateInput,
): Promise<
  AdminExperienceActionResult<{
    experienceId: string;
    state: AdminExperiencesState;
  }>
> {
  try {
    const commandInput = parseAdminCreateExperience(input);
    const container = getContainer();
    const workspace = await container.adminExperiences.getWorkspace();
    const existingIds = workspace.experiences.map((item) => item.experience.id);
    const experienceId = makeUniqueSlug(
      slugify(commandInput.internalName) || "experience",
      existingIds,
    );
    const displayOrder =
      Math.max(
        0,
        ...workspace.experiences.map((item) => item.experience.displayOrder),
      ) + 1;

    await container.adminExperiences.createExperience({
      allowsManualScheduling: true,
      basePrice: toMoney(commandInput.basePrice),
      bufferMinutes: 30,
      capacity: commandInput.capacity,
      depositAmount: toMoney(100),
      departurePort: "Port Olimpic, Barcelona",
      displayOrder,
      durationMinutes: commandInput.durationMinutes,
      id: experienceId,
      includedItems: "",
      internalName: commandInput.internalName,
      internalNotes:
        "EUR 100 online deposit. Remaining amount paid in cash on board.",
      maximumAdvanceMonths: 6,
      minimumAdvanceMinutes: 60,
      slotPolicy: {
        fixedSlots: [
          createInitialFixedSlot({
            durationMinutes: commandInput.durationMinutes,
            experienceId,
          }),
        ],
        mode: "FIXED_SLOTS",
        timeZone: "Europe/Madrid",
      },
      status: "DRAFT",
      type: commandInput.type,
    });

    return ok({
      experienceId,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function saveAdminExperienceAction(
  input: AdminExperience,
): Promise<
  AdminExperienceActionResult<{
    state: AdminExperiencesState;
  }>
> {
  try {
    const experience = parseAdminExperience(input);
    const container = getContainer();
    const mediaList = await container.adminMedia.listAssets();

    await container.adminExperiences.updateCore({
      basePrice: toMoney(experience.basePrice),
      capacity: experience.capacity,
      cancellationPolicyId: experience.cancellationPolicyId,
      depositAmount: toMoney(experience.depositAmount),
      departurePort: experience.departurePort,
      displayOrder: experience.displayOrder,
      durationMinutes: experience.durationMinutes,
      experienceId: experience.id,
      includedItems: experience.includedInternal,
      internalName: experience.internalName,
      internalNotes: experience.internalNotes,
      type: experience.type,
    });
    await container.adminExperiences.updateAvailability({
      allowsManualScheduling: experience.allowManualScheduling,
      bufferMinutes: experience.bufferMinutes,
      experienceId: experience.id,
      maximumAdvanceMonths: experience.maxAdvanceMonths,
      minimumAdvanceMinutes: experience.minAdvanceHours * 60,
      slotPolicy: toSlotPolicyCommand(experience),
    });
    await container.adminExperiences.updateExtras({
      experienceId: experience.id,
      extraSelectionRules: experience.extras.map((extra) => ({
        capacityReduction: extra.capacityReduction,
        enabled: extra.enabled,
        extraId: extra.extraId,
        limitPerBooking: extra.limitPerBooking,
        noticeMinutes: extra.noticeHours * 60,
        priceOverride:
          extra.priceOverride === null ? null : toMoney(extra.priceOverride),
      })),
    });
    await container.adminExperiences.updateMedia({
      experienceId: experience.id,
      media: mediaCommandFromExperience(experience, mediaList),
    });

    await Promise.all(
      Object.values(experience.translations).map((translation) =>
        container.adminExperiences.updateLocalizedContent({
          bringText: translation.bring,
          experienceId: experience.id,
          faqItems: translation.faq.map((faq) => ({
            answer: faq.answer,
            question: faq.question,
          })),
          geoSummary: translation.geoSummary,
          h1: translation.h1,
          imageAltText: translation.altText,
          includedText: translation.included,
          indexingPolicy:
            translation.indexing === "index" ? "INDEX" : "NOINDEX",
          keyFacts: translation.keyFacts,
          locale: translation.locale,
          mainContent: translation.longDescription,
          publicPageEnabled: translation.publicPageEnabled,
          seoDescription: translation.seoDescription,
          seoTitle: translation.seoTitle,
          slug: translation.slug,
          status: translationStatusToApplication(translation.status),
          summary: translation.cardSummary,
          title: translation.title,
          visibleTerms: translation.visibleTerms,
        }),
      ),
    );

    await container.adminExperiences.updatePublicationState({
      experienceId: experience.id,
      status: publicationStatusToApplication(experience.status),
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function archiveAdminExperienceAction(input: {
  experienceId: string;
}): Promise<
  AdminExperienceActionResult<{
    state: AdminExperiencesState;
  }>
> {
  try {
    const { experienceId } = parseAdminExperienceId(input);
    const container = getContainer();

    await container.adminExperiences.archiveExperience({
      experienceId,
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function duplicateAdminExperienceAction(input: {
  experienceId: string;
}): Promise<
  AdminExperienceActionResult<{
    experienceId: string;
    state: AdminExperiencesState;
  }>
> {
  try {
    const { experienceId } = parseAdminExperienceId(input);
    const container = getContainer();
    const workspace = await container.adminExperiences.getWorkspace();
    const source = workspace.experiences.find((item) => {
      return item.experience.id === experienceId;
    });

    if (!source) {
      throw new ApplicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

    const newExperienceId = makeUniqueSlug(
      `${source.experience.id}-copy`,
      workspace.experiences.map((item) => item.experience.id),
    );

    await container.adminExperiences.duplicateExperience({
      experienceId,
      newExperienceId,
      newInternalName: `${source.experience.internalName} Copy`,
    });

    return ok({
      experienceId: newExperienceId,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

async function loadState(container: ReturnType<typeof getContainer>) {
  const [workspace, mediaList] = await Promise.all([
    container.adminExperiences.getWorkspace(),
    container.adminMedia.listAssets(),
  ]);

  return presentAdminExperiencesWorkspace(workspace, mediaList);
}

function toSlotPolicyCommand(experience: AdminExperience) {
  if (experience.slotPolicyType === "any_available") {
    return {
      granularityMinutes: experience.flexibleAvailability.granularityMinutes,
      mode: "ANY_AVAILABLE" as const,
      operatingWindow: {
        endMinutes: timeToMinutes(experience.flexibleAvailability.endTime),
        startMinutes: timeToMinutes(experience.flexibleAvailability.startTime),
      },
      timeZone: "Europe/Madrid",
    };
  }

  if (experience.slotPolicyType === "manual_approval") {
    return {
      mode: "MANUAL_APPROVAL" as const,
      timeZone: "Europe/Madrid",
    };
  }

  return {
    fixedSlots: experience.slots.map((slot, index) => ({
      enabled: slot.enabled,
      endMinutes: timeToMinutes(slot.endTime),
      id: slot.id.trim() || `slot-${index + 1}`,
      label: slot.label,
      startMinutes: timeToMinutes(slot.startTime),
    })),
    mode: "FIXED_SLOTS" as const,
    timeZone: "Europe/Madrid",
  };
}

function toMoney(amount: number) {
  return {
    amountMinor: Math.round(amount * 100),
    currency: "EUR" as const,
  };
}

function createInitialFixedSlot(input: {
  durationMinutes: number;
  experienceId: string;
}) {
  const startMinutes = 10 * 60;
  const endMinutes = Math.min(24 * 60, startMinutes + input.durationMinutes);

  return {
    enabled: true,
    endMinutes,
    id: `${input.experienceId}-slot-1000`,
    label: "Morning departure",
    startMinutes,
  };
}

function mediaCommandFromExperience(
  experience: AdminExperience,
  mediaList: AdminMediaListDto,
) {
  const assetId = experience.media.assetId?.trim() || null;

  if (!assetId) {
    return {
      assetId: null,
      status: "MISSING" as const,
    };
  }

  const asset = mediaList.assets.find((candidate) => {
    return candidate.id === assetId;
  });

  if (!asset) {
    throw new ApplicationError(
      "MEDIA_ASSET_NOT_FOUND",
      "Selected media asset was not found.",
    );
  }

  if (asset.collection !== "EXPERIENCES") {
    throw new DomainError(
      "MEDIA_ASSET_COLLECTION_INVALID",
      "Experience images must come from the Experiences media collection.",
    );
  }

  return {
    assetId: asset.id,
    status: asset.status,
  };
}

function publicationStatusToApplication(status: AdminExperience["status"]) {
  if (status === "archived") {
    return "ARCHIVED" as const;
  }

  if (status === "published") {
    return "PUBLISHED" as const;
  }

  if (status === "ready") {
    return "READY" as const;
  }

  return "DRAFT" as const;
}

function translationStatusToApplication(
  status: AdminExperience["translations"]["en"]["status"],
) {
  if (status === "published") {
    return "PUBLISHED" as const;
  }

  if (status === "ready") {
    return "READY" as const;
  }

  if (status === "needs_review") {
    return "NEEDS_REVIEW" as const;
  }

  if (status === "missing") {
    return "NEEDS_TRANSLATION" as const;
  }

  return "DRAFT" as const;
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new DomainError("TIME_RANGE_INVALID", "Local time is invalid.");
  }

  return hour * 60 + minute;
}

function ok<TData>(data: TData): AdminExperienceActionResult<TData> {
  return {
    data,
    ok: true,
  };
}

function failure<TData = never>(
  error: unknown,
): AdminExperienceActionResult<TData> {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid admin experience input.",
      ok: false,
    };
  }

  console.error(error);

  return {
    message: "Unexpected error while saving the experience.",
    ok: false,
  };
}

function makeUniqueSlug(baseSlug: string, existingIds: string[]) {
  const usedIds = new Set(existingIds);

  if (!usedIds.has(baseSlug)) {
    return baseSlug;
  }

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${baseSlug}-${index}`;

    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }

  return `${baseSlug}-new`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
