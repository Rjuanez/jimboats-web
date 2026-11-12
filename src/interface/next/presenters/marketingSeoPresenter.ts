import { boatCopy, boatPhotos } from "@/content/marketing/boat";
import { productionSeoEnabled } from "../config/seoIndexing";
import type { Metadata } from "next";
import {
  getMarketingPage,
  marketingImage,
  type MarketingPage,
  type MarketingExperience,
} from "@/content/marketing";
import { operator } from "@/content/marketing/catalog";
import { marketingLastModified } from "@/content/marketing/lastModified";
import { marketingDescriptions, marketingTitles } from "@/content/marketing/seo";
import {
  marketingLocales,
  marketingPath,
  pageKeys,
  type MarketingLocale,
  type MarketingPageKey,
} from "@/content/marketing/routes";

export function marketingMetadata(
  locale: MarketingLocale,
  key: MarketingPageKey = "home",
): Metadata {
  const page = getMarketingPage(locale, key);
  const experience = page.experiences.find((item) => item.id === key);
  const image = marketingImage(
    key === "boat"
      ? boatPhotos.hero
      : (experience?.imageSlug ?? "hero-sunset-barcelona"),
    key === "boat"
      ? boatCopy[locale].heroAlt
      : (experience?.title ?? page.copy.heroAlt),
  );
  const title = `${marketingTitles[locale][key]} | JimBoats`;
  const descriptionTemplate = marketingDescriptions[locale][key];
  const pricedExperience = experience ?? page.experiences.find((item) => item.id === "private")!;
  const startingHours = pricedExperience.featuredHours;
  const description = descriptionTemplate
    ? descriptionTemplate
        .replaceAll("{price}", pricedExperience.formattedPrices[startingHours])
        .replaceAll("{hours}", `${startingHours} ${startingHours === 1 ? page.copy.hour : page.copy.hours}`)
        .replaceAll("{min}", String(pricedExperience.durationOptions[0]))
        .replaceAll("{max}", String(pricedExperience.durationOptions.at(-1)))
    : page.description;
  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(operator.url),
    alternates: {
      canonical: operator.url + page.path,
      languages: {
        ...Object.fromEntries(
          marketingLocales.map((language) => [
            language,
            operator.url + marketingPath(language, key),
          ]),
        ),
        "x-default": operator.url + marketingPath("en", key),
      },
    },
    robots: { index: productionSeoEnabled(), follow: true, "max-image-preview": "large" },
    openGraph: {
      title,
      description,
      url: operator.url + page.path,
      type: "website",
      siteName: operator.name,
      locale: {
        es: "es_ES",
        en: "en_GB",
        fr: "fr_FR",
        de: "de_DE",
        nl: "nl_NL",
      }[locale],
      images: [
        {
          url: operator.url + image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
  };
}

function hourlyOffer(
  page: MarketingPage,
  trip: MarketingExperience,
  hours: number,
) {
  const tripUrl = operator.url + trip.href;
  const copy = page.detailCopy;
  return {
    "@type": "Offer",
    "@id": `${tripUrl}#offer-${hours}h`,
    name: `${trip.title} · ${hours} h`,
    description: [
      copy.finalPrice,
      trip.capacityLabel,
      copy.includedShort,
      hours === 1
        ? copy.bookingCard.drink
        : copy.bookingCard.drinks + " · " + copy.bookingCard.snacks,
    ].join(" · "),
    itemOffered: {
      "@type": "Service",
      "@id": tripUrl + "#service",
      name: trip.title,
      url: tripUrl,
    },
    url: operator.url + trip.bookingHref + `&hours=${hours}`,
    price: trip.prices[hours],
    priceCurrency: "EUR",
    eligibleDuration: {
      "@type": "QuantitativeValue",
      value: hours,
      unitCode: "HUR",
    },
    seller: { "@id": operator.entityId },
  };
}

function rateCatalog(page: MarketingPage) {
  const full = page.key === "prices";
  return {
    "@type": "OfferCatalog",
    "@id": operator.url + page.path + "#offer-catalog",
    name: full ? page.title : page.pricing.title,
    itemListElement: [
      ...page.experiences
        .filter((trip) => trip.confirmedPrice)
        .map((trip) => ({
          "@type": "OfferCatalog",
          name: trip.title,
          url: operator.url + trip.href,
          itemListElement: (full
            ? trip.durationOptions
            : [trip.featuredHours]
          ).map((hours) => hourlyOffer(page, trip, hours)),
        })),
      {
        "@type": "OfferCatalog",
        name: page.pricing.extras,
        itemListElement: page.pricing.extrasRows.map((extra) => ({
          "@type": "Offer",
          name: extra.name,
          itemOffered: { "@type": "Service", name: extra.name },
          description:
            extra.priceMinor === null
              ? page.pricing.consult
              : page.pricing.perBooking,
          ...(extra.priceMinor !== null && {
            price: extra.priceMinor / 100,
            priceCurrency: "EUR",
          }),
        })),
      },
    ],
  };
}

export function marketingBusinessStructuredData() {
  return {
    "@type": "LocalBusiness",
    "@id": operator.entityId,
    name: operator.name,
    legalName: operator.legalName,
    taxID: operator.taxId,
    url: operator.url,
    telephone: operator.phone,
    email: operator.email,
    image: `${operator.url}/images/generated/landing/hero-sunset-barcelona-1024.webp`,
    address: {
      "@type": "PostalAddress",
      ...operator.boardingAddress,
    },
    sameAs: [operator.instagram],
    hasMap: operator.maps,
  };
}

export function marketingStructuredData(page: MarketingPage) {
  const url = operator.url + page.path;
  const faqs = [
    ...(page.detail?.faqs ?? []),
    ...(page.detail || page.key === "prices" || page.key === "contact" ? page.planning.questions : []),
  ];
  const catalog =
    page.key === "prices" || page.key === "home" ? rateCatalog(page) : null;
  const organization = {
    ...marketingBusinessStructuredData(),
    ...(catalog && { hasOfferCatalog: { "@id": catalog["@id"] } }),
  };
  const currentExperience = page.experiences.find(
    (item) => item.id === page.key,
  );
  const service = currentExperience
    ? {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.title,
        description: page.description,
        url,
        provider: { "@id": operator.entityId },
        areaServed: { "@type": "City", name: "Barcelona" },
        serviceType: page.copy.names[currentExperience.id],
        ...(currentExperience.confirmedPrice && {
          offers: currentExperience.durationOptions.map((hours) =>
            hourlyOffer(page, currentExperience, hours),
          ),
        }),
      }
    : null;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: page.title,
        description: page.description,
        inLanguage: page.locale,
        ...(page.key === "prices" &&
          catalog && { mainEntity: { "@id": catalog["@id"] } }),
        about: {
          "@id": service ? `${url}#service` : operator.entityId,
        },
      },
      ...(service ? [service] : []),
      ...(catalog ? [catalog] : []),
      ...(faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              inLanguage: page.locale,
              mainEntity: faqs.map(([name, text]) => ({
                "@type": "Question",
                name,
                acceptedAnswer: { "@type": "Answer", text },
              })),
            },
          ]
        : []),
      ...(page.key === "home"
        ? []
        : [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: page.copy.home,
                  item: operator.url + marketingPath(page.locale),
                },
                ...(currentExperience
                  ? [
                      {
                        "@type": "ListItem",
                        position: 2,
                        name: page.detailCopy.breadcrumb,
                        item: operator.url + page.experiencesHref,
                      },
                    ]
                  : []),
                {
                  "@type": "ListItem",
                  position: currentExperience ? 3 : 2,
                  name: currentExperience?.title ?? page.title,
                  item: url,
                },
              ],
            },
          ]),
    ],
  };
}

export function marketingSitemap() {
  return marketingLocales.flatMap((locale) =>
    pageKeys.map((key) => ({
      url: operator.url + marketingPath(locale, key),
      lastModified: marketingLastModified[locale][key],
      alternates: {
        languages: Object.fromEntries(
          marketingLocales.map((language) => [
            language,
            operator.url + marketingPath(language, key),
          ]),
        ),
      },
    })),
  );
}
