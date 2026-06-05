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

  const availabilityIssues = getAvailabilityIssues(experience);

  blockingIssues.push(...availabilityIssues);

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
    availabilityIssues.length === 0,
    availabilityIssues.length === 0 &&
      (experience.slotPolicyType !== "fixed_slots" ||
        !hasOverlappingSlots(experience)),
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

export function getAvailabilityIssues(experience: AdminExperience) {
  if (experience.slotPolicyType === "fixed_slots") {
    return getFixedSlotIssues(experience);
  }

  if (experience.slotPolicyType === "any_available") {
    return getFlexibleAvailabilityIssues(experience);
  }

  return [];
}

export function getFixedSlotIssues(experience: AdminExperience) {
  const issues: string[] = [];
  const enabledSlots = experience.slots.filter((slot) => slot.enabled);

  if (enabledSlots.length === 0) {
    issues.push("At least one fixed slot must be enabled.");
  }

  if (enabledSlots.some((slot) => !slot.label.trim())) {
    issues.push("Enabled fixed slots need a label.");
  }

  if (
    enabledSlots.some((slot) => {
      const start = timeToMinutes(slot.startTime);
      const end = timeToMinutes(slot.endTime);

      return start < 0 || end <= start;
    })
  ) {
    issues.push("Enabled fixed slots need valid start and end times.");
  }

  if (
    experience.durationMinutes > 0 &&
    enabledSlots.some((slot) => {
      const start = timeToMinutes(slot.startTime);
      const end = timeToMinutes(slot.endTime);

      return start >= 0 && end > start && end - start < experience.durationMinutes;
    })
  ) {
    issues.push(
      "Enabled fixed slots must be at least as long as the experience duration.",
    );
  }

  if (hasOverlappingSlots(experience)) {
    issues.push("Enabled fixed slots cannot overlap.");
  }

  return issues;
}

export function getFlexibleAvailabilityIssues(experience: AdminExperience) {
  const issues: string[] = [];
  const start = timeToMinutes(experience.flexibleAvailability.startTime);
  const end = timeToMinutes(experience.flexibleAvailability.endTime);
  const granularity = experience.flexibleAvailability.granularityMinutes;

  if (start < 0 || end <= start) {
    issues.push("Flexible availability needs a valid operating window.");
  }

  if (!Number.isInteger(granularity) || granularity <= 0) {
    issues.push("Flexible availability needs a positive step in minutes.");
  } else if (start >= 0 && end > start && granularity > end - start) {
    issues.push("Flexible step must fit inside the operating window.");
  }

  return issues;
}

export function hasOverlappingSlots(experience: AdminExperience) {
  if (experience.slotPolicyType !== "fixed_slots") {
    return false;
  }

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

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return -1;
  }

  return hour * 60 + minute;
}
