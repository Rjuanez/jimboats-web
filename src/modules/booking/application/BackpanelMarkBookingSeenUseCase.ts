import type {
  BackpanelMarkBookingSeenCommand,
  BackpanelMarkBookingSeenDto,
} from "./AdminBookingDtos";
import type { BookingClock } from "./ports/BookingClock";
import type { BookingRepository } from "./ports/BookingRepository";

export class BackpanelMarkBookingSeenUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly clock: BookingClock,
  ) {}

  async execute(
    command: BackpanelMarkBookingSeenCommand,
  ): Promise<BackpanelMarkBookingSeenDto> {
    const seenAt = this.clock.now();
    const status = await this.bookings.markOperationsSeen({
      bookingId: command.bookingId,
      seenAt,
    });

    return {
      bookingId: command.bookingId,
      seenAt: seenAt.toISOString(),
      status,
    };
  }
}
