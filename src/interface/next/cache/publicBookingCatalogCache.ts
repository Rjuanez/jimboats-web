import { revalidatePath, unstable_cache, updateTag } from "next/cache";

import { createLocalizedPath, supportedLocales } from "@/i18n/locales";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import { getPublicBookingPage } from "../presenters/publicBookingPresenter";

export const PUBLIC_BOOKING_CATALOG_CACHE_TAG = "public-booking-catalog";

const PUBLIC_BOOKING_CATALOG_REVALIDATE_SECONDS = 60 * 60 * 24;

export async function loadPublicBookingCatalog(locale: SupportedLocaleCode) {
  return getPublicBookingPage(locale, {
    includeAvailability: false,
  });
}

export const getCachedPublicBookingCatalog = unstable_cache(
  loadPublicBookingCatalog,
  [PUBLIC_BOOKING_CATALOG_CACHE_TAG],
  {
    revalidate: PUBLIC_BOOKING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_BOOKING_CATALOG_CACHE_TAG],
  },
);

export function revalidatePublicBookingCatalogCache() {
  updateTag(PUBLIC_BOOKING_CATALOG_CACHE_TAG);

  for (const locale of supportedLocales) {
    revalidatePath(createLocalizedPath(locale));
  }
}
