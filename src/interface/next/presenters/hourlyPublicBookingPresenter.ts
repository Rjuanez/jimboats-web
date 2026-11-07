import { experiences } from "@/content/marketing/catalog";
import { getBookingPrivacyNotice } from "@/content/privacy/booking";
import { privacyPath } from "@/content/privacy/routes";
import { termsPages, termsPath } from "@/content/booking/termsRoutes";
import { experienceKeys } from "@/content/marketing/routes";
import { getMarketingPage, marketingImage } from "@/content/marketing";
import {
  marketingLocales,
  marketingPath,
  type MarketingLocale,
} from "@/content/marketing/routes";
import {
  hourlyPrices,
  hourlyDurationOptions,
} from "@/content/booking/hourlyPrices";
import { hourlyLabels, localBookingLabels } from "@/content/booking/labels";
import { bookingTransactionLocale } from "@/i18n/bookingLocales";
import { getPublicDictionary } from "@/i18n/public";
import type { PublicBookingContent } from "@/components/sections/public-booking/PublicBookingTypes";
import {
  getPublicBookingPage,
  presentPublicBookingAvailability,
} from "./publicBookingPresenter";

export const hourlyVisualPreview = () =>
  process.env.JIMBOATS_SEO_PREVIEW === "1" &&
  process.env.JIMBOATS_LOCAL_BOOKINGS !== "1";

export async function getHourlyPublicBookingPage(
  locale: MarketingLocale,
  experienceId: string,
  requestedHours: number,
): Promise<PublicBookingContent | null> {
  const key = experienceKeys.find(key => experiences[key].bookingId === experienceId);
  if (!key) return null;
  const page = getMarketingPage(locale, key);
  const experience = page.experiences.find(
    (item) => item.bookingId === experienceId,
  );
  if (!experience) return null;
  const demo = hourlyVisualPreview();
  const base = demo
    ? (await import("./publicBookingMockPresenter")).getPublicBookingMockPage(
        bookingTransactionLocale(locale),
      )
    : await getPublicBookingPage(bookingTransactionLocale(locale), {
        includeAvailability: false,
      });
  const liveExperience = base.experiences.find(
    (item) => item.id === experienceId,
  );
  const rates = demo
    ? hourlyDurationOptions[experienceId].map((hours) => ({
        hours,
        price: hourlyPrices[experienceId][hours],
        depositAmount: 50,
      }))
    : (liveExperience?.hourlyRates ?? []);
  const rate = rates.find((item) => item.hours === requestedHours) ?? rates[0];
  if (!rate) return null;
  const copy = getPublicDictionary(locale);
  const extras = demo
    ? [
        {
          id: "paddle-surf",
          title: page.premium.extraNames[1],
          description: page.premium.extraDescriptions[1],
          price: 20,
          image: marketingImage(
            "production-paddle",
            page.premium.extraNames[1],
          ),
        },
      ]
    : (base.extrasByExperienceId[experienceId] ?? []);
  const bookingTitle = {
    es: "Elige duración y fecha",
    en: "Choose your duration and date",
    fr: "Choisissez la durée et la date",
    de: "Dauer und Datum wählen",
    nl: "Kies je duur en datum",
  }[locale];
  return {
    ...base,
    locale,
    privacy: getBookingPrivacyNotice(locale),
    homeHref: `/${locale}`,
    returnHref: experience.href,
    // Transactional return pages currently support ES, EN and CA.
    bookHref: `/${bookingTransactionLocale(locale)}/book`,
    previewNotice: demo
      ? hourlyLabels[locale].demo
      : process.env.JIMBOATS_LOCAL_BOOKINGS === "1"
        ? localBookingLabels[locale]
        : undefined,
    languageLinks: marketingLocales.map((language) => ({
      locale: language,
      label: language.toUpperCase(),
      href: `/${language}/book?experience=${experienceId}&hours=${rate.hours}`,
    })),
    availabilityByExperienceId: {},
    calendar: presentPublicBookingAvailability(
      { days: [], timeSlotsByDate: {} },
      locale,
    ).calendar,
    timeSlots: [],
    experiences: [
      {
        id: experienceId,
        title: experience.title,
        description: experience.description,
        image: marketingImage(experience.imageSlug, experience.title),
        capacity: liveExperience?.capacity ?? 6,
        price: rate.price,
        depositAmount: rate.depositAmount,
        durationLabel: `${rate.hours} h`,
        cancellationPolicySummary: page.cancellationPolicy.summary,
        hourlyRates: rates,
      },
    ],
    extras,
    extrasByExperienceId: { [experienceId]: extras },
    depositAmount: rate.depositAmount,
    hourly: {
      hours: rate.hours,
      rates,
      title: bookingTitle,
      durationLabel: page.detailCopy.duration,
    },
    maxAdvanceLabel: copy.booking.maxAdvanceLabel,
    payment: {
      ...copy.booking.payment,
      depositCopy: copy.booking.labels.depositDueNow(
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "EUR",
        }).format(rate.depositAmount),
      ),
    },
    confirmation: { ...copy.booking.confirmation, bookingReference: "" },
    policies: {
      ...copy.booking.policies,
      cancellation: page.cancellationPolicy.summary,
    },
    steps: [
      {
        id: "experience",
        label: {
          es: "Fecha y duración",
          en: "Date & duration",
          fr: "Date et durée",
          de: "Datum & Dauer",
          nl: "Datum & duur",
        }[locale],
      },
      { id: "extras", label: copy.booking.steps.extras },
      { id: "payment", label: copy.booking.steps.payment },
      { id: "confirmation", label: copy.booking.steps.confirmation },
    ],
    footerLinks: [
      { href: experience.href, label: copy.common.backToJimBoats },
      { href: privacyPath(locale), label: copy.common.privacyPolicy },
      { href: termsPath(locale), label: termsPages[locale].label },
      {
        href: `${marketingPath(locale, "contact")}#faq`,
        label: copy.booking.labels.cancellationPolicy,
      },
    ],
    support: { email: page.operator.email, phone: page.operator.phone, whatsapp: {
      href: page.operator.whatsapp,
      label: {es:"¿Necesitas ayuda?", en:"Need help?", fr:"Besoin d’aide ?", de:"Brauchst du Hilfe?", nl:"Hulp nodig?"}[locale],
    } },
  };
}

export async function getHourlyPublicBookingAvailability(
  locale: MarketingLocale,
  experienceId: string,
  hours: number,
) {
  if (!hourlyDurationOptions[experienceId]?.includes(hours)) return null;
  if (hourlyVisualPreview()) {
    const { hourlyPreviewAvailability } =
      await import("./hourlyPublicBookingPreview");
    return presentPublicBookingAvailability(
      hourlyPreviewAvailability(experienceId, hours),
      locale,
    );
  }
  const { getContainer } = await import("@/container");
  const availability = await getContainer().publicBooking.getAvailability({
    locale: bookingTransactionLocale(locale),
    experienceId,
    hours,
  });
  return availability
    ? presentPublicBookingAvailability(availability, locale)
    : null;
}
