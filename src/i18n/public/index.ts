import type { BookingUiLocale } from "@/i18n/bookingLocales";
import { translatedBookingDictionary } from "./bookingTranslations";

import { caPublicDictionary } from "./ca";
import { enPublicDictionary } from "./en";
import { esPublicDictionary } from "./es";
import type { PublicDictionary } from "./types";

const publicDictionaries = {
  fr: translatedBookingDictionary("fr"),
  de: translatedBookingDictionary("de"),
  nl: translatedBookingDictionary("nl"),
  ca: caPublicDictionary,
  en: enPublicDictionary,
  es: esPublicDictionary,
} satisfies Record<BookingUiLocale, PublicDictionary>;

export function getPublicDictionary(locale: BookingUiLocale) {
  return publicDictionaries[locale];
}

export type { PublicDictionary };
