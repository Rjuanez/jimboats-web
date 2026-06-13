import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminBookingDto,
  BackpanelCreateBookingCommand,
} from "./AdminBookingDtos";
import {
  collectSelectedExtraIds,
  createBookingCalendarBlockWriteModel,
  planBackpanelBooking,
} from "./BookingAdminPlanning";
import type { BookingCalendarSynchronizer } from "./BookingCalendarSyncService";
import { bookingToAdminDto } from "./BookingApplicationMappers";
import { createBackpanelBookingCreatedRecords } from "./BookingLifecycleRecords";
import type { BookingClock } from "./ports/BookingClock";
import type { BookingIdGenerator } from "./ports/BookingIdGenerator";
import type { BookingRepository } from "./ports/BookingRepository";
import type { CancellationPolicyRepository } from "./ports/CancellationPolicyRepository";
import { Booking } from "../domain/Booking";
import { CustomerDetails } from "../domain/CustomerDetails";
import { PaymentRecord } from "../domain/PaymentRecord";

export class BackpanelCreateBookingUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly ids: BookingIdGenerator,
    private readonly clock: BookingClock,
    private readonly cancellationPolicies?: CancellationPolicyRepository,
    private readonly bookingCalendarSync?: BookingCalendarSynchronizer,
  ) {}

  async execute(command: BackpanelCreateBookingCommand): Promise<AdminBookingDto> {
    const now = this.clock.now();
    const experience = await this.bookings.findExperienceOptionById(
      command.experienceId,
    );

    if (!experience) {
      throw new ApplicationError(
        "EXPERIENCE_NOT_FOUND",
        "Selected experience was not found.",
      );
    }

    if (experience.status === "ARCHIVED") {
      throw new ApplicationError(
        "BOOKING_EXPERIENCE_NOT_BOOKABLE",
        "Archived experiences cannot receive new bookings.",
      );
    }

    const extraOptions = await this.bookings.findExtraOptionsByIds(
      collectSelectedExtraIds(command),
    );
    const plan = planBackpanelBooking({
      command,
      extraOptions,
      experience,
      now,
    });
    const overlaps = await this.bookings.findActiveCalendarOverlaps(
      plan.selectedStartAt,
      plan.selectedEndAt,
    );

    if (overlaps.length > 0) {
      throw new ApplicationError(
        "CALENDAR_BLOCK_OVERLAP",
        "This booking overlaps an active boat block.",
      );
    }

    const bookingId = this.ids.newBookingId();
    const calendarBlockId = this.ids.newCalendarBlockId({ bookingId });
    const paymentRecordId = this.ids.newPaymentRecordId({ bookingId });
    const cancellationPolicySnapshot =
      await this.cancellationPolicies?.findActiveBookingSnapshotForExperience(
        experience.id,
      ) ?? null;
    const paymentRecord = PaymentRecord.createManualDeposit({
      amount: plan.priceSnapshot.depositAmount,
      bookingId,
      createdAt: now,
      id: paymentRecordId,
      paidAt: now,
    });
    const booking = Booking.createBackpanelConfirmed({
      calendarBlockId,
      createdAt: now,
      createdByUserId: command.createdByUserId,
      customer: CustomerDetails.create(command.customer),
      experienceId: experience.id,
      experienceNameSnapshot: experience.internalName,
      guestCount: command.guestCount,
      id: bookingId,
      internalNotes: command.internalNotes,
      paymentRecord,
      priceSnapshot: plan.priceSnapshot,
      reference: this.ids.newBookingReference({ now }),
      selectedSlot: plan.selectedSlot,
      cancellationPolicySnapshot,
    });
    const lifecycleRecords = createBackpanelBookingCreatedRecords({
      actorUserId: command.createdByUserId,
      booking,
      occurredAt: now,
    });

    await this.bookings.saveAdminCreatedBooking({
      auditEntries: lifecycleRecords.auditEntries,
      booking,
      calendarBlock: createBookingCalendarBlockWriteModel({
        bookingId,
        blockId: calendarBlockId,
        createdAt: now,
        createdByUserId: command.createdByUserId,
        experienceId: experience.id,
        plan,
        reference: booking.reference,
      }),
      extraLineIds: new Map(
        plan.priceSnapshot.toSnapshot().extraLines.map((line) => [
          line.extraId,
          this.ids.newBookingExtraLineId({
            bookingId,
            extraId: line.extraId,
          }),
        ]),
      ),
      outboxEvents: lifecycleRecords.outboxEvents,
      paymentRecord,
    });

    await this.bookingCalendarSync?.syncConfirmedBooking(booking);

    return bookingToAdminDto(booking);
  }
}
