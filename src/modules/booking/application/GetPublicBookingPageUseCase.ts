import {
  addDaysToLocalDate,
  boatCalendarTimeZone,
  localDateTimeToUtcDate,
  localDateToUtcDate,
  minutesToClockTime,
  todayLocalDate,
  utcDateToLocalDateString,
} from "@/modules/boat-calendar/application/CalendarDateTime";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import type { MoneySnapshot } from "@/shared/domain/Money";

import type { BookingClock } from "./ports/BookingClock";
import type {
  PublicBookingCalendarBlockReadModel,
  PublicBookingCatalogExperienceReadModel,
  PublicBookingCatalogMediaReadModel,
  PublicBookingCatalogReader,
} from "./ports/PublicBookingCatalogReader";
import type {
  GetPublicBookingPageQuery,
  PublicBookingExperienceAvailabilityDto,
  PublicBookingPageDto,
  PublicBookingTimeSlotDto,
} from "./PublicBookingDtos";

const defaultDepositAmount = {
  amountMinor: 10_000,
  currency: "EUR",
} satisfies MoneySnapshot;

export class GetPublicBookingPageUseCase {
  constructor(
    private readonly catalog: PublicBookingCatalogReader,
    private readonly clock: BookingClock,
  ) {}

  async execute(
    query: GetPublicBookingPageQuery,
  ): Promise<PublicBookingPageDto> {
    const locale = LocaleCode.create(query.locale).value;
    const now = this.clock.now();
    const today = todayLocalDate(now, boatCalendarTimeZone);
    const startLocalDate = monthStartLocalDate(today);
    const experiences = await this.catalog.listBookableExperiences({ locale });
    const endLocalDate = maxAdvanceEndLocalDate(
      today,
      maximumAdvanceMonthsFromExperiences(experiences),
    );
    const blocks = await this.catalog.listActiveCalendarBlocks({
      from: new Date(
        localDateTimeToUtcDate(
          startLocalDate,
          0,
          boatCalendarTimeZone,
        ).getTime() -
          24 * 60 * 60_000,
      ),
      to: new Date(
        localDateTimeToUtcDate(
          addDaysToLocalDate(endLocalDate, 1),
          0,
          boatCalendarTimeZone,
        ).getTime() +
          24 * 60 * 60_000,
      ),
    });
    const localDates = enumerateLocalDates(startLocalDate, endLocalDate);
    const availabilityByExperienceId: PublicBookingPageDto["availabilityByExperienceId"] =
      {};
    const extrasByExperienceId: PublicBookingPageDto["extrasByExperienceId"] =
      {};

    for (const experience of experiences) {
      availabilityByExperienceId[experience.id] = buildExperienceAvailability({
        blocks,
        experience,
        localDates,
        now,
      });
      extrasByExperienceId[experience.id] = experience.extras
        .filter((extra) => extra.enabled && extra.status === "ACTIVE")
        .map((extra) => ({
          description: extra.description,
          id: extra.id,
          media: mediaToDto(extra.media, extra.name, locale),
          noticeMinutes: extra.noticeMinutes,
          price: extra.priceOverride ?? extra.price,
          title: extra.name,
        }));
    }

    return {
      availabilityByExperienceId,
      defaultDepositAmount:
        experiences[0]?.depositAmount ?? defaultDepositAmount,
      endLocalDate,
      experiences: experiences.map((experience) => ({
        basePrice: experience.basePrice,
        capacity: experience.capacity,
        cancellationPolicySummary:
          experience.cancellationPolicySummary ??
          "Cancellation terms are confirmed before payment.",
        depositAmount: experience.depositAmount,
        description: experience.description,
        durationMinutes: experience.durationMinutes,
        id: experience.id,
        media: mediaToDto(experience.media, experience.title, locale),
        title: experience.title,
      })),
      extrasByExperienceId,
      locale,
      startLocalDate,
    };
  }
}

function buildExperienceAvailability(input: {
  blocks: PublicBookingCalendarBlockReadModel[];
  experience: PublicBookingCatalogExperienceReadModel;
  localDates: string[];
  now: Date;
}): PublicBookingExperienceAvailabilityDto {
  const timeSlotsByDate: Record<string, PublicBookingTimeSlotDto[]> = {};
  const days = input.localDates.map((localDate) => {
    const timeSlots = buildTimeSlotsForDate({
      blocks: input.blocks,
      experience: input.experience,
      localDate,
      now: input.now,
    });

    timeSlotsByDate[localDate] = timeSlots;

    return {
      available: timeSlots.some((slot) => slot.available),
      localDate,
    };
  });

  return {
    days,
    timeSlotsByDate,
  };
}

function buildTimeSlotsForDate(input: {
  blocks: PublicBookingCalendarBlockReadModel[];
  experience: PublicBookingCatalogExperienceReadModel;
  localDate: string;
  now: Date;
}) {
  const candidates = buildSlotCandidates(input.experience);

  return candidates.map((candidate) => {
    const selectedStartAt = localDateTimeToUtcDate(
      input.localDate,
      candidate.startMinutes,
      candidate.timeZone,
    );
    const selectedEndAt = localDateTimeToUtcDate(
      input.localDate,
      candidate.endMinutes,
      candidate.timeZone,
    );
    const protectedStartAt = new Date(
      selectedStartAt.getTime() - input.experience.bufferMinutes * 60_000,
    );
    const protectedEndAt = new Date(
      selectedEndAt.getTime() + input.experience.bufferMinutes * 60_000,
    );
    const withinAdvanceWindow = isInsideAdvanceWindow({
      experience: input.experience,
      localDate: input.localDate,
      now: input.now,
      selectedStartAt,
    });
    const blocked = input.blocks.some((block) =>
      overlaps(
        protectedStartAt,
        protectedEndAt,
        block.protectedStartAt,
        block.protectedEndAt,
      ),
    );
    const available = withinAdvanceWindow && !blocked;

    return {
      available,
      availableExtraIds: available
        ? availableExtraIdsForSlot({
            experience: input.experience,
            now: input.now,
            selectedStartAt,
          })
        : [],
      endMinutes: candidate.endMinutes,
      id: candidate.id,
      label: minutesToClockTime(candidate.startMinutes),
      slotKey: candidate.slotKey,
      startMinutes: candidate.startMinutes,
    };
  });
}

function buildSlotCandidates(
  experience: PublicBookingCatalogExperienceReadModel,
) {
  const policy = experience.slotPolicy;

  if (policy.mode === "FIXED_SLOTS") {
    return policy.fixedSlots
      .filter(
        (slot) =>
          slot.enabled &&
          slot.endMinutes - slot.startMinutes >= experience.durationMinutes,
      )
      .map((slot) => ({
        endMinutes: slot.endMinutes,
        id: slot.id,
        slotKey: slot.id,
        startMinutes: slot.startMinutes,
        timeZone: policy.timeZone,
      }));
  }

  if (policy.mode === "ANY_AVAILABLE") {
    if (!policy.operatingWindow || !policy.granularityMinutes) {
      return [];
    }

    const slots = [];

    for (
      let startMinutes = policy.operatingWindow.startMinutes;
      startMinutes + experience.durationMinutes <=
      policy.operatingWindow.endMinutes;
      startMinutes += policy.granularityMinutes
    ) {
      slots.push({
        endMinutes: startMinutes + experience.durationMinutes,
        id: `flex-${startMinutes}`,
        slotKey: null,
        startMinutes,
        timeZone: policy.timeZone,
      });
    }

    return slots;
  }

  return [];
}

function availableExtraIdsForSlot(input: {
  experience: PublicBookingCatalogExperienceReadModel;
  now: Date;
  selectedStartAt: Date;
}) {
  return input.experience.extras
    .filter((extra) => {
      if (!extra.enabled || extra.status !== "ACTIVE") {
        return false;
      }

      return (
        input.selectedStartAt.getTime() - input.now.getTime() >=
        extra.noticeMinutes * 60_000
      );
    })
    .map((extra) => extra.id);
}

function isInsideAdvanceWindow(input: {
  experience: PublicBookingCatalogExperienceReadModel;
  localDate: string;
  now: Date;
  selectedStartAt: Date;
}) {
  if (
    input.selectedStartAt.getTime() - input.now.getTime() <
    input.experience.minimumAdvanceMinutes * 60_000
  ) {
    return false;
  }

  const today = localDateToUtcDate(
    todayLocalDate(input.now, boatCalendarTimeZone),
  );
  const maxDate = new Date(today);
  maxDate.setUTCMonth(
    maxDate.getUTCMonth() + input.experience.maximumAdvanceMonths,
  );

  return localDateToUtcDate(input.localDate).getTime() <= maxDate.getTime();
}

function mediaToDto(
  media: PublicBookingCatalogMediaReadModel | null,
  fallbackAlt: string,
  locale: "ca" | "en" | "es",
) {
  if (!media) {
    return {
      altText: fallbackAlt,
      status: "MISSING" as const,
      variants: [],
    };
  }

  return {
    altText: media.altText[locale] || fallbackAlt,
    status: media.status,
    variants: media.variants.map((variant) => ({ ...variant })),
  };
}

function monthStartLocalDate(localDate: string) {
  return `${localDate.slice(0, 8)}01`;
}

function maxAdvanceEndLocalDate(today: string, maximumAdvanceMonths: number) {
  const date = localDateToUtcDate(today);
  date.setUTCMonth(date.getUTCMonth() + maximumAdvanceMonths);

  return utcDateToLocalDateString(date);
}

function maximumAdvanceMonthsFromExperiences(
  experiences: PublicBookingCatalogExperienceReadModel[],
) {
  const configuredMaximum = Math.max(
    0,
    ...experiences.map((experience) => experience.maximumAdvanceMonths),
  );

  return configuredMaximum || 6;
}

function enumerateLocalDates(startLocalDate: string, endLocalDate: string) {
  const dates: string[] = [];

  for (
    let localDate = startLocalDate;
    localDate <= endLocalDate;
    localDate = addDaysToLocalDate(localDate, 1)
  ) {
    dates.push(localDate);
  }

  return dates;
}

function overlaps(
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date,
) {
  return leftEnd > rightStart && leftStart < rightEnd;
}
