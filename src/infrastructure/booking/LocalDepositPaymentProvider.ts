import { createHmac, randomUUID } from "node:crypto";
import type {
  DepositPaymentProvider,
  DepositPaymentWebhookEvent,
} from "@/modules/booking/application/ports/DepositPaymentProvider";
import type { BookingPaymentReadModel } from "@/modules/booking/application/ports/BookingRepository";
import type { LocalPaymentSimulator } from "@/modules/booking/application/HourlyBookingUseCase";

/** Isolated local simulator. Never sends money or calls Stripe. */
export class LocalDepositPaymentProvider
  implements DepositPaymentProvider, LocalPaymentSimulator
{
  private readonly signingKey = randomUUID();
  async createCheckoutSession() {
    return {
      clientSecret: "local-simulation",
      providerSessionId: `local_${randomUUID()}`,
    };
  }
  createSimulationEvent({ booking, paymentRecord }: BookingPaymentReadModel) {
    const payment = paymentRecord.toSnapshot();
    if (!payment.providerSessionId?.startsWith("local_"))
      throw new Error("Not a local payment session.");
    const rawBody = JSON.stringify({
      amountTotalMinor: payment.amount.amountMinor,
      bookingId: booking.id,
      currency: payment.amount.currency,
      eventId: `local-completed-${payment.providerSessionId}`,
      eventType: "checkout.session.completed",
      occurredAt: new Date().toISOString(),
      paymentRecordId: payment.id,
      provider: "STRIPE",
      providerPaymentIntentId: `simulated-${payment.id}`,
      providerSessionId: payment.providerSessionId,
      rawPayload: { simulated: true },
    });
    return { rawBody, signature: this.sign(rawBody) };
  }
  async parseWebhook(input: {
    rawBody: string;
    signature: string | null;
  }): Promise<DepositPaymentWebhookEvent> {
    if (input.signature !== this.sign(input.rawBody))
      throw new Error("Invalid local simulation signature.");
    const event = JSON.parse(input.rawBody);
    return { ...event, occurredAt: new Date(event.occurredAt) };
  }
  private sign(body: string) {
    return createHmac("sha256", this.signingKey).update(body).digest("hex");
  }
}
