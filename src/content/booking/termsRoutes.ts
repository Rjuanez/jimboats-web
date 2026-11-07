import { marketingLocales, type MarketingLocale } from "../marketing/routes";

export const termsPages = {
  es: { slug: "condiciones", label: "Condiciones de contratación" },
  en: { slug: "booking-terms", label: "Booking terms" },
  fr: { slug: "conditions-de-reservation", label: "Conditions de réservation" },
  de: { slug: "buchungsbedingungen", label: "Buchungsbedingungen" },
  nl: { slug: "boekingsvoorwaarden", label: "Boekingsvoorwaarden" },
} satisfies Record<MarketingLocale, { slug: string; label: string }>;

export function termsPath(locale: MarketingLocale | "ca") {
  const language = locale === "ca" ? "es" : locale;
  return `/${language}/${termsPages[language].slug}`;
}

export function termsStaticParams() {
  return marketingLocales.map((locale) => ({
    locale,
    slug: termsPages[locale].slug,
  }));
}
