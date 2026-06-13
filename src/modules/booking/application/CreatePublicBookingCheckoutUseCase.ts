import { ApplicationError } from "@/shared/application/ApplicationError";

import {
  collectSelectedExtraIds,
  planBackpanelBooking,
} from "./BookingAdminPlanning";
import type { BookingClock } from "./ports/BookingClock";
import type { BookingIdGenerator } from "./ports/BookingIdGenerator";
import type { BookingRepository } from "./ports/BookingRepository";
import type { BookingCalendarBlockWriteModel } from "./ports/BookingRepository";
import type { CancellationPolicyRepository } from "./ports/CancellationPolicyRepository";
import type { DepositPaymentProvider } from "./ports/DepositPaymentProvider";
import type {
  CreatePublicBookingCheckoutCommand,
  PublicBookingCheckoutDto,
} from "./PublicCheckoutDtos";
import { Booking } from "../domain/Booking";
import { BookingNotificationPreferences } from "../domain/BookingNotificationPreferences";
import { CustomerDetails } from "../domain/CustomerDetails";
import { PaymentRecord } from "../domain/PaymentRecord";

const checkoutHoldMinutes = 30;
const publicCheckoutActorId = "public-checkout";

export class CreatePublicBookingCheckoutUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly ids: BookingIdGenerator,
    private readonly clock: BookingClock,
    private readonly paymentProvider: DepositPaymentProvider,
    private readonly cancellationPolicies?: CancellationPolicyRepository,
  ) {}

  async execute(
    command: CreatePublicBookingCheckoutCommand,
  ): Promise<PublicBookingCheckoutDto> {
    const now = this.clock.now();
    const experience = await this.bookings.findExperienceOptionById(
      command.experienceId,
    );

    if (!experience || experience.status !== "PUBLISHED") {
      throw new ApplicationError(
        "BOOKING_EXPERIENCE_NOT_BOOKABLE",
        "Selected experience is not available for public checkout.",
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
    );

    if (overlaps.length > 0) {
      throw new ApplicationError(
        "CALENDAR_BLOCK_OVERLAP",
        "This departure time is no longer available.",
      );
    }

    const bookingId = this.ids.newBookingId();
    const calendarBlockId = this.ids.newCalendarBlockId({ bookingId });
    const paymentRecordId = this.ids.newPaymentRecordId({ bookingId });
    const cancellationPolicySnapshot =
      await this.cancellationPolicies?.findActiveBookingSnapshotForExperience(
        experience.id,
      ) ?? null;
    const holdExpiresAt = new Date(
      now.getTime() + checkoutHoldMinutes * 60_000,
    );
    const paymentRecord = PaymentRecord.createStripePendingDeposit({
      amount: plan.priceSnapshot.depositAmount,
      bookingId,
      createdAt: now,
      id: paymentRecordId,
    });
    const customer = CustomerDetails.create({
      email: command.customer.email,
      fullName: command.customer.fullName,
      notes: "",
      phone: command.customer.phone,
      preferredLocale: command.customer.preferredLocale,
    });
    const booking = Booking.createPublicPending({
      calendarBlockId,
      createdAt: now,
      customer,
      experienceId: experience.id,
      experienceNameSnapshot: experience.internalName,
      guestCount: command.guestCount,
      holdExpiresAt,
      id: bookingId,
      paymentRecord,
      priceSnapshot: plan.priceSnapshot,
      reference: this.ids.newBookingReference({ now }),
      selectedSlot: plan.selectedSlot,
      cancellationPolicySnapshot,
    });
    const checkoutSession = await this.paymentProvider.createCheckoutSession({
      amount: plan.priceSnapshot.depositAmount.toSnapshot(),
      bookingId,
      customer: {
        email: command.customer.email,
        fullName: command.customer.fullName,
        phone: command.customer.phone,
      },
      experienceName: experience.internalName,
      expiresAt: holdExpiresAt,
      locale: command.customer.preferredLocale,
      paymentRecordId,
      reference: booking.reference,
      returnUrl: command.returnUrl,
    });
    const paymentRecordWithSession = paymentRecord.withCheckoutSession({
      providerSessionId: checkoutSession.providerSessionId,
    });

    await this.bookings.savePublicPendingBooking({
      booking,
      calendarBlock: createPublicCheckoutCalendarHold({
        bookingId,
        blockId: calendarBlockId,
        createdAt: now,
        experienceId: experience.id,
        holdExpiresAt,
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
      notificationPreferences: BookingNotificationPreferences.create({
        consentCapturedAt: now,
        consentNotes: consentNotesFromCommand(command),
        consentSource: "CHECKOUT",
        email: {
          consentStatus: command.consents.ticketEmail ? "GRANTED" : "NOT_ASKED",
          destination: command.customer.email,
          enabled: command.consents.ticketEmail,
        },
        preferredLocale: command.customer.preferredLocale,
        whatsapp: {
          consentStatus: command.consents.ticketWhatsapp
            ? "GRANTED"
            : "NOT_ASKED",
          destination: command.customer.phone,
          enabled: command.consents.ticketWhatsapp,
        },
      }),
      paymentRecord: paymentRecordWithSession,
    });

    return {
      bookingId,
      checkoutClientSecret: checkoutSession.clientSecret,
      holdExpiresAt: holdExpiresAt.toISOString(),
      paymentProviderSessionId: checkoutSession.providerSessionId,
      reference: booking.reference,
    };
  }
}

function createPublicCheckoutCalendarHold(input: {
  bookingId: string;
  blockId: string;
  createdAt: Date;
  experienceId: string;
  holdExpiresAt: Date;
  plan: ReturnType<typeof planBackpanelBooking>;
  reference: string;
}): BookingCalendarBlockWriteModel {
  return {
    bookingId: input.bookingId,
    createdAt: input.createdAt,
    createdByUserId: publicCheckoutActorId,
    experienceId: input.experienceId,
    expiresAt: input.holdExpiresAt,
    id: input.blockId,
    localDate: input.plan.selectedSlot.localDate,
    protectedEndAt: input.plan.protectedEndAt,
    protectedStartAt: input.plan.protectedStartAt,
    reason: `Checkout hold ${input.reference}`,
    source: "BOOKING_HOLD",
    status: "ACTIVE",
    timeZone: input.plan.selectedSlot.timeZone,
    updatedAt: input.createdAt,
    visibleEndMinutes: input.plan.selectedSlot.endMinutes,
    visibleStartMinutes: input.plan.selectedSlot.startMinutes,
  };
}

function consentNotesFromCommand(command: CreatePublicBookingCheckoutCommand) {
  return [
    "Accepted during checkout.",
    `Ticket email: ${command.consents.ticketEmail ? "granted" : "not asked"}.`,
    `Ticket WhatsApp: ${
      command.consents.ticketWhatsapp ? "granted" : "not asked"
    }.`,
    `Marketing: ${command.consents.marketing ? "granted" : "not asked"}.`,
  ].join(" ");
}
