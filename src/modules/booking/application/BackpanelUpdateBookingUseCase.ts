import { Money } from "@/shared/domain/Money";
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

  async execute(
    command: BackpanelUpdateBookingCommand,
  ): Promise<AdminBookingDto> {
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
    // Keep the agreed base price for the same duration and the deposit already paid.
    // A duration change uses its current tariff, without rewriting payment history.
    const experienceForUpdate =
      experience.hourlyRates !== undefined
        ? {
            ...experience,
            hourlyRates: [
              ...experience.hourlyRates
                .filter(
                  (rate) =>
                    rate.hours !==
                    currentSnapshot.selectedSlot.durationMinutes / 60,
                )
                .map((rate) => ({
                  ...rate,
                  deposit: {
                    ...experience.depositAmount,
                    amountMinor: Math.min(
                      experience.depositAmount.amountMinor,
                      currentSnapshot.priceSnapshot.basePrice.amountMinor,
                    ),
                  },
                })),
              {
                hours: currentSnapshot.selectedSlot.durationMinutes / 60,
                total: currentSnapshot.priceSnapshot.basePrice,
                deposit: {
                  ...experience.depositAmount,
                  amountMinor: Math.min(
                    experience.depositAmount.amountMinor,
                    currentSnapshot.priceSnapshot.basePrice.amountMinor,
                  ),
                },
              },
            ],
          }
        : experience;
    const plan = planBackpanelBooking({
      command,
      experience: experienceForUpdate,
      extraOptions,
      now,
    });
    const sameDuration =
      plan.selectedSlot.durationMinutes ===
      currentSnapshot.selectedSlot.durationMinutes;
    const sameExtras =
      plan.selectedExtras.length ===
        currentSnapshot.priceSnapshot.extraLines.length &&
      plan.selectedExtras.every((selected) =>
        currentSnapshot.priceSnapshot.extraLines.some(
          (line) =>
            line.extraId === selected.extraId &&
            line.quantity === selected.quantity,
        ),
      );
    // Operational edits preserve the agreed extras, discount and payment, even if current prices changed.
    plan.priceSnapshot =
      sameDuration && sameExtras
        ? current.priceSnapshot
        : plan.priceSnapshot.withUpfrontPayment(
            Money.create(currentSnapshot.priceSnapshot.depositAmount),
          );
    const overlaps = await this.bookings.findActiveCalendarOverlaps(
      experience.hourlyRates !== undefined
        ? plan.protectedStartAt
        : plan.selectedStartAt,
      experience.hourlyRates !== undefined
        ? plan.protectedEndAt
        : plan.selectedEndAt,
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
