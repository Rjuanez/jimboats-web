import { ApplicationError } from "@/shared/application/ApplicationError";

import { createPublicBookingConfirmedRecords } from "./BookingLifecycleRecords";
import type { BookingClock } from "./ports/BookingClock";
import type { BookingJsonValue } from "./ports/BookingRepository";
import type { BookingRepository } from "./ports/BookingRepository";
import type {
  DepositPaymentProvider,
  DepositPaymentWebhookEvent,
} from "./ports/DepositPaymentProvider";
import type {
  DepositPaymentWebhookResultDto,
  HandleDepositPaymentWebhookCommand,
} from "./PublicCheckoutDtos";
import type { PaymentRecord } from "../domain/PaymentRecord";

type ProcessableDepositPaymentWebhookEvent = Extract<
  DepositPaymentWebhookEvent,
  { providerSessionId: string }
>;

export class HandleDepositPaymentWebhookUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly clock: BookingClock,
    private readonly paymentProvider: DepositPaymentProvider,
  ) {}

  async execute(
    command: HandleDepositPaymentWebhookCommand,
  ): Promise<DepositPaymentWebhookResultDto> {
    const event = await this.paymentProvider.parseWebhook(command);

    if (!("providerSessionId" in event)) {
      return {
        action: "IGNORED",
        bookingId: null,
        eventType: event.eventType,
      };
    }

    const bookingPayment = await this.bookings.findByPaymentProviderSessionId(
      event.providerSessionId,
    );

    if (!bookingPayment) {
      return {
        action: "IGNORED",
        bookingId: event.bookingId,
        eventType: event.eventType,
      };
    }

    const bookingSnapshot = bookingPayment.booking.toSnapshot();

    if (event.eventType === "checkout.session.completed") {
      if (bookingSnapshot.status === "CONFIRMED") {
        return {
          action: "DUPLICATE",
          bookingId: bookingSnapshot.id,
          eventType: event.eventType,
        };
      }

      assertPendingPayment(bookingSnapshot.status);
      assertProviderSessionMatchesPayment(bookingPayment.paymentRecord, event);

      if (!isExpectedDepositPayment(bookingPayment.paymentRecord, event)) {
        return this.markPaymentFailed({
          bookingPayment,
          event,
          failureReason:
            "Stripe checkout completed with an unexpected deposit amount.",
        });
      }

      const confirmedAt = event.occurredAt;
      const confirmedBooking = bookingPayment.booking.confirmDepositPayment({
        confirmedAt,
      });
      const succeededPayment = bookingPayment.paymentRecord.markSucceeded({
        paidAt: confirmedAt,
        providerPaymentIntentId: event.providerPaymentIntentId,
        providerSessionId: event.providerSessionId,
      });
      const lifecycleRecords = createPublicBookingConfirmedRecords({
        booking: confirmedBooking,
        occurredAt: confirmedAt,
      });
      const result = await this.bookings.saveDepositPaymentSucceeded({
        auditEntries: lifecycleRecords.auditEntries,
        booking: confirmedBooking,
        calendarBlockId: bookingSnapshot.calendarBlockId,
        outboxEvents: lifecycleRecords.outboxEvents,
        paymentRecord: succeededPayment,
        providerEvent: providerEventFromWebhook({
          event,
          processedAt: this.clock.now(),
          status: "PROCESSED",
        }),
      });

      return {
        action: result,
        bookingId: bookingSnapshot.id,
        eventType: event.eventType,
      };
    }

    if (
      event.eventType === "checkout.session.async_payment_failed" ||
      event.eventType === "checkout.session.expired"
    ) {
      if (bookingSnapshot.status !== "PENDING_PAYMENT") {
        return {
          action: "IGNORED",
          bookingId: bookingSnapshot.id,
          eventType: event.eventType,
        };
      }

      return this.markPaymentFailed({
        bookingPayment,
        event,
        failureReason: event.failureReason,
      });
    }

    return {
      action: "IGNORED",
      bookingId: bookingSnapshot.id,
      eventType: event.eventType,
    };
  }

  private async markPaymentFailed(input: {
    bookingPayment: NonNullable<
      Awaited<ReturnType<BookingRepository["findByPaymentProviderSessionId"]>>
    >;
    event: ProcessableDepositPaymentWebhookEvent;
    failureReason: string;
  }): Promise<DepositPaymentWebhookResultDto> {
    const now = this.clock.now();
    const bookingSnapshot = input.bookingPayment.booking.toSnapshot();
    const expired =
      input.event.eventType === "checkout.session.expired";
    const failedBooking = expired
      ? input.bookingPayment.booking.expirePaymentHold({ expiredAt: now })
      : input.bookingPayment.booking.markPaymentFailed({ failedAt: now });
    const failedPayment = expired
      ? input.bookingPayment.paymentRecord.markCancelled({
          failureReason: input.failureReason,
          providerPaymentIntentId: input.event.providerPaymentIntentId,
          providerSessionId: input.event.providerSessionId,
        })
      : input.bookingPayment.paymentRecord.markFailed({
          failureReason: input.failureReason,
          providerPaymentIntentId: input.event.providerPaymentIntentId,
          providerSessionId: input.event.providerSessionId,
        });
    const result = await this.bookings.saveDepositPaymentFailed({
      booking: failedBooking,
      calendarBlockId: bookingSnapshot.calendarBlockId,
      paymentRecord: failedPayment,
      providerEvent: providerEventFromWebhook({
        event: input.event,
        processedAt: now,
        status: "FAILED",
      }),
      releasedAt: now,
    });

    return {
      action: result,
      bookingId: bookingSnapshot.id,
      eventType: input.event.eventType,
    };
  }
}

function assertPendingPayment(status: string) {
  if (status !== "PENDING_PAYMENT") {
    throw new ApplicationError(
      "BOOKING_PAYMENT_NOT_PENDING",
      "Booking payment is not pending.",
    );
  }
}

function assertProviderSessionMatchesPayment(
  paymentRecord: PaymentRecord,
  event: { providerSessionId: string },
) {
  const snapshot = paymentRecord.toSnapshot();

  if (snapshot.providerSessionId !== event.providerSessionId) {
    throw new ApplicationError(
      "BOOKING_PAYMENT_PROVIDER_MISMATCH",
      "Stripe checkout session does not match the booking payment.",
    );
  }
}

function isExpectedDepositPayment(
  paymentRecord: PaymentRecord,
  event: {
    amountTotalMinor: number | null;
    currency: string | null;
  },
) {
  const snapshot = paymentRecord.toSnapshot();

  return (
    event.amountTotalMinor === snapshot.amount.amountMinor &&
    event.currency?.toUpperCase() === snapshot.amount.currency
  );
}

function providerEventFromWebhook(input: {
  event: {
    eventId: string;
    eventType: string;
    occurredAt: Date;
    provider: "STRIPE";
    rawPayload: Record<string, unknown>;
  };
  processedAt: Date;
  status: "FAILED" | "IGNORED" | "PROCESSED";
}) {
  return {
    eventType: input.event.eventType,
    payload: toJsonValue(input.event.rawPayload),
    processedAt: input.processedAt,
    provider: input.event.provider,
    providerEventId: input.event.eventId,
    receivedAt: input.event.occurredAt,
    status: input.status,
  };
}

function toJsonValue(value: unknown): BookingJsonValue {
  return JSON.parse(JSON.stringify(value)) as BookingJsonValue;
}
