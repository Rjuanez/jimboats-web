import { domainError } from "@/shared/domain/DomainError";

import type { CustomerDetails, CustomerDetailsSnapshot } from "./CustomerDetails";
import type { PaymentRecord } from "./PaymentRecord";
import type { PriceSnapshot, PriceSnapshotSnapshot } from "./PriceSnapshot";
import type { SelectedSlot, SelectedSlotSnapshot } from "./SelectedSlot";
import type { BookingCancellationPolicySnapshot } from "./CancellationPolicy";

export type BookingStatus =
  | "CANCELLED"
  | "CONFIRMED"
  | "EXPIRED"
  | "EXITED"
  | "PAYMENT_FAILED"
  | "PENDING_PAYMENT";

export type BookingSource = "BACKPANEL" | "PUBLIC_CHECKOUT";

export type BookingProps = {
  calendarBlockId: string;
  cancelledAt: Date | null;
  cancellationPolicySnapshot?: BookingCancellationPolicySnapshot | null;
  checkoutLastSeenAt: Date | null;
  confirmedAt: Date | null;
  createdAt: Date;
  createdByUserId: string | null;
  customer: CustomerDetails;
  experienceId: string;
  experienceNameSnapshot: string;
  guestCount: number;
  holdExpiresAt: Date | null;
  id: string;
  internalNotes: string;
  paymentRecordId: string;
  priceSnapshot: PriceSnapshot;
  reference: string;
  selectedSlot: SelectedSlot;
  source: BookingSource;
  status: BookingStatus;
  updatedAt: Date;
};

export type BookingSnapshot = {
  calendarBlockId: string;
  cancelledAt: string | null;
  cancellationPolicySnapshot: BookingCancellationPolicySnapshot | null;
  checkoutLastSeenAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  createdByUserId: string | null;
  customer: CustomerDetailsSnapshot;
  experienceId: string;
  experienceNameSnapshot: string;
  guestCount: number;
  holdExpiresAt: string | null;
  id: string;
  internalNotes: string;
  paymentRecordId: string;
  priceSnapshot: PriceSnapshotSnapshot;
  reference: string;
  selectedSlot: SelectedSlotSnapshot;
  source: BookingSource;
  status: BookingStatus;
  updatedAt: string;
};

const supportedStatuses = new Set<BookingStatus>([
  "PENDING_PAYMENT",
  "CONFIRMED",
  "EXPIRED",
  "EXITED",
  "PAYMENT_FAILED",
  "CANCELLED",
]);
const supportedSources = new Set<BookingSource>(["BACKPANEL", "PUBLIC_CHECKOUT"]);

export class Booking {
  private constructor(private readonly props: BookingProps) {}

  static create(input: BookingProps) {
    const id = input.id.trim();
    const reference = normalizeReference(input.reference);
    const experienceId = input.experienceId.trim();
    const experienceNameSnapshot = normalizeText(input.experienceNameSnapshot);
    const calendarBlockId = input.calendarBlockId.trim();
    const paymentRecordId = input.paymentRecordId.trim();
    const createdByUserId = input.createdByUserId?.trim() || null;
    const internalNotes = normalizeText(input.internalNotes);

    if (!id) {
      throw domainError("BOOKING_ID_MISSING", "Booking id is required.");
    }

    if (!isValidReference(reference)) {
      throw domainError(
        "BOOKING_REFERENCE_INVALID",
        "Booking reference is invalid.",
      );
    }

    if (!experienceId || !experienceNameSnapshot) {
      throw domainError(
        "BOOKING_EXPERIENCE_MISSING",
        "Booking requires an experience snapshot.",
      );
    }

    if (!Number.isInteger(input.guestCount) || input.guestCount <= 0) {
      throw domainError(
        "BOOKING_GUEST_COUNT_INVALID",
        "Booking guest count must be positive.",
      );
    }

    if (!supportedStatuses.has(input.status)) {
      throw domainError("BOOKING_STATUS_INVALID", "Booking status is invalid.");
    }

    if (!supportedSources.has(input.source)) {
      throw domainError("BOOKING_STATUS_INVALID", "Booking source is invalid.");
    }

    if (input.status === "CONFIRMED") {
      if (!calendarBlockId) {
        throw domainError(
          "BOOKING_CALENDAR_BLOCK_MISSING",
          "Confirmed booking requires a calendar block.",
        );
      }

      if (!paymentRecordId) {
        throw domainError(
          "BOOKING_PAYMENT_RECORD_MISSING",
          "Confirmed booking requires a payment record.",
        );
      }

      if (!input.confirmedAt || Number.isNaN(input.confirmedAt.getTime())) {
        throw domainError(
          "BOOKING_STATUS_INVALID",
          "Confirmed booking requires a confirmation date.",
        );
      }
    }

    if (input.source === "PUBLIC_CHECKOUT" && input.status === "PENDING_PAYMENT") {
      if (!calendarBlockId || !paymentRecordId) {
        throw domainError(
          "BOOKING_HOLD_MISSING",
          "Public checkout bookings require a calendar hold and payment record.",
        );
      }

      if (!input.holdExpiresAt || Number.isNaN(input.holdExpiresAt.getTime())) {
        throw domainError(
          "BOOKING_HOLD_MISSING",
          "Public checkout bookings require a valid hold expiration.",
        );
      }
    }

    assertDate(input.createdAt, "Booking creation date is invalid.");
    assertDate(input.updatedAt, "Booking update date is invalid.");
    assertNullableDate(input.cancelledAt, "Booking cancellation date is invalid.");
    assertNullableDate(
      input.checkoutLastSeenAt,
      "Booking checkout heartbeat date is invalid.",
    );
    assertNullableDate(input.holdExpiresAt, "Booking hold expiration is invalid.");

    return new Booking({
      ...input,
      calendarBlockId,
      cancellationPolicySnapshot: input.cancellationPolicySnapshot ?? null,
      createdByUserId,
      experienceId,
      experienceNameSnapshot,
      id,
      internalNotes,
      paymentRecordId,
      reference,
    });
  }

  static createBackpanelConfirmed(input: {
    calendarBlockId: string;
    createdAt: Date;
    createdByUserId: string;
    customer: CustomerDetails;
    experienceId: string;
    experienceNameSnapshot: string;
    guestCount: number;
    id: string;
    internalNotes: string;
    paymentRecord: PaymentRecord;
    priceSnapshot: PriceSnapshot;
    reference: string;
    selectedSlot: SelectedSlot;
    cancellationPolicySnapshot?: BookingCancellationPolicySnapshot | null;
  }) {
    return Booking.create({
      calendarBlockId: input.calendarBlockId,
      cancelledAt: null,
      cancellationPolicySnapshot: input.cancellationPolicySnapshot ?? null,
      checkoutLastSeenAt: null,
      confirmedAt: input.createdAt,
      createdAt: input.createdAt,
      createdByUserId: input.createdByUserId,
      customer: input.customer,
      experienceId: input.experienceId,
      experienceNameSnapshot: input.experienceNameSnapshot,
      guestCount: input.guestCount,
      holdExpiresAt: null,
      id: input.id,
      internalNotes: input.internalNotes,
      paymentRecordId: input.paymentRecord.id,
      priceSnapshot: input.priceSnapshot,
      reference: input.reference,
      selectedSlot: input.selectedSlot,
      source: "BACKPANEL",
      status: "CONFIRMED",
      updatedAt: input.createdAt,
    });
  }

  static createPublicPending(input: {
    calendarBlockId: string;
    createdAt: Date;
    customer: CustomerDetails;
    experienceId: string;
    experienceNameSnapshot: string;
    guestCount: number;
    holdExpiresAt: Date;
    id: string;
    paymentRecord: PaymentRecord;
    priceSnapshot: PriceSnapshot;
    reference: string;
    selectedSlot: SelectedSlot;
    cancellationPolicySnapshot?: BookingCancellationPolicySnapshot | null;
  }) {
    return Booking.create({
      calendarBlockId: input.calendarBlockId,
      cancelledAt: null,
      cancellationPolicySnapshot: input.cancellationPolicySnapshot ?? null,
      checkoutLastSeenAt: input.createdAt,
      confirmedAt: null,
      createdAt: input.createdAt,
      createdByUserId: null,
      customer: input.customer,
      experienceId: input.experienceId,
      experienceNameSnapshot: input.experienceNameSnapshot,
      guestCount: input.guestCount,
      holdExpiresAt: input.holdExpiresAt,
      id: input.id,
      internalNotes: "",
      paymentRecordId: input.paymentRecord.id,
      priceSnapshot: input.priceSnapshot,
      reference: input.reference,
      selectedSlot: input.selectedSlot,
      source: "PUBLIC_CHECKOUT",
      status: "PENDING_PAYMENT",
      updatedAt: input.createdAt,
    });
  }

  get id() {
    return this.props.id;
  }

  get reference() {
    return this.props.reference;
  }

  get selectedSlot() {
    return this.props.selectedSlot;
  }

  get status() {
    return this.props.status;
  }

  updateOperationalDetails(input: {
    customer: CustomerDetails;
    guestCount: number;
    internalNotes: string;
    priceSnapshot: PriceSnapshot;
    selectedSlot: SelectedSlot;
    updatedAt: Date;
  }) {
    assertConfirmedEditable(this.props.status);

    return Booking.create({
      ...this.props,
      customer: input.customer,
      guestCount: input.guestCount,
      internalNotes: input.internalNotes,
      priceSnapshot: input.priceSnapshot,
      selectedSlot: input.selectedSlot,
      updatedAt: input.updatedAt,
    });
  }

  cancel(input: { cancelledAt: Date }) {
    assertConfirmedEditable(this.props.status);

    return Booking.create({
      ...this.props,
      cancelledAt: input.cancelledAt,
      status: "CANCELLED",
      updatedAt: input.cancelledAt,
    });
  }

  confirmDepositPayment(input: { confirmedAt: Date }) {
    assertPendingPayment(this.props.status);

    return Booking.create({
      ...this.props,
      confirmedAt: input.confirmedAt,
      checkoutLastSeenAt: null,
      holdExpiresAt: null,
      status: "CONFIRMED",
      updatedAt: input.confirmedAt,
    });
  }

  markPaymentFailed(input: { failedAt: Date }) {
    assertPendingPayment(this.props.status);

    return Booking.create({
      ...this.props,
      checkoutLastSeenAt: null,
      holdExpiresAt: null,
      status: "PAYMENT_FAILED",
      updatedAt: input.failedAt,
    });
  }

  expirePaymentHold(input: { expiredAt: Date }) {
    assertPendingPayment(this.props.status);

    return Booking.create({
      ...this.props,
      checkoutLastSeenAt: null,
      holdExpiresAt: null,
      status: "EXPIRED",
      updatedAt: input.expiredAt,
    });
  }

  exitPaymentHold(input: { exitedAt: Date }) {
    assertPendingPayment(this.props.status);

    return Booking.create({
      ...this.props,
      checkoutLastSeenAt: null,
      holdExpiresAt: null,
      status: "EXITED",
      updatedAt: input.exitedAt,
    });
  }

  touchPaymentHoldHeartbeat(input: { seenAt: Date }) {
    assertPendingPayment(this.props.status);

    return Booking.create({
      ...this.props,
      checkoutLastSeenAt: input.seenAt,
      updatedAt: input.seenAt,
    });
  }

  toSnapshot(): BookingSnapshot {
    return {
      calendarBlockId: this.props.calendarBlockId,
      cancelledAt: this.props.cancelledAt?.toISOString() ?? null,
      cancellationPolicySnapshot: this.props.cancellationPolicySnapshot
        ? {
            ...this.props.cancellationPolicySnapshot,
            summaries: { ...this.props.cancellationPolicySnapshot.summaries },
            tiers: this.props.cancellationPolicySnapshot.tiers.map((tier) => ({
              ...tier,
              refundAmount: tier.refundAmount ? { ...tier.refundAmount } : null,
            })),
          }
        : null,
      checkoutLastSeenAt: this.props.checkoutLastSeenAt?.toISOString() ?? null,
      confirmedAt: this.props.confirmedAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
      createdByUserId: this.props.createdByUserId,
      customer: this.props.customer.toSnapshot(),
      experienceId: this.props.experienceId,
      experienceNameSnapshot: this.props.experienceNameSnapshot,
      guestCount: this.props.guestCount,
      holdExpiresAt: this.props.holdExpiresAt?.toISOString() ?? null,
      id: this.props.id,
      internalNotes: this.props.internalNotes,
      paymentRecordId: this.props.paymentRecordId,
      priceSnapshot: this.props.priceSnapshot.toSnapshot(),
      reference: this.props.reference,
      selectedSlot: this.props.selectedSlot.toSnapshot(),
      source: this.props.source,
      status: this.props.status,
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

function assertConfirmedEditable(status: BookingStatus) {
  if (status !== "CONFIRMED") {
    throw domainError(
      "BOOKING_NOT_EDITABLE",
      "Only confirmed bookings can be edited from the backpanel.",
    );
  }
}

function assertPendingPayment(status: BookingStatus) {
  if (status !== "PENDING_PAYMENT") {
    throw domainError(
      "BOOKING_PAYMENT_NOT_PENDING",
      "Only pending payment bookings can receive deposit payment updates.",
    );
  }
}

function normalizeReference(value: string) {
  return value.trim().toUpperCase();
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidReference(value: string) {
  return /^JB-\d{4}-[A-Z0-9]{4,}$/.test(value);
}

function assertDate(value: Date, message: string) {
  if (Number.isNaN(value.getTime())) {
    throw domainError("BOOKING_STATUS_INVALID", message);
  }
}

function assertNullableDate(value: Date | null, message: string) {
  if (value && Number.isNaN(value.getTime())) {
    throw domainError("BOOKING_STATUS_INVALID", message);
  }
}
