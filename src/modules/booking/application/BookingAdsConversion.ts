import type { BookingOutboxEventWriteModel } from "./ports/BookingRepository";
import type { AdsAttribution } from "@/modules/ads/application/ports/AdsConversions";

export type BookingAdsConfig = {
  pixelId: string;
  sourceUrl: string;
};

export function bookingAdsConversion(input: {
  config?: BookingAdsConfig | null;
  attribution?: AdsAttribution;
  bookingId: string;
  occurredAt: Date;
  amountMinor: number;
  currency: string;
}): BookingOutboxEventWriteModel[] {
  if (
    !input.config ||
    input.attribution?.consentGranted !== true ||
    !input.attribution.consentId ||
    !Number.isSafeInteger(input.amountMinor) ||
    input.amountMinor <= 0
  )
    return [];
  return [
    {
      aggregateId: input.bookingId,
      aggregateType: "ADS_CONVERSION",
      eventType: "ChatGptOrderCreated",
      eventVersion: 1,
      occurredAt: input.occurredAt,
      payload: {
        attempts: 0,
        conversion: {
          id: `booking_${input.bookingId}_paid`,
          pixelId: input.config.pixelId,
          timestampMs: input.occurredAt.getTime(),
          kind: "order",
          consentId: input.attribution.consentId,
          sourceUrl: input.config.sourceUrl,
          amountMinor: input.amountMinor,
          currency: input.currency.toUpperCase(),
        },
      },
    },
  ];
}
