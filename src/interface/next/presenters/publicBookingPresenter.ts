import type { BookingUiLocale } from "@/i18n/bookingLocales";
import { getBookingPrivacyNotice } from "@/content/privacy/booking";
import { privacyPath } from "@/content/privacy/routes";
import { termsPages, termsPath } from "@/content/booking/termsRoutes";
import { cancellationPolicy } from "@/content/booking/cancellationPolicy";
import type { MarketingImage } from "@/components/marketing/MarketingImageFrame";
import type {
  PublicBookingCalendar,
  PublicBookingCalendarMonth,
  PublicBookingContent,
  PublicBookingExperienceAvailability,
  PublicBookingExtra,
  PublicBookingTimeSlot,
} from "@/components/sections/public-booking/PublicBookingTypes";
import type {
  PublicBookingExperienceAvailabilityDto,
  PublicBookingMediaDto,
  PublicBookingPageDto,
} from "@/modules/booking/application/PublicBookingDtos";
import { createLocalizedPath } from "@/i18n/locales";
import { getPublicDictionary } from "@/i18n/public";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";
import type { MoneySnapshot } from "@/shared/domain/Money";

const weekdaysByLocale = {
  fr: ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  nl: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
  ca: ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  es: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
} satisfies Record<BookingUiLocale, readonly string[]>;

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
  options: { includeAvailability?: boolean } = {},
): Promise<PublicBookingContent> {
  if (
    process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1" &&
    process.env.JIMBOATS_LOCAL_BOOKINGS !== "1"
  ) {
    const { getPublicBookingMockPage } =
      await import("./publicBookingMockPresenter");

    return getPublicBookingMockPage(locale);
  }

  const { getContainer } = await import("@/container");
  const page = await getContainer().publicBooking.getPage({
    includeAvailability: options.includeAvailability,
    locale,
  });

  return presentPublicBookingPage(page, locale);
}

export async function getPublicBookingAvailability(input: {
  experienceId: string;
  locale: SupportedLocaleCode;
}): Promise<PublicBookingExperienceAvailability | null> {
  if (
    process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1" &&
    process.env.JIMBOATS_LOCAL_BOOKINGS !== "1"
  ) {
    const { getPublicBookingMockPage } =
      await import("./publicBookingMockPresenter");
    const mockPage = getPublicBookingMockPage(input.locale);

    return mockPage.availabilityByExperienceId[input.experienceId] ?? null;
  }

  const { getContainer } = await import("@/container");
  const availability =
    await getContainer().publicBooking.getAvailability(input);

  return availability
    ? presentPublicBookingAvailability(availability, input.locale)
    : null;
}

function presentPublicBookingPage(
  page: PublicBookingPageDto,
  locale: SupportedLocaleCode,
) {
  const dictionary = getPublicDictionary(locale);
  const experiences = page.experiences.map((experience, index) => ({
    hourlyRates: experience.hourlyRates?.map((rate) => ({
      hours: rate.hours,
      price: fromMoney(rate.total),
      depositAmount: fromMoney(rate.deposit),
    })),
    badge: index === 0 ? mostPopularLabel(locale) : undefined,
    capacity: experience.capacity,
    cancellationPolicySummary: cancellationPolicy.copy[locale].summary,
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
      extras.map((extra) => presentExtra(extra, locale)),
    ]),
  );
  const availabilityByExperienceId = Object.fromEntries(
    Object.entries(page.availabilityByExperienceId).map(
      ([experienceId, availability]) => [
        experienceId,
        presentPublicBookingAvailability(availability, locale),
      ],
    ),
  );
  const firstAvailability =
    availabilityByExperienceId[experiences[0]?.id ?? ""] ??
    presentPublicBookingAvailability(
      {
        days: [],
        timeSlotsByDate: {},
      },
      locale,
    );
  const firstExtras =
    extrasByExperienceId[experiences[0]?.id ?? ""] ??
    ([] satisfies PublicBookingExtra[]);

  return {
    availabilityByExperienceId,
    bookHref: createLocalizedPath(locale, "/book"),
    brand: "JimBoats",
    calendar: firstAvailability.calendar,
    confirmation: dictionary.booking.confirmation,
    currencySymbol: "€",
    depositAmount: fromMoney(page.defaultDepositAmount),
    experiences,
    extras: firstExtras,
    extrasByExperienceId,
    footerLinks: [
      {
        href: createLocalizedPath(locale),
        label: dictionary.common.backToJimBoats,
      },
      { href: privacyPath(locale), label: dictionary.common.privacyPolicy },
      { href: termsPath(locale), label: termsPages[locale === "ca" ? "es" : locale].label },
    ],
    homeHref: createLocalizedPath(locale),
    privacy: getBookingPrivacyNotice(locale),
    locale,
    maxAdvanceLabel: dictionary.booking.maxAdvanceLabel,
    payment: dictionary.booking.payment,
    policies: {
      cancellation: cancellationPolicy.copy[locale].summary,
      meetingPoint: dictionary.booking.policies.meetingPoint,
      remainingPayment: dictionary.booking.policies.remainingPayment,
    },
    steps: [
      { id: "experience", label: dictionary.booking.steps.experience },
      { id: "extras", label: dictionary.booking.steps.extras },
      { id: "payment", label: dictionary.booking.steps.payment },
      { id: "confirmation", label: dictionary.booking.steps.confirmation },
    ],
    support: {
      email: "info@jimboatscharter.com",
      phone: "+34 600 000 000",
    },
    timeSlots: Object.values(firstAvailability.timeSlotsByDate)[0] ?? [],
  } satisfies PublicBookingContent;
}

export function presentPublicBookingAvailability(
  availability: PublicBookingExperienceAvailabilityDto,
  locale: BookingUiLocale,
) {
  const dictionary = getPublicDictionary(locale);
  const months = presentCalendarMonths(availability.days, locale);
  const firstMonth = months[0];
  const calendar = {
    days: firstMonth?.days ?? [],
    monthLabel:
      firstMonth?.monthLabel ??
      dictionary.booking.experienceStep.availableDates,
    months,
    nextMonthLabel: dictionary.booking.experienceStep.nextMonth,
    previousMonthLabel: dictionary.booking.experienceStep.previousMonth,
    selectAvailableDateLabel:
      dictionary.booking.experienceStep.selectAvailableDate,
    weekdays: weekdaysByLocale[locale],
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
  locale: BookingUiLocale,
): PublicBookingCalendarMonth[] {
  const monthsById = new Map<string, PublicBookingCalendarMonth>();
  const formatters = {
    ariaLabel: new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeZone: "UTC",
    }),
    dateLabel: new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
    dayLabel: new Intl.DateTimeFormat(locale, {
      day: "numeric",
      timeZone: "UTC",
    }),
  };

  for (const day of days) {
    const monthId = day.localDate.slice(0, 7);
    const existingMonth = monthsById.get(monthId);
    const presentedDay = presentCalendarDay(
      day.localDate,
      day.available,
      formatters,
    );

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
      monthLabel: monthLabelFromMonthId(monthId, locale),
    });
  }

  return [...monthsById.values()];
}

function presentExtra(
  extra: PublicBookingPageDto["extrasByExperienceId"][string][number],
  locale: SupportedLocaleCode,
): PublicBookingExtra {
  return {
    description: extra.description,
    id: extra.id,
    image: mediaToImage(extra.media, () =>
      fallbackExtraImage(extra.id, extra.title),
    ),
    notice:
      extra.noticeMinutes > 0
        ? formatNotice(extra.noticeMinutes, locale)
        : undefined,
    price: fromMoney(extra.price),
    title: extra.title,
  };
}

function presentCalendarDay(
  localDate: string,
  available: boolean,
  formatters: Record<
    "ariaLabel" | "dateLabel" | "dayLabel",
    Intl.DateTimeFormat
  >,
) {
  const date = new Date(`${localDate}T00:00:00.000Z`);

  return {
    ariaLabel: formatters.ariaLabel.format(date),
    dateLabel: formatters.dateLabel.format(date),
    dayLabel: formatters.dayLabel.format(date),
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
    label: `${minutesToClockTime(slot.startMinutes)} → ${minutesToClockTime(slot.endMinutes)}`,
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

function formatNotice(noticeMinutes: number, locale: SupportedLocaleCode) {
  const labels = {
    ca: { hour: "Necessita", minute: "Necessita" },
    en: { hour: "Needs", minute: "Needs" },
    es: { hour: "Requiere", minute: "Requiere" },
  } satisfies Record<SupportedLocaleCode, { hour: string; minute: string }>;

  if (noticeMinutes % 60 === 0) {
    return `${labels[locale].hour} ${noticeMinutes / 60}h`;
  }

  return `${labels[locale].minute} ${noticeMinutes}m`;
}

function minutesToClockTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function monthLabelFromMonthId(monthId: string, locale: BookingUiLocale) {
  const [year, month] = monthId.split("-");
  const date = new Date(`${year}-${month}-01T00:00:00.000Z`);

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function mostPopularLabel(locale: SupportedLocaleCode) {
  return {
    ca: "Més popular",
    en: "Most popular",
    es: "Más popular",
  }[locale];
}
