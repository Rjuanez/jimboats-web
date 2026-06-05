import type { MoneySnapshot } from "@/shared/domain/Money";

export type DepositCheckoutSessionCommand = {
  amount: MoneySnapshot;
  bookingId: string;
  customer: {
    email: string;
    fullName: string;
    phone: string | null;
  };
  experienceName: string;
  expiresAt: Date;
  locale: string;
  paymentRecordId: string;
  reference: string;
  returnUrl: string;
};

export type DepositCheckoutSessionResult = {
  clientSecret: string;
  providerSessionId: string;
};

export type DepositPaymentWebhookEvent =
  | {
      amountTotalMinor: number | null;
      bookingId: string | null;
      currency: string | null;
      eventId: string;
      eventType: "checkout.session.completed";
      occurredAt: Date;
      paymentRecordId: string | null;
      provider: "STRIPE";
      providerPaymentIntentId: string | null;
      providerSessionId: string;
      rawPayload: Record<string, unknown>;
    }
  | {
      amountTotalMinor: number | null;
      bookingId: string | null;
      currency: string | null;
      eventId: string;
      eventType:
        | "checkout.session.async_payment_failed"
        | "checkout.session.expired";
      failureReason: string;
      occurredAt: Date;
      paymentRecordId: string | null;
      provider: "STRIPE";
      providerPaymentIntentId: string | null;
      providerSessionId: string;
      rawPayload: Record<string, unknown>;
    }
  | {
      eventId: string;
      eventType: string;
      occurredAt: Date;
      provider: "STRIPE";
      rawPayload: Record<string, unknown>;
    };

export type DepositPaymentProvider = {
  createCheckoutSession(
    command: DepositCheckoutSessionCommand,
  ): Promise<DepositCheckoutSessionResult>;
  parseWebhook(input: {
    rawBody: string;
    signature: string | null;
  }): Promise<DepositPaymentWebhookEvent>;
};
