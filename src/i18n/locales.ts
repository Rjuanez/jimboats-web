import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

export const supportedLocales = ["en", "es", "ca"] as const;
export const defaultLocale = "en" satisfies SupportedLocaleCode;

export type PublicLocale = (typeof supportedLocales)[number];

const supportedLocaleSet = new Set<string>(supportedLocales);

export function isPublicLocale(value: string): value is PublicLocale {
  return supportedLocaleSet.has(value);
}

export function parsePublicLocale(value: string): PublicLocale | null {
  const normalized = value.trim().toLowerCase();

  return isPublicLocale(normalized) ? normalized : null;
}

export function localeToIntlLocale(locale: PublicLocale) {
  const intlLocales = {
    ca: "ca-ES",
    en: "en-US",
    es: "es-ES",
  } satisfies Record<PublicLocale, string>;

  return intlLocales[locale];
}

export function createLocalizedPath(locale: PublicLocale, path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

export function createLocalizedEquivalentPath(
  locale: PublicLocale,
  pathname: string,
) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalizedPath.split("/").filter(Boolean);
  const [, ...restSegments] = isPublicLocale(segments[0] ?? "")
    ? segments
    : ["", ...segments];
  const suffix = restSegments.length > 0 ? `/${restSegments.join("/")}` : "";

  return createLocalizedPath(locale, suffix);
}

export function createLanguageAlternates(path = "") {
  return Object.fromEntries(
    supportedLocales.map((locale) => [locale, createLocalizedPath(locale, path)]),
  ) as Record<PublicLocale, string>;
}

export function resolvePreferredLocale(acceptLanguage: string | null) {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const preferences = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [range = "", ...parameters] = entry.trim().split(";");
      const qParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const quality = qParameter
        ? Number(qParameter.trim().slice(2))
        : 1;

      return {
        index,
        quality: Number.isFinite(quality) ? quality : 0,
        range: range.toLowerCase(),
      };
    })
    .sort((left, right) => right.quality - left.quality || left.index - right.index);

  for (const preference of preferences) {
    const [baseLanguage = ""] = preference.range.split("-");
    const locale = parsePublicLocale(baseLanguage);

    if (locale) {
      return locale;
    }
  }

  return defaultLocale;
}
