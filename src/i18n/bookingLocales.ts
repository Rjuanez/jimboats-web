import type { PublicLocale } from "./locales";
import type { MarketingLocale } from "@/content/marketing/routes";

export type BookingUiLocale = PublicLocale | MarketingLocale;
export const bookingTransactionLocale = (
  locale: BookingUiLocale,
): PublicLocale => (locale === "es" || locale === "ca" ? locale : "en");
