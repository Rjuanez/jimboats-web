import Stripe from "stripe";

import type {
  DepositCheckoutSessionCommand,
  DepositPaymentProvider,
  DepositPaymentWebhookEvent,
} from "@/modules/booking/application/ports/DepositPaymentProvider";

export type StripeDepositPaymentProviderConfig = {
  secretKey: string;
  webhookSecret: string;
};

export class StripeDepositPaymentProvider implements DepositPaymentProvider {
  private readonly stripe: Stripe;

  constructor(private readonly config: StripeDepositPaymentProviderConfig) {
    this.stripe = new Stripe(config.secretKey);
  }

  async createCheckoutSession(command: DepositCheckoutSessionCommand) {
    const session = await this.stripe.checkout.sessions.create({
      customer_email: command.customer.email,
      expires_at: Math.floor(command.expiresAt.getTime() / 1000),
      line_items: [
        {
          price_data: {
            currency: command.amount.currency.toLowerCase(),
            product_data: {
              description: `${command.reference} deposit for ${command.experienceName}. Remaining balance is paid onboard in cash.`,
              name: `${command.experienceName} deposit`,
            },
            unit_amount: command.amount.amountMinor,
          },
          quantity: 1,
        },
      ],
      locale: stripeLocale(command.locale),
      metadata: metadataFromCommand(command),
      mode: "payment",
      payment_intent_data: {
        metadata: metadataFromCommand(command),
      },
      redirect_on_completion: "if_required",
      return_url: command.returnUrl,
      ui_mode: "embedded_page",
    });

    if (!session.client_secret) {
      throw new Error("Stripe did not return an embedded Checkout client secret.");
    }

    return {
      clientSecret: session.client_secret,
      providerSessionId: session.id,
    };
  }

  async parseWebhook(input: {
    rawBody: string;
    signature: string | null;
  }): Promise<DepositPaymentWebhookEvent> {
    if (!input.signature) {
      throw new Error("Stripe webhook signature is missing.");
    }

    const event = this.stripe.webhooks.constructEvent(
      input.rawBody,
      input.signature,
      this.config.webhookSecret,
    );
    const occurredAt = new Date(event.created * 1000);

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      const baseEvent = {
        amountTotalMinor: session.amount_total ?? null,
        bookingId: stringMetadata(session.metadata, "bookingId"),
        currency: session.currency ?? null,
        eventId: event.id,
        occurredAt,
        paymentRecordId: stringMetadata(session.metadata, "paymentRecordId"),
        provider: "STRIPE" as const,
        providerPaymentIntentId: paymentIntentId,
        providerSessionId: session.id,
        rawPayload: rawPayload(event),
      };

      if (event.type === "checkout.session.completed") {
        return {
          ...baseEvent,
          eventType: event.type,
        };
      }

      return {
        ...baseEvent,
        eventType: event.type,
        failureReason:
          event.type === "checkout.session.expired"
            ? "Stripe checkout session expired."
            : "Stripe checkout payment failed asynchronously.",
      };
    }

    return {
      eventId: event.id,
      eventType: event.type,
      occurredAt,
      provider: "STRIPE",
      rawPayload: rawPayload(event),
    };
  }
}

export function createStripeDepositPaymentProviderFromEnv() {
  return new StripeDepositPaymentProvider({
    secretKey: requiredEnv("STRIPE_SECRET_KEY"),
    webhookSecret: requiredEnv("STRIPE_WEBHOOK_SECRET"),
  });
}

function metadataFromCommand(command: DepositCheckoutSessionCommand) {
  return {
    bookingId: command.bookingId,
    paymentRecordId: command.paymentRecordId,
    reference: command.reference,
  };
}

function stripeLocale(locale: string): Stripe.Checkout.SessionCreateParams.Locale {
  if (locale === "ca" || locale === "es") {
    return "es";
  }

  return "en";
}

function stringMetadata(
  metadata: Stripe.Metadata | null,
  key: string,
): string | null {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function rawPayload(event: Stripe.Event): Record<string, unknown> {
  return JSON.parse(JSON.stringify(event)) as Record<string, unknown>;
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}
