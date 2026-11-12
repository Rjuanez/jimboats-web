import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { StripeDepositPaymentProvider } from "./StripeDepositPaymentProvider";

describe("StripeDepositPaymentProvider", () => {
  it.each(["DEPOSIT", "FULL"] as const)(
    "creates embedded checkout for %s payments",
    async (paymentChoice) => {
      const provider = new StripeDepositPaymentProvider({
        secretKey: "sk_test_123",
        webhookSecret: "whsec_test_secret",
      });
      const createSession = vi.fn().mockResolvedValue({
        client_secret: "cs_test_embedded_secret",
        id: "cs_test_123",
      });
      const providerWithMockedStripe = provider as unknown as {
        stripe: {
          checkout: {
            sessions: {
              create: typeof createSession;
            };
          };
        };
      };
      providerWithMockedStripe.stripe.checkout.sessions.create = createSession;

      await expect(
        provider.createCheckoutSession({
          paymentChoice,
          adsAttribution: { consentGranted: true, consentId: "consent-1" },
          amount: {
            amountMinor: 10_000,
            currency: "EUR",
          },
          bookingId: "booking-1",
          customer: {
            email: "sailor@example.com",
            fullName: "Sailor Guest",
            phone: "+34 600 000 000",
          },
          experienceName: "Sunset Cruise",
          expiresAt: new Date("2026-06-01T10:30:00.000Z"),
          locale: "en",
          paymentRecordId: "payment-booking-1",
          reference: "JB-2026-0001",
          returnUrl:
            "http://localhost:3000/en/book/success?session_id={CHECKOUT_SESSION_ID}",
        }),
      ).resolves.toEqual({
        clientSecret: "cs_test_embedded_secret",
        providerSessionId: "cs_test_123",
      });
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "payment",
          metadata: expect.objectContaining({ chatgptMeasurementConsent: "granted-v1", chatgptConsentId: "consent-1" }),
          redirect_on_completion: "if_required",
          return_url:
            "http://localhost:3000/en/book/success?session_id={CHECKOUT_SESSION_ID}",
          ui_mode: "embedded_page",
        }),
      );
      expect(createSession.mock.calls[0]?.[0]).not.toHaveProperty(
        "success_url",
      );
      expect(
        createSession.mock.calls[0]?.[0].line_items[0].price_data.product_data
          .description,
      ).toContain(
        paymentChoice === "FULL"
          ? "No remaining balance"
          : "Remaining balance is paid on board in cash, by card or via Bizum.",
      );
    },
  );

  it.each([
    ["checkout.session.completed", "unpaid", false],
    ["checkout.session.completed", "paid", true],
    ["checkout.session.async_payment_succeeded", "paid", true],
    ["checkout.session.async_payment_failed", "unpaid", false],
  ])("handles %s / %s without counting unpaid checkouts", async (type, paymentStatus, paid) => {
    const secret = "whsec_test";
    const provider = new StripeDepositPaymentProvider({ secretKey: "sk_test", webhookSecret: secret });
    const payload = JSON.stringify({ id: "evt_1", type, created: 1_780_316_520, object: "event", data: { object: {
      id: "cs_test", object: "checkout.session", payment_status: paymentStatus,
      amount_total: 10_000, currency: "eur", metadata: { chatgptMeasurementConsent: "granted-v1", chatgptConsentId: "consent-1" },
    } } });
    const result = await provider.parseWebhook({ rawBody: payload, signature: Stripe.webhooks.generateTestHeaderString({ payload, secret }) });
    if (paid) expect(result).toMatchObject({ eventType: "checkout.session.completed", adsAttribution: { consentGranted: true, consentId: "consent-1" } });
    else expect(result).not.toHaveProperty("adsAttribution");
    if (type === "checkout.session.completed" && !paid) expect(result).not.toHaveProperty("providerSessionId");
  });

  it("verifies and normalizes checkout session completed webhooks", async () => {
    const webhookSecret = "whsec_test_secret";
    const provider = new StripeDepositPaymentProvider({
      secretKey: "sk_test_123",
      webhookSecret,
    });
    const payload = JSON.stringify({
      created: 1_780_316_520,
      data: {
        object: {
          amount_total: 10_000,
          currency: "eur",
          id: "cs_test_123",
          metadata: {
            bookingId: "booking-1",
            paymentRecordId: "payment-booking-1",
          },
          object: "checkout.session",
          payment_intent: "pi_test_123",
          payment_status: "paid",
        },
      },
      id: "evt_test_123",
      object: "event",
      type: "checkout.session.completed",
    });
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    await expect(
      provider.parseWebhook({
        rawBody: payload,
        signature,
      }),
    ).resolves.toMatchObject({
      amountTotalMinor: 10_000,
      bookingId: "booking-1",
      currency: "eur",
      eventId: "evt_test_123",
      eventType: "checkout.session.completed",
      paymentRecordId: "payment-booking-1",
      provider: "STRIPE",
      providerPaymentIntentId: "pi_test_123",
      providerSessionId: "cs_test_123",
    });
  });
});
