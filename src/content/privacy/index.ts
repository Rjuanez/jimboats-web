import type { MarketingLocale } from "@/content/marketing/routes";
import translations from "./copy.json";

export type PrivacyDocument = typeof translations.es;

export function getPrivacyDocument(locale: MarketingLocale): PrivacyDocument {
  return translations[locale];
}
