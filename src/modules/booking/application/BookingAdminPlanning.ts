import { ApplicationError } from "@/shared/application/ApplicationError";
import { Money } from "@/shared/domain/Money";

import type {
  BookingCalendarBlockUpdateModel,
  BookingCalendarBlockWriteModel,
  BookingExperienceOptionReadModel,
  BookingExtraOptionReadModel,
  BookingExtraSelectionRuleReadModel,
} from "./ports/BookingRepository";
import { PriceSnapshot } from "../domain/PriceSnapshot";
import type { BookingExtraPriceLineProps } from "../domain/PriceSnapshot";
import { SelectedSlot } from "../domain/SelectedSlot";

const boatTimeZone = "Europe/Madrid";

export type SelectedBookingExtraCommand = {
  extraId: string;
  quantity: number;
};

export type BackpanelBookingPlanningCommand = {
  endTime: string;
  guestCount: number;
  localDate: string;
  selectedExtras: SelectedBookingExtraCommand[];
  slotKey: string | null;
  startTime: string;
};

export type BackpanelBookingPlan = {
  protectedEndAt: Date;
  protectedStartAt: Date;
  priceSnapshot: PriceSnapshot;
  selectedEndAt: Date;
  selectedExtras: Array<{ extraId: string; quantity: number }>;
  selectedSlot: SelectedSlot;
  selectedStartAt: Date;
};

export function collectSelectedExtraIds(command: BackpanelBookingPlanningCommand) {
  return normalizeSelectedExtras(command.selectedExtras).map(
    (selected) => selected.extraId,
  );
}

export function planBackpanelBooking(input: {
  command: BackpanelBookingPlanningCommand;
  experience: BookingExperienceOptionReadModel;
  extraOptions: BookingExtraOptionReadModel[];
  now: Date;
}): BackpanelBookingPlan {
  const selectedSlot = buildSelectedSlot(input.command, input.experience);
  const selectedStartAt = localDateTimeToUtcDate(
    selectedSlot.localDate,
    selectedSlot.startMinutes,
    selectedSlot.timeZone,
  );
  const selectedEndAt = localDateTimeToUtcDate(
    selectedSlot.localDate,
    selectedSlot.endMinutes,
    selectedSlot.timeZone,
  );

  assertAdvanceWindow({
    experience: input.experience,
    now: input.now,
    selectedLocalDate: selectedSlot.localDate,
    selectedStartAt,
  });

  const selectedExtras = normalizeSelectedExtras(input.command.selectedExtras);
  const { capacityReduction, lines } = buildExtraPriceLines({
    experience: input.experience,
    extraOptions: input.extraOptions,
    now: input.now,
    selectedExtras,
    selectedStartAt,
  });
  const effectiveCapacity = Math.max(
    input.experience.capacity - capacityReduction,
    0,
  );

  if (input.command.guestCount > effectiveCapacity) {
    throw new ApplicationError(
      "BOOKING_GUEST_CAPACITY_EXCEEDED",
      "Guest count exceeds the effective capacity for this booking.",
    );
  }

  const protectedStartAt = new Date(
    selectedStartAt.getTime() - input.experience.bufferMinutes * 60_000,
  );
  const protectedEndAt = new Date(
    selectedEndAt.getTime() + input.experience.bufferMinutes * 60_000,
  );

  return {
    protectedEndAt,
    protectedStartAt,
    priceSnapshot: buildPriceSnapshot({
      experience: input.experience,
      lines,
      now: input.now,
    }),
    selectedEndAt,
    selectedExtras,
    selectedSlot,
    selectedStartAt,
  };
}

export function createBookingCalendarBlockWriteModel(input: {
  bookingId: string;
  blockId: string;
  createdAt: Date;
  createdByUserId: string;
  experienceId: string;
  plan: BackpanelBookingPlan;
  reference: string;
}): BookingCalendarBlockWriteModel {
  return {
    bookingId: input.bookingId,
    createdAt: input.createdAt,
    createdByUserId: input.createdByUserId,
    experienceId: input.experienceId,
    expiresAt: null,
    id: input.blockId,
    localDate: input.plan.selectedSlot.localDate,
    protectedEndAt: input.plan.protectedEndAt,
    protectedStartAt: input.plan.protectedStartAt,
    reason: `Booking ${input.reference}`,
    source: "BOOKING_CONFIRMED",
    status: "ACTIVE",
    timeZone: input.plan.selectedSlot.timeZone,
    updatedAt: input.createdAt,
    visibleEndMinutes: input.plan.selectedSlot.endMinutes,
    visibleStartMinutes: input.plan.selectedSlot.startMinutes,
  };
}

export function createBookingCalendarBlockUpdateModel(input: {
  bookingId: string;
  blockId: string;
  experienceId: string;
  plan: BackpanelBookingPlan;
  reference: string;
  updatedAt: Date;
}): BookingCalendarBlockUpdateModel {
  return {
    bookingId: input.bookingId,
    experienceId: input.experienceId,
    expiresAt: null,
    id: input.blockId,
    localDate: input.plan.selectedSlot.localDate,
    protectedEndAt: input.plan.protectedEndAt,
    protectedStartAt: input.plan.protectedStartAt,
    reason: `Booking ${input.reference}`,
    source: "BOOKING_CONFIRMED",
    status: "ACTIVE",
    timeZone: input.plan.selectedSlot.timeZone,
    updatedAt: input.updatedAt,
    visibleEndMinutes: input.plan.selectedSlot.endMinutes,
    visibleStartMinutes: input.plan.selectedSlot.startMinutes,
  };
}

function buildSelectedSlot(
  command: BackpanelBookingPlanningCommand,
  experience: BookingExperienceOptionReadModel,
) {
  const startMinutes = parseClockTime(command.startTime);
  const endMinutes = parseClockTime(command.endTime);

  if (endMinutes - startMinutes !== experience.durationMinutes) {
    throw new ApplicationError(
      "BOOKING_SELECTED_SLOT_OUTSIDE_POLICY",
      "Selected slot duration must match the experience duration.",
    );
  }

  const slotKey = resolveSlotKey({
    endMinutes,
    experience,
    requestedSlotKey: command.slotKey,
    startMinutes,
  });

  return SelectedSlot.create({
    endMinutes,
    localDate: command.localDate,
    slotKey,
    startMinutes,
    timeZone: boatTimeZone,
  });
}

function resolveSlotKey(input: {
  endMinutes: number;
  experience: BookingExperienceOptionReadModel;
  requestedSlotKey: string | null;
  startMinutes: number;
}) {
  const { experience, requestedSlotKey, startMinutes, endMinutes } = input;

  if (experience.slotPolicy.mode === "MANUAL_APPROVAL") {
    if (!experience.allowsManualScheduling) {
      throw new ApplicationError(
        "BOOKING_SELECTED_SLOT_OUTSIDE_POLICY",
        "This experience does not allow manual scheduling.",
      );
    }

    return requestedSlotKey?.trim() || null;
  }

  if (experience.slotPolicy.mode === "FIXED_SLOTS") {
    const matchingSlot = experience.slotPolicy.fixedSlots.find((slot) => {
      if (!slot.enabled) {
        return false;
      }

      if (requestedSlotKey?.trim()) {
        return (
          slot.id === requestedSlotKey.trim() &&
          slot.startMinutes === startMinutes &&
          slot.endMinutes === endMinutes
        );
      }

      return slot.startMinutes === startMinutes && slot.endMinutes === endMinutes;
    });

    if (!matchingSlot) {
      throw new ApplicationError(
        "BOOKING_SELECTED_SLOT_OUTSIDE_POLICY",
        "Selected time does not match an enabled fixed slot.",
      );
    }

    return matchingSlot.id;
  }

  const window = experience.slotPolicy.operatingWindow;
  const granularity = experience.slotPolicy.granularityMinutes;

  if (
    !window ||
    !granularity ||
    startMinutes < window.startMinutes ||
    endMinutes > window.endMinutes ||
    (startMinutes - window.startMinutes) % granularity !== 0
  ) {
    throw new ApplicationError(
      "BOOKING_SELECTED_SLOT_OUTSIDE_POLICY",
      "Selected time is outside the flexible booking policy.",
    );
  }

  return requestedSlotKey?.trim() || null;
}

function assertAdvanceWindow(input: {
  experience: BookingExperienceOptionReadModel;
  now: Date;
  selectedLocalDate: string;
  selectedStartAt: Date;
}) {
  const noticeMs = input.experience.minimumAdvanceMinutes * 60_000;

  if (input.selectedStartAt.getTime() - input.now.getTime() < noticeMs) {
    throw new ApplicationError(
      "BOOKING_MINIMUM_NOTICE_NOT_MET",
      "Selected slot does not meet the experience minimum notice.",
    );
  }

  const today = localDateToUtcDate(todayLocalDate(input.now, boatTimeZone));
  const maxDate = new Date(today);
  maxDate.setUTCMonth(maxDate.getUTCMonth() + input.experience.maximumAdvanceMonths);

  if (localDateToUtcDate(input.selectedLocalDate).getTime() > maxDate.getTime()) {
    throw new ApplicationError(
      "BOOKING_DATE_TOO_FAR_IN_FUTURE",
      "Selected date is outside the maximum booking window.",
    );
  }
}

function normalizeSelectedExtras(
  selectedExtras: SelectedBookingExtraCommand[],
) {
  const quantitiesByExtraId = new Map<string, number>();

  for (const selectedExtra of selectedExtras) {
    const extraId = selectedExtra.extraId.trim();

    if (!extraId || !Number.isInteger(selectedExtra.quantity)) {
      throw new ApplicationError(
        "BOOKING_EXTRA_QUANTITY_NOT_ALLOWED",
        "Selected extra quantity is invalid.",
      );
    }

    if (selectedExtra.quantity <= 0) {
      continue;
    }

    quantitiesByExtraId.set(
      extraId,
      (quantitiesByExtraId.get(extraId) ?? 0) + selectedExtra.quantity,
    );
  }

  return [...quantitiesByExtraId.entries()].map(([extraId, quantity]) => ({
    extraId,
    quantity,
  }));
}

function buildExtraPriceLines(input: {
  experience: BookingExperienceOptionReadModel;
  extraOptions: BookingExtraOptionReadModel[];
  now: Date;
  selectedExtras: Array<{ extraId: string; quantity: number }>;
  selectedStartAt: Date;
}) {
  let capacityReduction = 0;
  const lines: BookingExtraPriceLineProps[] = [];

  for (const selectedExtra of input.selectedExtras) {
    const rule = input.experience.extraSelectionRules.find((candidate) => {
      return candidate.extraId === selectedExtra.extraId && candidate.enabled;
    });
    const extra = input.extraOptions.find((candidate) => {
      return candidate.id === selectedExtra.extraId;
    });

    if (!rule || !extra || extra.status !== "ACTIVE") {
      throw new ApplicationError(
        "BOOKING_EXTRA_NOT_COMPATIBLE",
        "Selected extra is not available for this experience.",
      );
    }

    assertExtraQuantity(selectedExtra.quantity, rule);
    assertExtraNotice({
      now: input.now,
      rule,
      selectedStartAt: input.selectedStartAt,
    });

    const unitPrice = Money.create(rule.priceOverride ?? extra.price);
    const totalPrice = Money.create({
      amountMinor: unitPrice.amountMinor * selectedExtra.quantity,
      currency: unitPrice.currency,
    });

    capacityReduction += rule.capacityReduction * selectedExtra.quantity;
    lines.push({
      extraId: extra.id,
      nameSnapshot: extra.name,
      quantity: selectedExtra.quantity,
      totalPrice,
      unitPrice,
    });
  }

  return { capacityReduction, lines };
}

function assertExtraQuantity(
  quantity: number,
  rule: BookingExtraSelectionRuleReadModel,
) {
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > rule.limitPerBooking) {
    throw new ApplicationError(
      "BOOKING_EXTRA_QUANTITY_NOT_ALLOWED",
      "Selected extra quantity is not allowed for this experience.",
    );
  }
}

function assertExtraNotice(input: {
  now: Date;
  rule: BookingExtraSelectionRuleReadModel;
  selectedStartAt: Date;
}) {
  if (
    input.selectedStartAt.getTime() - input.now.getTime() <
    input.rule.noticeMinutes * 60_000
  ) {
    throw new ApplicationError(
      "BOOKING_EXTRA_MINIMUM_NOTICE_NOT_MET",
      "Selected extra requires more notice before departure.",
    );
  }
}

function buildPriceSnapshot(input: {
  experience: BookingExperienceOptionReadModel;
  lines: BookingExtraPriceLineProps[];
  now: Date;
}) {
  const basePrice = Money.create(input.experience.basePrice);
  const depositAmount = Money.create(input.experience.depositAmount);
  const extraTotal = input.lines.reduce(
    (total, line) => total + line.totalPrice.amountMinor,
    0,
  );
  const totalAmount = Money.create({
    amountMinor: basePrice.amountMinor + extraTotal,
    currency: basePrice.currency,
  });
  const remainingAmount = Money.create({
    amountMinor: totalAmount.amountMinor - depositAmount.amountMinor,
    currency: totalAmount.currency,
  });

  return PriceSnapshot.create({
    basePrice,
    capturedAt: input.now,
    depositAmount,
    extraLines: input.lines,
    remainingAmount,
    totalAmount,
  });
}

function parseClockTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());

  if (!match) {
    throw new ApplicationError(
      "BOOKING_SELECTED_SLOT_OUTSIDE_POLICY",
      "Selected time must use HH:mm.",
    );
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function localDateToUtcDate(localDate: string) {
  return new Date(`${localDate}T00:00:00.000Z`);
}

function todayLocalDate(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(now);
}

function localDateTimeToUtcDate(
  localDate: string,
  minutes: number,
  timeZone: string,
) {
  const [year, month, day] = localDate.split("-").map(Number);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const firstOffset = getTimeZoneOffsetMs(utcGuess, timeZone);
  let utcDate = new Date(utcGuess.getTime() - firstOffset);
  const correctedOffset = getTimeZoneOffsetMs(utcDate, timeZone);

  if (correctedOffset !== firstOffset) {
    utcDate = new Date(utcGuess.getTime() - correctedOffset);
  }

  return utcDate;
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return asUtc - date.getTime();
}
