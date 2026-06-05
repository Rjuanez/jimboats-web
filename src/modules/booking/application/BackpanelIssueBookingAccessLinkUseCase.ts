import { applicationError } from "@/shared/application/ApplicationError";

import type {
  BackpanelIssueBookingAccessLinkCommand,
  BackpanelIssuedBookingAccessLinkDto,
} from "./AdminBookingDtos";
import { IssueBookingAccessLinkUseCase } from "./IssueBookingAccessLinkUseCase";
import type { BookingClock } from "./ports/BookingClock";
import type { BookingRepository } from "./ports/BookingRepository";

export class BackpanelIssueBookingAccessLinkUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly issueAccessLink: IssueBookingAccessLinkUseCase,
    private readonly clock: BookingClock,
  ) {}

  async execute(
    command: BackpanelIssueBookingAccessLinkCommand,
  ): Promise<BackpanelIssuedBookingAccessLinkDto> {
    const booking = await this.bookings.findById(command.bookingId);

    if (!booking) {
      throw applicationError("BOOKING_NOT_FOUND", "Booking was not found.");
    }

    const snapshot = booking.toSnapshot();

    return this.issueAccessLink.execute({
      bookingId: snapshot.id,
      issuedAt: this.clock.now(),
      locale: snapshot.customer.preferredLocale,
      reference: snapshot.reference,
    });
  }
}
