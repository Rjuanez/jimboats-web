import { ApplicationError } from "@/shared/application/ApplicationError";

import type { BookingRepository } from "./ports/BookingRepository";
import { IssueBookingAccessLinkUseCase } from "./IssueBookingAccessLinkUseCase";
import type { BookingClock } from "./ports/BookingClock";
import type {
  GetPublicBookingCheckoutReturnQuery,
  PublicBookingCheckoutReturnDto,
} from "./PublicCheckoutDtos";

export class GetPublicBookingCheckoutReturnUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly issueAccessLink: IssueBookingAccessLinkUseCase,
    private readonly clock: BookingClock,
  ) {}

  async execute(
    query: GetPublicBookingCheckoutReturnQuery,
  ): Promise<PublicBookingCheckoutReturnDto> {
    const providerSessionId = query.providerSessionId.trim();

    if (!providerSessionId) {
      throw new ApplicationError(
        "BOOKING_PAYMENT_SESSION_MISSING",
        "Checkout session is required.",
      );
    }

    const bookingPayment =
      await this.bookings.findByPaymentProviderSessionId(providerSessionId);

    if (!bookingPayment) {
      throw new ApplicationError(
        "BOOKING_PAYMENT_SESSION_NOT_FOUND",
        "Checkout session was not found.",
      );
    }

    const booking = bookingPayment.booking.toSnapshot();
    const payment = bookingPayment.paymentRecord.toSnapshot();
    const bookingAccessUrl =
      booking.status === "CONFIRMED"
        ? (
            await this.issueAccessLink.execute({
              bookingId: booking.id,
              issuedAt: this.clock.now(),
              locale: booking.customer.preferredLocale,
              reference: booking.reference,
            })
          ).url
        : null;

    return {
      bookingAccessUrl,
      bookingId: booking.id,
      customerEmail: booking.customer.email,
      experienceTitle: booking.experienceNameSnapshot,
      paidDepositAmount:
        payment.status === "SUCCEEDED" ? payment.amount.amountMinor : 0,
      reference: booking.reference,
      remainingAmount: booking.priceSnapshot.remainingAmount.amountMinor,
      status: booking.status,
    };
  }
}
