import { revalidatePath, unstable_cache, updateTag } from "next/cache";

import { createLocalizedPath, supportedLocales } from "@/i18n/locales";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

export const HOME_GALLERY_CACHE_TAG = "home-gallery";

const HOME_GALLERY_REVALIDATE_SECONDS = 60;

export async function loadPublishedHomeGallery(locale: SupportedLocaleCode) {
  void locale;

  const { getContainer } = await import("@/container");

  return getContainer().publicHomeGallery.getPublished();
}

export const getCachedPublishedHomeGallery = unstable_cache(
  loadPublishedHomeGallery,
  [HOME_GALLERY_CACHE_TAG],
  {
    revalidate: HOME_GALLERY_REVALIDATE_SECONDS,
    tags: [HOME_GALLERY_CACHE_TAG],
  },
);

export function revalidateHomeGalleryCache() {
  updateTag(HOME_GALLERY_CACHE_TAG);

  for (const locale of supportedLocales) {
    revalidatePath(createLocalizedPath(locale));
  }
}
