import {
  AdsConversionDeliveryError,
  type AttributedAdsConversion,
  type AdsConversionSender,
} from "@/modules/ads/application/ports/AdsConversions";
import type { ChatGptAdsConfig } from "./chatGptAdsConfig";

export class ChatGptConversionSender implements AdsConversionSender {
  constructor(
    private readonly config: ChatGptAdsConfig,
    private readonly request: typeof fetch = fetch,
  ) {}

  async send(conversion: AttributedAdsConversion): Promise<void> {
    if (conversion.pixelId !== this.config.pixelId) {
      throw new AdsConversionDeliveryError(
        "Ads pixel changed; review queued conversion.",
        false,
      );
    }
    let response: Response;
    try {
      response = await this.request(
        `https://bzr.openai.com/v1/events?pid=${encodeURIComponent(this.config.pixelId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5_000),
          body: JSON.stringify({
            validate_only: this.config.validateOnly,
            events: [
              {
                id: conversion.id,
                type: conversion.kind === "order" ? "order_created" : "custom",
                ...(conversion.kind === "whatsapp"
                  ? { custom_event_name: "booking_whatsapp_clicked" }
                  : {}),
                timestamp_ms: conversion.timestampMs,
                oppref: conversion.oppref,
                source_url: conversion.sourceUrl,
                action_source: "web",
                opt_out: true,
                data:
                  conversion.kind === "order"
                    ? {
                        type: "contents",
                        amount: conversion.amountMinor,
                        currency: conversion.currency,
                      }
                    : { type: "custom" },
              },
            ],
          }),
        },
      );
    } catch {
      // Do not include raw request/response data or credentials in logs.
      throw new AdsConversionDeliveryError(
        "Ads delivery network failure.",
        true,
      );
    }
    if (!response.ok) {
      throw new AdsConversionDeliveryError(
        `Ads delivery HTTP ${response.status}.`,
        response.status === 408 ||
          response.status === 429 ||
          response.status >= 500,
      );
    }
  }
}
