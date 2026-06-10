import type { BookingAccessUrlBuilder } from "@/modules/booking/application/ports/BookingAccessUrlBuilder";

const publicBookingAccessLocales = new Set(["ca", "en", "es"]);

export class PublicBookingAccessUrlBuilder implements BookingAccessUrlBuilder {
  constructor(private readonly publicSiteUrl: string) {}

  build(input: { locale: string; rawToken: string; reference: string }) {
    const locale = publicBookingAccessLocales.has(input.locale)
      ? input.locale
      : "en";
    const reference = encodeURIComponent(input.reference);
    const path = `/${locale}/bookings/${reference}`;
    const url = new URL(path, this.normalizedBaseUrl());

    url.searchParams.set("token", input.rawToken);

    return {
      path,
      url: url.toString(),
    };
  }

  private normalizedBaseUrl() {
    const value = this.publicSiteUrl.trim();

    if (!value) {
      return "http://localhost:3000";
    }

    return value.endsWith("/") ? value : `${value}/`;
  }
}

export function createPublicBookingAccessUrlBuilderFromEnv() {
  return new PublicBookingAccessUrlBuilder(
    process.env.PUBLIC_SITE_URL ?? "http://localhost:3000",
  );
}
