import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminBookingDto,
  BackpanelUpdateBookingCommand,
} from "./AdminBookingDtos";
import {
  collectSelectedExtraIds,
  createBookingCalendarBlockUpdateModel,
  planBackpanelBooking,
} from "./BookingAdminPlanning";
import type { BookingCalendarSynchronizer } from "./BookingCalendarSyncService";
import { bookingToAdminDto } from "./BookingApplicationMappers";
import { createBackpanelBookingUpdatedRecords } from "./BookingLifecycleRecords";
import type { BookingClock } from "./ports/BookingClock";
import type { BookingIdGenerator } from "./ports/BookingIdGenerator";
import type { BookingRepository } from "./ports/BookingRepository";
import { CustomerDetails } from "../domain/CustomerDetails";

export class BackpanelUpdateBookingUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly ids: BookingIdGenerator,
    private readonly clock: BookingClock,
    private readonly bookingCalendarSync?: BookingCalendarSynchronizer,
  ) {}

  async execute(command: BackpanelUpdateBookingCommand): Promise<AdminBookingDto> {
    const now = this.clock.now();
    const current = await this.bookings.findById(command.bookingId);

    if (!current) {
      throw new ApplicationError("BOOKING_NOT_FOUND", "Booking was not found.");
    }

    if (current.status === "CANCELLED") {
      throw new ApplicationError(
        "BOOKING_ALREADY_CANCELLED",
        "Cancelled bookings cannot be edited.",
      );
    }

    if (current.status !== "CONFIRMED") {
      throw new ApplicationError(
        "BOOKING_NOT_EDITABLE",
        "Only confirmed bookings can be edited from the backpanel.",
      );
    }

    const currentSnapshot = current.toSnapshot();
    const experience = await this.bookings.findExperienceOptionById(
      currentSnapshot.experienceId,
    );

    if (!experience) {
      throw new ApplicationError(
        "EXPERIENCE_NOT_FOUND",
        "Booking experience was not found.",
      );
    }

    const extraOptions = await this.bookings.findExtraOptionsByIds(
      collectSelectedExtraIds(command),
    );
    const plan = planBackpanelBooking({
      command,
      experience,
      extraOptions,
      now,
    });
    const overlaps = await this.bookings.findActiveCalendarOverlaps(
      plan.selectedStartAt,
      plan.selectedEndAt,
      {
        excludeBlockId: currentSnapshot.calendarBlockId,
      },
    );

    if (overlaps.length > 0) {
      throw new ApplicationError(
        "CALENDAR_BLOCK_OVERLAP",
        "This booking overlaps an active boat block.",
      );
    }

    const booking = current.updateOperationalDetails({
      customer: CustomerDetails.create(command.customer),
      guestCount: command.guestCount,
      internalNotes: command.internalNotes,
      priceSnapshot: plan.priceSnapshot,
      selectedSlot: plan.selectedSlot,
      updatedAt: now,
    });
    const lifecycleRecords = createBackpanelBookingUpdatedRecords({
      actorUserId: command.updatedByUserId,
      after: booking,
      before: current,
      occurredAt: now,
    });

    await this.bookings.saveAdminUpdatedBooking({
      auditEntries: lifecycleRecords.auditEntries,
      booking,
      calendarBlock: createBookingCalendarBlockUpdateModel({
        bookingId: booking.id,
        blockId: currentSnapshot.calendarBlockId,
        experienceId: currentSnapshot.experienceId,
        plan,
        reference: booking.reference,
        updatedAt: now,
      }),
      extraLineIds: new Map(
        plan.priceSnapshot.toSnapshot().extraLines.map((line) => [
          line.extraId,
          this.ids.newBookingExtraLineId({
            bookingId: booking.id,
            extraId: line.extraId,
          }),
        ]),
      ),
      outboxEvents: lifecycleRecords.outboxEvents,
    });

    await this.bookingCalendarSync?.syncConfirmedBooking(booking);

    return bookingToAdminDto(booking);
  }
}
