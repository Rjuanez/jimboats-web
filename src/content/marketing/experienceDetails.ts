import type { getExperiencePricing } from "./pricing";
import hospitality from "./hospitality.json";
import solarCalendar from "./solarCalendar.json";
import copy from "./experienceDetails.json";
import { cancellationPolicy } from "../booking/cancellationPolicy";
import type { ExperienceKey, MarketingLocale } from "./routes";

// Match only reviews whose source activity or original wording identifies the trip.
// There are currently no verified sunrise/romantic-specific reviews in the curated set.
export const experienceReviewIds: Record<ExperienceKey, readonly string[]> = {
  private: ["emma", "megan", "stefania", "francessca"],
  sunset: ["asante", "adam", "alina"],
  sunrise: [],
  romantic: [],
};
export const getExperienceDetailCopy = (locale: MarketingLocale) =>
  copy[locale];

export function getExperienceDetails(
  locale: MarketingLocale,
  experience: {
    id: ExperienceKey;
    title: string;
    pricing: ReturnType<typeof getExperiencePricing>;
    featuredHours: number;
    durationOptions: readonly number[];
    formattedPrices: Record<number, string>;
  },
) {
  const labels = copy[locale];
  const profile = labels.profiles[experience.id];
  const price = experience.formattedPrices[experience.featuredHours];
  const duration = `${experience.featuredHours} ${experience.featuredHours === 1 ? labels.hour : labels.hours}`;
  const fill = (value: string) =>
    value
      .replaceAll("{price}", price)
      .replaceAll("{hours}", duration)
      .replaceAll("{min}", String(experience.durationOptions[0]))
      .replaceAll("{max}", String(experience.durationOptions.at(-1)));
  const decoration =
    experience.id === "romantic" ? labels.bookingCard.decoration : null;
  const priceTitle = `${experience.title} ${labels.from} ${price} ${labels.for} ${duration}`;
  const refreshments = experience.durationOptions.includes(1)
    ? labels.bookingCard.refreshments
    : labels.bookingCard.refreshmentsFromTwo;
  const faqs: [string, string][] = [
    [
      labels.priceQuestion,
      `${experience.title}: ${experience.pricing.summary} ${experience.pricing.examples} ${labels.finalPrice} ${labels.capacityAnswer}${decoration ? ` ${decoration}.` : ""} ${refreshments} ${hospitality[locale].drinks} ${hospitality[locale].food}`,
    ],
    [labels.durationQuestion, fill(labels.durationAnswer)],
    ...profile.faqs.map(([question, answer]): [string, string] => [
      question,
      answer,
    ]),
    [labels.capacityQuestion, labels.capacityAnswer],
    [labels.meetingQuestion, labels.meetingAnswer],
    [labels.bookingQuestion, labels.bookingAnswer],
    [
      cancellationPolicy.copy[locale].question,
      cancellationPolicy.copy[locale].cancellation,
    ],
    [
      cancellationPolicy.copy[locale].weatherQuestion,
      cancellationPolicy.copy[locale].weather,
    ],
  ];
  const specificReviews = experienceReviewIds[experience.id].length > 0;
  return {
    labels,
    ...profile,
    priceTitle,
    pricing: experience.pricing,
    priceHighlight:
      experience.featuredHours === 1
        ? labels.bookingCard.oneHourPrice
        : labels.bookingCard.longerPrice,
    includedItems: [
      ...labels.bookingCard.essentials,
      ...(decoration ? [decoration] : []),
      experience.featuredHours === 1
        ? labels.bookingCard.drink
        : labels.bookingCard.drinks,
      experience.featuredHours === 1
        ? labels.bookingCard.snacksFrom
        : labels.bookingCard.snacks,
    ],
    includedSummary: `${labels.includedShort}. ${experience.featuredHours === 1 ? labels.bookingCard.drink : `${labels.bookingCard.drinks} · ${labels.bookingCard.snacks}`}.${decoration ? ` ${decoration}.` : ""}`,
    solarCalendar:
      experience.id === "sunrise" || experience.id === "sunset"
        ? {
            title: labels.bookingCard.monthly[experience.id],
            copy: labels.bookingCard.monthly,
            source: solarCalendar.source,
            rows: solarCalendar.rows.map((row) => ({
              date: row.date,
              month: new Intl.DateTimeFormat(locale, {
                month: "long",
                timeZone: "Europe/Madrid",
              }).format(new Date(`${row.date}T12:00:00Z`)),
              time: row[experience.id as "sunrise" | "sunset"],
            })),
          }
        : null,
    lead: fill(profile.lead),
    faqs,
    specificReviews,
    reviewsContext: specificReviews
      ? labels.reviewsSpecific
      : labels.reviewsGeneral,
    galleryAlts:
      experience.id === "sunrise"
        ? labels.sunriseGalleryAlts
        : experience.id === "romantic"
          ? labels.romanticGalleryAlts
          : experience.id === "sunset"
            ? labels.sunsetGalleryAlts
            : labels.galleryAlts,
    gallerySlugs:
      experience.id === "sunrise" || experience.id === "romantic"
        ? Array.from(
            { length: experience.id === "sunrise" ? 7 : 10 },
            (_, i) => `${experience.id}-gallery-${i + 1}`,
          )
        : experience.id === "sunset"
          ? [
              "sunset-lena-panorama",
              "sunset-lena-portrait",
              "sunset-couple-deck",
              "sunset-guests-skyline",
              "sunset-lena-golden",
            ]
          : [
              "production-gallery-1",
              "production-gallery-2",
              "production-gallery-3",
              "production-gallery-4",
            ],
  };
}
