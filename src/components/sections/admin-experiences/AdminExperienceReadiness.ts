import type {
  AdminExperience,
  AdminExperienceReadiness,
} from "./AdminExperienceTypes";

export function getExperienceReadiness(
  experience: AdminExperience,
): AdminExperienceReadiness {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];

  if (experience.basePrice <= 0) {
    blockingIssues.push("Base price must be greater than zero.");
  }

  if (experience.depositAmount !== 100) {
    warnings.push("Launch deposit is expected to be EUR 100.");
  }

  if (experience.durationMinutes <= 0) {
    blockingIssues.push("Duration must be configured.");
  }

  if (experience.capacity <= 0) {
    blockingIssues.push("Capacity must be configured.");
  }

  if (experience.bufferMinutes < 30) {
    warnings.push("Operational buffer should stay at least 30 minutes.");
  }

  if (experience.maxAdvanceMonths > 6) {
    warnings.push("Maximum booking window is currently six months.");
  }

  if (experience.media.status !== "ready") {
    blockingIssues.push("Primary image must be ready.");
  }

  if (
    experience.slotPolicyType === "fixed_slots" &&
    !experience.slots.some((slot) => slot.enabled)
  ) {
    blockingIssues.push("At least one fixed slot must be enabled.");
  }

  if (hasOverlappingSlots(experience)) {
    blockingIssues.push("Enabled fixed slots cannot overlap.");
  }

  const publishableLocales = Object.values(experience.translations).filter(
    (translation) => {
      return (
        translation.publicPageEnabled &&
        translation.indexing === "index" &&
        ["published", "ready"].includes(translation.status) &&
        Boolean(translation.slug && translation.seoTitle && translation.h1)
      );
    },
  );

  if (publishableLocales.length === 0) {
    blockingIssues.push("At least one public locale must be ready.");
  }

  const readyPieces = [
    experience.basePrice > 0,
    experience.durationMinutes > 0,
    experience.capacity > 0,
    experience.media.status === "ready",
    experience.slotPolicyType !== "fixed_slots" ||
      experience.slots.some((slot) => slot.enabled),
    !hasOverlappingSlots(experience),
    publishableLocales.length > 0,
    Object.values(experience.translations).every((translation) => {
      return translation.status !== "missing";
    }),
  ];

  const score = Math.round(
    (readyPieces.filter(Boolean).length / readyPieces.length) * 100,
  );

  return {
    blockingIssues,
    score,
    warnings,
  };
}

export function hasOverlappingSlots(experience: AdminExperience) {
  const enabledSlots = experience.slots
    .filter((slot) => slot.enabled)
    .map((slot) => ({
      end: timeToMinutes(slot.endTime),
      id: slot.id,
      start: timeToMinutes(slot.startTime),
    }))
    .filter((slot) => slot.start >= 0 && slot.end > slot.start)
    .sort((left, right) => left.start - right.start);

  for (let index = 1; index < enabledSlots.length; index += 1) {
    if (enabledSlots[index].start < enabledSlots[index - 1].end) {
      return true;
    }
  }

  return false;
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return -1;
  }

  return hour * 60 + minute;
}
