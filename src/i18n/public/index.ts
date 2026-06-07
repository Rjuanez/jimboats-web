import type { PublicLocale } from "@/i18n/locales";

import { caPublicDictionary } from "./ca";
import { enPublicDictionary } from "./en";
import { esPublicDictionary } from "./es";
import type { PublicDictionary } from "./types";

const publicDictionaries = {
  ca: caPublicDictionary,
  en: enPublicDictionary,
  es: esPublicDictionary,
} satisfies Record<PublicLocale, PublicDictionary>;

export function getPublicDictionary(locale: PublicLocale) {
  return publicDictionaries[locale];
}

export type { PublicDictionary };
