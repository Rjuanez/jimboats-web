import { describe, expect, it, vi } from "vitest";
import { ChatGptConversionSender } from "./ChatGptConversionSender";
import { getChatGptAdsConfig } from "./chatGptAdsConfig";

const config = {
  pixelId: "pixel-test",
  apiKey: "test-secret",
  sourceUrl: "https://example.com/en/book/success",
  validateOnly: true,
};
const conversion = {
  kind: "order" as const,
  consentId: "consent-1",
  id: "booking_1_paid",
  pixelId: "pixel-test",
  timestampMs: 1_799_999_999_000,
  oppref: "opaque+value/=",
  sourceUrl: config.sourceUrl,
  amountMinor: 10_000,
  currency: "EUR",
};

describe("ChatGPT Ads configuration", () => {
  it("stays disabled by default, including when credentials alone exist", () => {
    expect(getChatGptAdsConfig({})).toBeNull();
    expect(
      getChatGptAdsConfig({
        CHATGPT_ADS_PIXEL_ID: "id",
        CHATGPT_ADS_CAPI_KEY: "secret",
      }),
    ).toBeNull();
  });
  it("requires credentials only when explicitly enabled and defaults to validation", () => {
    expect(() => getChatGptAdsConfig({ CHATGPT_ADS_ENABLED: "true" })).toThrow(
      /requires/,
    );
    expect(
      getChatGptAdsConfig({
        CHATGPT_ADS_ENABLED: "true",
        CHATGPT_ADS_PIXEL_ID: "id",
        CHATGPT_ADS_CAPI_KEY: "secret",
        PUBLIC_SITE_URL: "https://example.com/path?token=private",
      }),
    ).toMatchObject({
      validateOnly: true,
      sourceUrl: "https://example.com/en/book/success",
    });
  });
});

describe("ChatGptConversionSender", () => {
  it("reports WhatsApp as a click, without claiming a purchase or a paid amount", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    await new ChatGptConversionSender(config, request).send({
      id: "click-1",
      kind: "whatsapp",
      consentId: "consent-1",
      pixelId: "pixel-test",
      oppref: "opaque",
      sourceUrl: "https://example.com/es/book",
      timestampMs: conversion.timestampMs,
    });
    const event = JSON.parse(request.mock.calls[0][1]?.body as string)
      .events[0];
    expect(event).toMatchObject({
      type: "custom",
      custom_event_name: "booking_whatsapp_clicked",
      data: { type: "custom" },
    });
    expect(event.data).not.toHaveProperty("amount");
    expect(event).not.toHaveProperty("consentId");
  });

  it("sends only the collected amount in cents with stable attribution and no customer data", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const sender = new ChatGptConversionSender(config, request);
    await sender.send(conversion);
    const [url, init] = request.mock.calls[0];
    expect(url).toBe("https://bzr.openai.com/v1/events?pid=pixel-test");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer test-secret",
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      validate_only: true,
      events: [
        {
          id: "booking_1_paid",
          type: "order_created",
          timestamp_ms: conversion.timestampMs,
          oppref: conversion.oppref,
          source_url: conversion.sourceUrl,
          action_source: "web",
          opt_out: true,
          data: { type: "contents", amount: 10_000, currency: "EUR" },
        },
      ],
    });
  });
  it.each([
    [400, false],
    [401, false],
    [429, true],
    [503, true],
  ])(
    "classifies HTTP %s without leaking response contents",
    async (status, retryable) => {
      const request = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response("private customer data", { status: status as number }),
        );
      await expect(
        new ChatGptConversionSender(config, request).send(conversion),
      ).rejects.toMatchObject({
        message: `Ads delivery HTTP ${status}.`,
        retryable,
      });
    },
  );
  it("retries network failures and refuses sending old jobs to another account", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("private request detail"));
    await expect(
      new ChatGptConversionSender(config, request).send(conversion),
    ).rejects.toMatchObject({
      retryable: true,
      message: "Ads delivery network failure.",
    });
    request.mockClear();
    await expect(
      new ChatGptConversionSender(
        { ...config, pixelId: "other" },
        request,
      ).send(conversion),
    ).rejects.toMatchObject({ retryable: false });
    expect(request).not.toHaveBeenCalled();
  });
});
