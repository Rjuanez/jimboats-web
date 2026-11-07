import {
  marketingLocales,
  type MarketingLocale,
} from "@/content/marketing/routes";

export const privacyPages: Record<
  MarketingLocale,
  { slug: string; label: string }
> = {
  es: { slug: "privacidad", label: "Política de privacidad" },
  en: { slug: "privacy", label: "Privacy policy" },
  fr: { slug: "confidentialite", label: "Politique de confidentialité" },
  de: { slug: "datenschutz", label: "Datenschutzerklärung" },
  nl: { slug: "privacy", label: "Privacybeleid" },
};

export function privacyPath(locale: MarketingLocale | "ca") {
  const language = locale === "ca" ? "es" : locale;
  return `/${language}/${privacyPages[language].slug}`;
}

export function privacyStaticParams() {
  return marketingLocales.map((locale) => ({
    locale,
    slug: privacyPages[locale].slug,
  }));
}
