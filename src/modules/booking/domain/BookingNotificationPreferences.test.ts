import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";

import { BookingNotificationPreferences } from "./BookingNotificationPreferences";

describe("BookingNotificationPreferences", () => {
  it("creates booking communication consent with normalized destinations", () => {
    const preferences = createPreferences();

    expect(preferences.canUseChannel("EMAIL")).toBe(true);
    expect(preferences.canUseChannel("WHATSAPP")).toBe(false);
    expect(preferences.getDestinationForChannel("EMAIL")).toBe(
      "guest@example.com",
    );
    expect(preferences.toSnapshot()).toMatchObject({
      consentNotes: "Accepted during checkout",
      consentSource: "CHECKOUT",
      email: {
        consentStatus: "GRANTED",
        destination: "guest@example.com",
        enabled: true,
      },
      preferredLocale: "en",
      whatsapp: {
        consentStatus: "NOT_ASKED",
        destination: "+34 600 000 000",
        enabled: false,
      },
    });
  });

  it("does not allow channels without granted consent", () => {
    const preferences = createPreferences();

    expect(() => preferences.getDestinationForChannel("WHATSAPP")).toThrow(
      DomainError,
    );
  });

  it("rejects enabled channels without destinations", () => {
    expect(() =>
      createPreferences({
        email: {
          consentStatus: "GRANTED",
          destination: null,
          enabled: true,
        },
      }),
    ).toThrow(DomainError);
  });

  it("updates one channel preference while preserving the other one", () => {
    const capturedAt = new Date("2026-06-02T10:00:00.000Z");
    const preferences = createPreferences().withChannelPreference({
      channel: "WHATSAPP",
      consentCapturedAt: capturedAt,
      consentNotes: "Buyer allowed WhatsApp from booking access.",
      consentSource: "BUYER_ACCESS",
      preference: {
        consentStatus: "GRANTED",
        destination: "+34 611 111 111",
        enabled: true,
      },
    });

    expect(preferences.canUseChannel("EMAIL")).toBe(true);
    expect(preferences.canUseChannel("WHATSAPP")).toBe(true);
    expect(preferences.toSnapshot()).toMatchObject({
      consentCapturedAt: capturedAt.toISOString(),
      consentSource: "BUYER_ACCESS",
      whatsapp: {
        consentStatus: "GRANTED",
        destination: "+34 611 111 111",
      },
    });
  });

  it("requires a supported locale", () => {
    expect(() => createPreferences({ preferredLocale: "fr" })).toThrow(
      DomainError,
    );
  });
});

function createPreferences(
  patch: Partial<Parameters<typeof BookingNotificationPreferences.create>[0]> = {},
) {
  return BookingNotificationPreferences.create({
    consentCapturedAt: new Date("2026-06-01T10:00:00.000Z"),
    consentNotes: " Accepted during checkout ",
    consentSource: "CHECKOUT",
    email: {
      consentStatus: "GRANTED",
      destination: " GUEST@example.com ",
      enabled: true,
    },
    preferredLocale: "en",
    whatsapp: {
      consentStatus: "NOT_ASKED",
      destination: "+34 600 000 000",
      enabled: false,
    },
    ...patch,
  });
}
