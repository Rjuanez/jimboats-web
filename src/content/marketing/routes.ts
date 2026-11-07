export const marketingLocales = ["es", "en", "fr", "de", "nl"] as const;
export type MarketingLocale = (typeof marketingLocales)[number];
export const pageKeys = [
  "home",
  "private",
  "sunset",
  "sunrise",
  "romantic",
  "prices",
  "boat",
  "contact",
  "about",
] as const;
export type MarketingPageKey = (typeof pageKeys)[number];
export type ExperienceKey = "private" | "sunset" | "sunrise" | "romantic";
export const experienceKeys: readonly ExperienceKey[] = [
  "private",
  "sunset",
  "sunrise",
  "romantic",
];

const slugs: Record<MarketingLocale, Record<MarketingPageKey, string>> = {
  es: {
    home: "",
    private: "paseo-privado-barco-barcelona",
    sunset: "paseo-barco-atardecer-barcelona",
    sunrise: "paseo-barco-amanecer-barcelona",
    romantic: "paseo-barco-romantico-barcelona",
    prices: "precios",
    boat: "nuestro-barco",
    contact: "contacto",
    about: "sobre-nosotros",
  },
  en: {
    home: "",
    private: "private-boat-trip-barcelona",
    sunset: "sunset-boat-trip-barcelona",
    sunrise: "sunrise-boat-trip-barcelona",
    romantic: "romantic-boat-trip-barcelona",
    prices: "prices",
    boat: "our-boat",
    contact: "contact",
    about: "about-us",
  },
  fr: {
    home: "",
    private: "balade-bateau-prive-barcelone",
    sunset: "bateau-coucher-soleil-barcelone",
    sunrise: "bateau-lever-soleil-barcelone",
    romantic: "balade-bateau-romantique-barcelone",
    prices: "tarifs",
    boat: "notre-bateau",
    contact: "contact",
    about: "a-propos",
  },
  de: {
    home: "",
    private: "private-bootstour-barcelona",
    sunset: "bootstour-sonnenuntergang-barcelona",
    sunrise: "bootstour-sonnenaufgang-barcelona",
    romantic: "romantische-bootsfahrt-barcelona",
    prices: "preise",
    boat: "unser-boot",
    contact: "kontakt",
    about: "ueber-uns",
  },
  nl: {
    home: "",
    private: "prive-boottocht-barcelona",
    sunset: "boottocht-zonsondergang-barcelona",
    sunrise: "boottocht-zonsopgang-barcelona",
    romantic: "romantische-boottocht-barcelona",
    prices: "prijzen",
    boat: "onze-boot",
    contact: "contact",
    about: "over-ons",
  },
};

export function isMarketingLocale(value: string): value is MarketingLocale {
  return marketingLocales.some((locale) => locale === value);
}
export function resolvePreferredMarketingLocale(header: string | null): MarketingLocale {
  const preferences = (header ?? "").split(",").map((entry) => {
    const [tag, ...parameters] = entry.trim().toLowerCase().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    return {
      locale: tag.split("-")[0],
      weight: quality === undefined ? 1 : Number(quality.trim().slice(2)),
    };
  }).filter(({ weight }) => Number.isFinite(weight) && weight > 0 && weight <= 1)
    .sort((a, b) => b.weight - a.weight);
  for (const { locale } of preferences) {
    if (locale === "ca") return "es";
    if (isMarketingLocale(locale)) return locale;
  }
  return "en";
}
export function marketingPath(
  locale: MarketingLocale,
  key: MarketingPageKey = "home",
) {
  return `/${locale}${slugs[locale][key] ? `/${slugs[locale][key]}` : ""}`;
}
export function resolveMarketingPage(locale: MarketingLocale, slug: string) {
  return pageKeys.find((key) => slugs[locale][key] === slug) ?? null;
}
export function marketingStaticParams() {
  return marketingLocales.flatMap((locale) =>
    pageKeys
      .filter((key) => key !== "home")
      .map((key) => ({ locale, slug: slugs[locale][key] })),
  );
}
