import {
  experienceReviewIds,
  getExperienceDetailCopy,
  getExperienceDetails,
} from "./experienceDetails";
import hospitality from "./hospitality.json";
import { cancellationPolicy } from "../booking/cancellationPolicy";
import {
  getExperiencePricing,
  pricingCopy,
  productionExtraPrices,
} from "./pricing";
import { weatherCopy } from "./weather";
import { getTripPlanning } from "./tripPlanning";
import { customerReviews } from "./reviews";
import { premiumCopy } from "./premium";
import { blogPath, getBlogCards, getBlogCopy } from "../blog/catalog";
import {
  hourlyPrices,
  confirmedPriceIds,
  hourlyDurationOptions,
} from "../booking/hourlyPrices";
import mediaManifest from "../../../media/static/landing/manifest.json";
import es from "./es.json";
import en from "./en.json";
import fr from "./fr.json";
import de from "./de.json";
import nl from "./nl.json";
import { experiences, operator } from "./catalog";
import {
  experienceKeys,
  marketingLocales,
  marketingPath,
  type MarketingLocale,
  type MarketingPageKey,
} from "./routes";

export type MarketingCopy = typeof es;
const dictionaries: Record<MarketingLocale, MarketingCopy> = {
  es,
  en,
  fr,
  de,
  nl,
};
export function getMarketingCopy(locale: MarketingLocale) {
  return dictionaries[locale];
}

export function getMarketingPage(
  locale: MarketingLocale,
  key: MarketingPageKey = "home",
) {
  const base = dictionaries[locale];
  const detailCopy = getExperienceDetailCopy(locale);
  const copy = base;
  const reviewCount = customerReviews.sources.reduce(
    (total, source) => total + source.count,
    0,
  );
  const reviewRating =
    customerReviews.sources.reduce(
      (total, source) => total + source.rating * source.count,
      0,
    ) / reviewCount;
  const preparedExperiences = experienceKeys.map((id) => ({
    ...experiences[id],
    id,
    title: copy.names[id],
    shortName: copy.shortNames[id],
    description: copy.descriptions[id],
    href: marketingPath(locale, id),
    bookingHref: `/${locale}/book?experience=${experiences[id].bookingId}`,
    featuredHours: hourlyDurationOptions[experiences[id].bookingId][0],
    durationOptions: hourlyDurationOptions[experiences[id].bookingId],
    durationLabel: `${hourlyDurationOptions[experiences[id].bookingId][0]}–${hourlyDurationOptions[experiences[id].bookingId].at(-1)} ${copy.hours}`,
    capacity: 6,
    capacityLabel: copy.capacityLabel,
    confirmedPrice: confirmedPriceIds.includes(experiences[id].bookingId),
    prices: hourlyPrices[experiences[id].bookingId],
    pricing: getExperiencePricing(locale, experiences[id].bookingId),
    formattedPrices: Object.fromEntries(
      Object.entries(hourlyPrices[experiences[id].bookingId]).map(
        ([hours, euros]) => [
          hours,
          new Intl.NumberFormat(locale, {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(euros),
        ],
      ),
    ),
  }));
  const currentExperience = preparedExperiences.find((item) => item.id === key);
  const whatsappUrl = new URL(operator.whatsapp);
  whatsappUrl.searchParams.set(
    "text",
    currentExperience
      ? detailCopy.whatsappMessages.experience.replace(
          "{experience}",
          currentExperience.title,
        )
      : key === "contact"
        ? copy.support.contactMessage
        : detailCopy.whatsappMessages.general,
  );
  const detail = currentExperience
    ? getExperienceDetails(locale, currentExperience)
    : null;
  const reviewIds = currentExperience
    ? experienceReviewIds[currentExperience.id].length
      ? experienceReviewIds[currentExperience.id]
      : ["emma", "asante", "francessca"]
    : null;
  return {
    locale,
    onboard: hospitality[locale],
    planning: getTripPlanning(
      locale,
      preparedExperiences.find((item) => item.id === "private")!,
      copy.support.accessRoute,
    ),
    key,
    detail,
    detailCopy,
    blogHref: blogPath(locale),
    guideLabels: getBlogCopy(locale).labels,
    guides: getBlogCards(locale).filter((guide) =>
      key === "sunset" || key === "sunrise"
        ? guide.key === key
        : key === "romantic"
          ? guide.key === "sunset"
          : key === "private"
            ? guide.key === "food" || guide.key === "birthday"
            : true,
    ),
    experiencesHref: `${marketingPath(locale)}#experiences`,
    copy: {
      ...copy,
      faqs: [
        ...copy.faqs.map((faq, index) =>
          index === copy.faqs.length - 1
            ? [
                cancellationPolicy.copy[locale].weatherQuestion,
                cancellationPolicy.copy[locale].weather,
              ]
            : index === 3
              ? [
                  faq[0],
                  [
                    faq[1],
                    hospitality[locale].drinks,
                    hospitality[locale].food,
                  ].join(" "),
                ]
              : faq,
        ),
        [
          cancellationPolicy.copy[locale].question,
          cancellationPolicy.copy[locale].cancellation,
        ],
      ],
      trust: copy.trust.map((item) =>
        item.replace(
          "{googleReviews}",
          String(
            customerReviews.sources.find((source) => source.name === "Google")!
              .count,
          ),
        ),
      ),
    },
    cancellationPolicy: cancellationPolicy.copy[locale],
    premium: premiumCopy[locale],
    weather: weatherCopy[locale],
    pricing: {
      ...pricingCopy[locale],
      extrasRows: premiumCopy[locale].extraNames.map((name, index) => ({
        name,
        priceMinor: productionExtraPrices[index],
        description: premiumCopy[locale].extraDescriptions[index],
        price:
          productionExtraPrices[index] === null
            ? null
            : new Intl.NumberFormat(locale, {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(productionExtraPrices[index]! / 100),
      })),
    },
    operator: { ...operator, whatsapp: whatsappUrl.toString() },
    reviews: {
      ...customerReviews,
      excerpts: customerReviews.excerpts
        .filter((review) => !reviewIds || reviewIds.includes(review.id))
        .map((review) => ({
          ...review,
          translation:
            locale === review.language
              ? review.text
              : copy.reviewsTranslations[review.id],
          isTranslated: locale !== review.language,
          translationLanguage: locale,
          languageLabel:
            new Intl.DisplayNames([locale], { type: "language" }).of(
              review.language,
            ) ?? review.language,
        })),
      totalCount: reviewCount,
      ratingLabel: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(reviewRating),
      checkedAtLabel: new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(`${customerReviews.checkedAt}T12:00:00Z`)),
    },
    path: marketingPath(locale, key),
    title:
      key === "home" ? copy.homeTitle : (detail?.priceTitle ?? copy.names[key]),
    description:
      key === "home"
        ? copy.homeDescription.replace(
            "{startingPrice}",
            new Intl.NumberFormat(locale, {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(hourlyPrices.daytrip[1]),
          )
        : (detail?.lead ?? copy.descriptions[key]),
    languages: marketingLocales.map((language) => ({
      label: language.toUpperCase(),
      locale: language,
      href: marketingPath(language, key),
      active: language === locale,
    })),
    navigation: (
      ["experiences", "prices", "boat", "find-us", "contact-us"] as const
    ).map((section, index) => ({
      label: copy.nav[index],
      href: `${marketingPath(locale)}#${section}`,
    })),
    experiences: preparedExperiences,
    infoLinks: [
      ...(["about", "boat", "prices", "contact"] as const).map((page) => ({
        label: copy.names[page],
        href: marketingPath(locale, page),
      })),
      { label: getBlogCopy(locale).labels.name, href: blogPath(locale) },
    ],
  };
}
export type MarketingPage = ReturnType<typeof getMarketingPage>;
export type MarketingExperience = MarketingPage["experiences"][number];

export function marketingImage(slug: string, alt: string) {
  const source = mediaManifest.items.find((item) => item.slug === slug);
  if (!source) throw new Error(`Unknown marketing image: ${slug}`);
  const width = source.widths.at(-1)!;
  return {
    alt,
    src: `/images/generated/landing/${slug}-${width}.webp`,
    srcSet: source.widths
      .map(
        (width) => `/images/generated/landing/${slug}-${width}.webp ${width}w`,
      )
      .join(", "),
    sizes: "(min-width: 1024px) 55vw, 100vw",
    width,
    height: Math.round((source.height / source.width) * width),
  };
}
