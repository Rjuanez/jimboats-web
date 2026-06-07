import { describe, expect, it } from "vitest";

import type { NotificationDeliverySnapshot } from "@/modules/notifications/domain/NotificationDelivery";

import { PreludeWhatsappNotificationProvider } from "./PreludeWhatsappNotificationProvider";
import { ResendEmailNotificationProvider } from "./ResendEmailNotificationProvider";

describe("External notification providers", () => {
  it("sends rendered email deliveries to Resend", async () => {
    const fetchCalls: Array<[string, RequestInit]> = [];
    const fetchFn = createFetchFake(fetchCalls, { id: "email_1" });
    const provider = new ResendEmailNotificationProvider(
      {
        apiKey: "resend-key",
        from: "JimBoats <bookings@jimboatscharter.com>",
        replyTo: "info@jimboatscharter.com",
      },
      fetchFn,
    );

    const result = await provider.send(emailDelivery());

    expect(result).toEqual({
      provider: "RESEND",
      providerMessageId: "email_1",
    });
    expect(fetchCalls[0]).toEqual([
      "https://api.resend.com/emails",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer resend-key",
          "Idempotency-Key": "delivery-email-1",
        }),
        method: "POST",
      }),
    ]);
    expect(JSON.parse(fetchCalls[0][1].body as string)).toMatchObject({
      from: "JimBoats <bookings@jimboatscharter.com>",
      html:
        '<p>Your booking <strong>JB-2026-0001</strong> is confirmed.</p>',
      reply_to: "info@jimboatscharter.com",
      subject: "Booking confirmed",
      text: "Your booking is confirmed.",
      to: ["guest@example.com"],
    });
  });

  it("sends provider template deliveries to Prelude WhatsApp", async () => {
    const fetchCalls: Array<[string, RequestInit]> = [];
    const fetchFn = createFetchFake(fetchCalls, { id: "tx_1" });
    const provider = new PreludeWhatsappNotificationProvider(
      {
        apiKey: "prelude-key",
        callbackUrl: "https://jimboatscharter.com/api/webhooks/prelude",
        from: null,
      },
      fetchFn,
    );

    const result = await provider.send(whatsappDelivery());

    expect(result).toEqual({
      provider: "PRELUDE_WHATSAPP",
      providerMessageId: "tx_1",
    });
    expect(fetchCalls[0]).toEqual([
      "https://api.prelude.dev/v2/notify",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer prelude-key",
        }),
        method: "POST",
      }),
    ]);
    expect(JSON.parse(fetchCalls[0][1].body as string)).toMatchObject({
      callback_url: "https://jimboatscharter.com/api/webhooks/prelude",
      correlation_id: "delivery-whatsapp",
      locale: "en",
      preferred_channel: "whatsapp",
      template_id: "template_prelude_1",
      to: "+34600000000",
      variables: {
        "booking.reference": "JB-2026-0001",
      },
    });
  });
});

function createFetchFake(
  calls: Array<[string, RequestInit]>,
  response: Record<string, string>,
): typeof fetch {
  return async (url, init) => {
    calls.push([String(url), init ?? {}]);

    return Response.json(response);
  };
}

function emailDelivery(): NotificationDeliverySnapshot {
  return {
    ...baseDelivery(),
    channel: "EMAIL",
    id: "delivery-email",
    providerTemplateId: null,
    providerVariables: {},
    recipient: {
      email: "guest@example.com",
      name: "Guest",
      phone: null,
      recipientType: "BUYER",
    },
    renderedSubject: "Booking confirmed",
  };
}

function whatsappDelivery(): NotificationDeliverySnapshot {
  return {
    ...baseDelivery(),
    channel: "WHATSAPP",
    id: "delivery-whatsapp",
    providerTemplateId: "template_prelude_1",
    providerVariables: {
      "booking.reference": "JB-2026-0001",
    },
    recipient: {
      email: null,
      name: "Guest",
      phone: "+34600000000",
      recipientType: "BUYER",
    },
    renderedSubject: null,
  };
}

function baseDelivery(): NotificationDeliverySnapshot {
  return {
    attempts: 0,
    bookingId: "booking-1",
    channel: "EMAIL",
    createdAt: "2026-06-01T10:00:00.000Z",
    deliveredAt: null,
    eventType: "BookingCreated",
    failureReason: null,
    id: "delivery-1",
    locale: "en",
    notificationType: "BOOKING_CREATED",
    outboxMessageId: "outbox-1",
    payload: {
      booking: {
        reference: "JB-2026-0001",
      },
    },
    provider: null,
    providerMessageId: null,
    providerTemplateId: null,
    providerVariables: {},
    recipient: {
      email: "guest@example.com",
      name: "Guest",
      phone: null,
      recipientType: "BUYER",
    },
    renderedBody: "Your booking is confirmed.",
    renderedHtmlBody:
      '<p>Your booking <strong>JB-2026-0001</strong> is confirmed.</p>',
    renderedSubject: "Booking confirmed",
    ruleId: "rule-email",
    sendAfter: null,
    sentAt: null,
    status: "PENDING",
    templateId: "template-email",
    templateVersion: 1,
    updatedAt: "2026-06-01T10:00:00.000Z",
  };
}
