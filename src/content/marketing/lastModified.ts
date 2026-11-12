import type { MarketingLocale, MarketingPageKey } from "./routes";

// Editorial dates, not build dates or filesystem mtimes.
// 9f2e4ca (2026-11-09): published the pricing explanation and removed the
// misleading local payment/booking simulation notice from every marketing page.
// d299b07 (2026-11-12): clarified prices and inclusions on all experience pages.
// These changes affected all five translations. Update only the affected
// page/locale entries when significant public content changes again.
const sharedDates = {
  home: "2026-11-09",
  private: "2026-11-12",
  sunset: "2026-11-12",
  sunrise: "2026-11-12",
  romantic: "2026-11-12",
  prices: "2026-11-09",
  boat: "2026-11-09",
  contact: "2026-11-09",
  about: "2026-11-09",
} satisfies Record<MarketingPageKey, string>;

export const marketingLastModified: Record<
  MarketingLocale,
  Readonly<Record<MarketingPageKey, string>>
> = {
  es: { ...sharedDates },
  en: { ...sharedDates },
  fr: { ...sharedDates },
  de: { ...sharedDates },
  nl: { ...sharedDates },
};
