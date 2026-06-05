import type { MarketingImage } from "@/components/marketing/MarketingImageFrame";
import type {
  PublicBookingCalendar,
  PublicBookingCalendarMonth,
  PublicBookingContent,
  PublicBookingExtra,
  PublicBookingTimeSlot,
} from "@/components/sections/public-booking/PublicBookingTypes";
import type {
  PublicBookingExperienceAvailabilityDto,
  PublicBookingMediaDto,
  PublicBookingPageDto,
} from "@/modules/booking/application/PublicBookingDtos";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";
import type { MoneySnapshot } from "@/shared/domain/Money";

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

const generatedImagePath = (slug: string, width: number) =>
  `/images/generated/landing/${slug}-${width}.webp`;

const generatedImage = ({
  alt,
  sizes,
  slug,
  widths,
}: {
  alt: string;
  sizes: string;
  slug: string;
  widths: number[];
}): MarketingImage => ({
  alt,
  height: 1024,
  sizes,
  src: generatedImagePath(slug, widths.at(-1) ?? widths[0]),
  srcSet: widths
    .map((width) => `${generatedImagePath(slug, width)} ${width}w`)
    .join(", "),
  width: 1024,
});

const fallbackExperienceImage = (experienceId: string, alt: string) => {
  const fallbackSlugByExperienceId = new Map([
    ["sunset-private-cruise", "experience-sunset-toast"],
    ["morning-breeze-charter", "experience-morning-breeze"],
    ["party-on-board", "experience-party-board"],
    ["romantic-proposal", "experience-romantic-proposal"],
  ]);

  return generatedImage({
    alt,
    sizes: "(min-width: 1024px) 36vw, 34vw",
    slug:
      fallbackSlugByExperienceId.get(experienceId) ?? "gallery-barcelona-coast",
    widths: [480, 720, 960, 1024],
  });
};

const fallbackExtraImage = (extraId: string, alt: string) => {
  const fallbackSlugByExtraId = new Map([
    ["browser-test-champagne", "upgrade-sunset-toast"],
    ["gourmet-snacks", "upgrade-mediterranean-flavors"],
    ["mediterranean-drinks", "upgrade-mediterranean-flavors"],
    ["paddle-surf", "upgrade-paddle-surf"],
    ["private-photographer", "gallery-couple-sunset"],
    ["romantic-setup", "upgrade-sunset-toast"],
    ["sunset-toast", "upgrade-sunset-toast"],
  ]);

  return generatedImage({
    alt,
    sizes: "(min-width: 1024px) 30vw, 42vw",
    slug: fallbackSlugByExtraId.get(extraId) ?? "upgrade-sunset-toast",
    widths: [320, 480, 720, 1024],
  });
};

export async function getPublicBookingPage(
  locale: SupportedLocaleCode = "en",
): Promise<PublicBookingContent> {
  const { getContainer } = await import("@/container");
  const page = await getContainer().publicBooking.getPage({ locale });

  return presentPublicBookingPage(page);
}

function presentPublicBookingPage(page: PublicBookingPageDto) {
  const experiences = page.experiences.map((experience, index) => ({
    badge: index === 0 ? "Most popular" : undefined,
    capacity: experience.capacity,
    cancellationPolicySummary:
      experience.cancellationPolicySummary ||
      "Cancellation terms are confirmed before payment.",
    depositAmount: fromMoney(experience.depositAmount),
    description: experience.description,
    durationLabel: formatDuration(experience.durationMinutes),
    id: experience.id,
    image: mediaToImage(experience.media, () =>
      fallbackExperienceImage(experience.id, experience.title),
    ),
    price: fromMoney(experience.basePrice),
    title: experience.title,
  }));
  const extrasByExperienceId = Object.fromEntries(
    Object.entries(page.extrasByExperienceId).map(([experienceId, extras]) => [
      experienceId,
      extras.map((extra) => presentExtra(extra)),
    ]),
  );
  const availabilityByExperienceId = Object.fromEntries(
    Object.entries(page.availabilityByExperienceId).map(
      ([experienceId, availability]) => [
        experienceId,
        presentAvailability(availability),
      ],
    ),
  );
  const firstAvailability =
    availabilityByExperienceId[experiences[0]?.id ?? ""] ??
    presentAvailability({
      days: [],
      timeSlotsByDate: {},
    });
  const firstExtras =
    extrasByExperienceId[experiences[0]?.id ?? ""] ??
    ([] satisfies PublicBookingExtra[]);

  return {
    availabilityByExperienceId,
    brand: "JimBoats",
    calendar: firstAvailability.calendar,
    confirmation: {
      bookingReference: "JB-MOCK-2026",
      subtitle:
        "Your booking pass mock is ready. In production this page will show the real booking token and payment receipt.",
      title: "Booking confirmed",
    },
    currencySymbol: "€",
    depositAmount: fromMoney(page.defaultDepositAmount),
    experiences,
    extras: firstExtras,
    extrasByExperienceId,
    footerLinks: [
      { href: "/en", label: "Back to JimBoats" },
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Terms of Service" },
    ],
    homeHref: "/en",
    maxAdvanceLabel: "Bookings are available up to 6 months ahead.",
    payment: {
      depositCopy:
        "Pay a fixed €100 deposit now. The remaining balance is paid onboard in cash.",
      secureCopy:
        "Your deposit is processed securely by Stripe without leaving this page.",
      subtitle: "You're one step away from your day at sea.",
      title: "Confirm your booking",
    },
    policies: {
      cancellation:
        page.experiences[0]?.cancellationPolicySummary ||
        "Cancellation terms are confirmed before payment.",
      meetingPoint: "Port Olimpic, Barcelona",
      remainingPayment: "Remaining balance paid onboard in cash.",
    },
    steps: [
      { id: "experience", label: "Experience" },
      { id: "extras", label: "Extras" },
      { id: "payment", label: "Payment" },
      { id: "confirmation", label: "Done" },
    ],
    support: {
      email: "info@jimboatscharter.com",
      phone: "+34 600 000 000",
    },
    timeSlots: Object.values(firstAvailability.timeSlotsByDate)[0] ?? [],
  } satisfies PublicBookingContent;
}

function presentAvailability(
  availability: PublicBookingExperienceAvailabilityDto,
) {
  const months = presentCalendarMonths(availability.days);
  const firstMonth = months[0];
  const calendar = {
    days: firstMonth?.days ?? [],
    monthLabel: firstMonth?.monthLabel ?? "Available dates",
    months,
    weekdays,
  } satisfies PublicBookingCalendar;
  const timeSlotsByDate = Object.fromEntries(
    Object.entries(availability.timeSlotsByDate).map(([localDate, slots]) => [
      localDate,
      slots.map((slot) => presentTimeSlot(slot)),
    ]),
  );

  return {
    calendar,
    timeSlotsByDate,
  };
}

function presentCalendarMonths(
  days: PublicBookingExperienceAvailabilityDto["days"],
): PublicBookingCalendarMonth[] {
  const monthsById = new Map<string, PublicBookingCalendarMonth>();

  for (const day of days) {
    const monthId = day.localDate.slice(0, 7);
    const existingMonth = monthsById.get(monthId);
    const presentedDay = presentCalendarDay(day.localDate, day.available);

    if (existingMonth) {
      monthsById.set(monthId, {
        ...existingMonth,
        days: [...existingMonth.days, presentedDay],
      });
      continue;
    }

    monthsById.set(monthId, {
      days: [presentedDay],
      id: monthId,
      monthLabel: monthLabelFromMonthId(monthId),
    });
  }

  return [...monthsById.values()];
}

function presentExtra(
  extra: PublicBookingPageDto["extrasByExperienceId"][string][number],
): PublicBookingExtra {
  return {
    description: extra.description,
    id: extra.id,
    image: mediaToImage(extra.media, () =>
      fallbackExtraImage(extra.id, extra.title),
    ),
    notice:
      extra.noticeMinutes > 0 ? formatNotice(extra.noticeMinutes) : undefined,
    price: fromMoney(extra.price),
    title: extra.title,
  };
}

function presentCalendarDay(localDate: string, available: boolean) {
  const date = new Date(`${localDate}T00:00:00.000Z`);

  return {
    ariaLabel: new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeZone: "UTC",
    }).format(date),
    dateLabel: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date),
    dayLabel: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      timeZone: "UTC",
    }).format(date),
    disabled: !available,
    id: localDate,
  };
}

function presentTimeSlot(
  slot: PublicBookingPageDto["availabilityByExperienceId"][string]["timeSlotsByDate"][string][number],
): PublicBookingTimeSlot {
  return {
    available: slot.available,
    availableExtraIds: slot.availableExtraIds,
    endTime: minutesToClockTime(slot.endMinutes),
    id: slot.id,
    label: slot.label,
    slotKey: slot.slotKey,
    startTime: minutesToClockTime(slot.startMinutes),
  };
}

function mediaToImage(
  media: PublicBookingMediaDto,
  fallback: () => MarketingImage,
): MarketingImage {
  if (media.status !== "READY" || media.variants.length === 0) {
    return fallback();
  }

  const variants = media.variants
    .slice()
    .sort((left, right) => left.width - right.width);
  const largestVariant = variants.at(-1) ?? variants[0];

  return {
    alt: media.altText,
    height: largestVariant.height,
    sizes: "(min-width: 1024px) 36vw, 86vw",
    src: largestVariant.publicPath,
    srcSet: variants
      .map((variant) => `${variant.publicPath} ${variant.width}w`)
      .join(", "),
    width: largestVariant.width,
  };
}

function fromMoney(money: MoneySnapshot) {
  return money.amountMinor / 100;
}

function formatDuration(durationMinutes: number) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

function formatNotice(noticeMinutes: number) {
  if (noticeMinutes % 60 === 0) {
    return `Needs ${noticeMinutes / 60}h notice`;
  }

  return `Needs ${noticeMinutes}m notice`;
}

function minutesToClockTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function monthLabelFromMonthId(monthId: string) {
  const [year, month] = monthId.split("-");
  const date = new Date(`${year}-${month}-01T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}
