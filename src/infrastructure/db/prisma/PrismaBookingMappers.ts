import { Booking } from "@/modules/booking/domain/Booking";
import { CustomerDetails } from "@/modules/booking/domain/CustomerDetails";
import { PaymentRecord } from "@/modules/booking/domain/PaymentRecord";
import type { PaymentRecordStatus } from "@/modules/booking/domain/PaymentRecord";
import { PriceSnapshot } from "@/modules/booking/domain/PriceSnapshot";
import type { BookingDiscountSnapshot } from "@/modules/booking/domain/PriceSnapshot";
import { SelectedSlot } from "@/modules/booking/domain/SelectedSlot";
import type {
  BookingExperienceOptionReadModel,
  BookingExtraOptionReadModel,
} from "@/modules/booking/application/ports/BookingRepository";
import type { BookingCancellationPolicySnapshot } from "@/modules/booking/domain/CancellationPolicy";
import { Money } from "@/shared/domain/Money";
import type { CurrencyCode } from "@/shared/domain/Money";

import {
  localDateToUtcDate,
  utcDateToLocalDateString,
} from "@/modules/boat-calendar/application/CalendarDateTime";

export type PrismaBookingExtraRecord = {
  extraId: string;
  id: string;
  nameSnapshot: string;
  quantity: number;
  totalAmountMinor: number;
  totalCurrency: string;
  unitAmountMinor: number;
  unitCurrency: string;
};

export type PrismaPaymentRecordRecord = {
  amountMinor: number;
  bookingId: string;
  createdAt: Date;
  currency: string;
  failureReason: string | null;
  id: string;
  paidAt: Date | null;
  provider: string;
  providerPaymentIntentId: string | null;
  providerSessionId: string | null;
  status: string;
};

export type PrismaBookingRecord = {
  calendarBlockId: string;
  cancelledAt: Date | null;
  cancellationPolicySnapshot?: BookingCancellationPolicySnapshot | null;
  cancellationPolicyVersionId?: string | null;
  checkoutLastSeenAt: Date | null;
  confirmedAt: Date | null;
  createdAt: Date;
  createdByUserId: string | null;
  customerEmail: string;
  customerLocale: string;
  customerName: string;
  customerNotes: string;
  customerPhone: string | null;
  couponSnapshot?: unknown | null;
  depositAmountMinor: number;
  depositCurrency: string;
  discountAmountMinor?: number;
  discountCurrency?: string;
  experienceId: string;
  experienceNameSnapshot: string;
  externalCalendarEventId: string | null;
  externalCalendarSyncError: string | null;
  externalCalendarSyncedAt: Date | null;
  extras: PrismaBookingExtraRecord[];
  guestCount: number;
  holdExpiresAt: Date | null;
  id: string;
  internalNotes: string;
  operationsSeenAt: Date | null;
  paymentRecordId: string;
  priceCapturedAt: Date;
  selectedEndMinutes: number;
  selectedLocalDate: Date;
  selectedSlotKey: string | null;
  selectedStartMinutes: number;
  source: string;
  status: string;
  subtotalAmountMinor?: number;
  subtotalCurrency?: string;
  timeZone: string;
  totalAmountMinor: number;
  totalCurrency: string;
  cashRemainingAmountMinor: number;
  cashRemainingCurrency: string;
  updatedAt: Date;
  reference: string;
};

export type PrismaBookingWriteModel = {
  booking: {
    calendarBlockId: string;
    cancelledAt: Date | null;
    checkoutLastSeenAt: Date | null;
    confirmedAt: Date | null;
    createdAt: Date;
    createdByUserId: string | null;
    customerEmail: string;
    customerLocale: string;
    customerName: string;
    customerNotes: string;
    customerPhone: string | null;
    couponSnapshot: unknown | null;
    depositAmountMinor: number;
    depositCurrency: CurrencyCode;
    discountAmountMinor: number;
    discountCurrency: CurrencyCode;
    experienceId: string;
    experienceNameSnapshot: string;
    guestCount: number;
    holdExpiresAt: Date | null;
    internalNotes: string;
    operationsSeenAt: Date | null;
    paymentRecordId: string;
    priceCapturedAt: Date;
    reference: string;
    selectedEndMinutes: number;
    selectedLocalDate: Date;
    selectedSlotKey: string | null;
    selectedStartMinutes: number;
    source: "BACKPANEL" | "PUBLIC_CHECKOUT";
    status:
      | "CANCELLED"
      | "CONFIRMED"
      | "EXPIRED"
      | "EXITED"
      | "PAYMENT_FAILED"
      | "PENDING_PAYMENT";
    subtotalAmountMinor: number;
    subtotalCurrency: CurrencyCode;
    timeZone: string;
    totalAmountMinor: number;
    totalCurrency: CurrencyCode;
    cashRemainingAmountMinor: number;
    cashRemainingCurrency: CurrencyCode;
    cancellationPolicySnapshot: BookingCancellationPolicySnapshot | null;
    cancellationPolicyVersionId: string | null;
    updatedAt: Date;
  };
  extras: Array<{
    extraId: string;
    id: string;
    nameSnapshot: string;
    quantity: number;
    totalAmountMinor: number;
    totalCurrency: CurrencyCode;
    unitAmountMinor: number;
    unitCurrency: CurrencyCode;
  }>;
  id: string;
};

export type PrismaPaymentRecordWriteModel = {
  amountMinor: number;
  bookingId: string;
  createdAt: Date;
  currency: CurrencyCode;
  failureReason: string | null;
  id: string;
  paidAt: Date | null;
  provider: string;
  providerPaymentIntentId: string | null;
  providerSessionId: string | null;
  status: PaymentRecordStatus;
};

export type PrismaBookingExperienceRecord = {
  allowsManualScheduling: boolean;
  basePriceAmountMinor: number;
  basePriceCurrency: string;
  bufferMinutes: number;
  capacity: number;
  cancellationPolicyId?: string | null;
  depositAmountMinor: number;
  depositCurrency: string;
  durationMinutes: number;
  extraRules: Array<{
    capacityReduction: number;
    enabled: boolean;
    extraId: string;
    limitPerBooking: number;
    noticeMinutes: number;
    priceOverrideAmountMinor: number | null;
    priceOverrideCurrency: string | null;
  }>;
  fixedSlots: Array<{
    enabled: boolean;
    endMinutes: number;
    label: string;
    position: number;
    slotKey: string;
    startMinutes: number;
  }>;
  id: string;
  internalName: string;
  maximumAdvanceMonths: number;
  minimumAdvanceMinutes: number;
  slotGranularityMinutes: number | null;
  slotOperatingEndMinutes: number | null;
  slotOperatingStartMinutes: number | null;
  slotPolicyMode: string;
  slotPolicyTimezone: string;
  status: string;
};

export type PrismaBookingExtraOptionRecord = {
  id: string;
  name: string;
  priceAmountMinor: number;
  priceCurrency: string;
  status: string;
};

export function bookingFromPrismaRecord(record: PrismaBookingRecord) {
  return Booking.create({
    calendarBlockId: record.calendarBlockId,
    cancelledAt: record.cancelledAt,
    cancellationPolicySnapshot: record.cancellationPolicySnapshot ?? null,
    checkoutLastSeenAt: record.checkoutLastSeenAt,
    confirmedAt: record.confirmedAt,
    createdAt: record.createdAt,
    createdByUserId: record.createdByUserId,
    customer: CustomerDetails.create({
      email: record.customerEmail,
      fullName: record.customerName,
      notes: record.customerNotes,
      phone: record.customerPhone,
      preferredLocale: record.customerLocale,
    }),
    experienceId: record.experienceId,
    experienceNameSnapshot: record.experienceNameSnapshot,
    guestCount: record.guestCount,
    holdExpiresAt: record.holdExpiresAt,
    id: record.id,
    internalNotes: record.internalNotes,
    operationsSeenAt: record.operationsSeenAt,
    paymentRecordId: record.paymentRecordId,
    priceSnapshot: PriceSnapshot.create({
      basePrice: Money.create({
        amountMinor:
          subtotalAmountMinorFromRecord(record) -
          record.extras.reduce((total, extra) => total + extra.totalAmountMinor, 0),
        currency: currencyFromPrisma(record.subtotalCurrency ?? record.totalCurrency),
      }),
      capturedAt: record.priceCapturedAt,
      depositAmount: Money.create({
        amountMinor: record.depositAmountMinor,
        currency: currencyFromPrisma(record.depositCurrency),
      }),
      discountAmount: Money.create({
        amountMinor: record.discountAmountMinor ?? 0,
        currency: currencyFromPrisma(record.discountCurrency ?? record.totalCurrency),
      }),
      discountSnapshot: record.couponSnapshot
        ? (record.couponSnapshot as BookingDiscountSnapshot)
        : null,
      extraLines: record.extras.map((extra) => ({
        extraId: extra.extraId,
        nameSnapshot: extra.nameSnapshot,
        quantity: extra.quantity,
        totalPrice: Money.create({
          amountMinor: extra.totalAmountMinor,
          currency: currencyFromPrisma(extra.totalCurrency),
        }),
        unitPrice: Money.create({
          amountMinor: extra.unitAmountMinor,
          currency: currencyFromPrisma(extra.unitCurrency),
        }),
      })),
      remainingAmount: Money.create({
        amountMinor: record.cashRemainingAmountMinor,
        currency: currencyFromPrisma(record.cashRemainingCurrency),
      }),
      subtotalAmount: Money.create({
        amountMinor: subtotalAmountMinorFromRecord(record),
        currency: currencyFromPrisma(record.subtotalCurrency ?? record.totalCurrency),
      }),
      totalAmount: Money.create({
        amountMinor: record.totalAmountMinor,
        currency: currencyFromPrisma(record.totalCurrency),
      }),
    }),
    reference: record.reference,
    selectedSlot: SelectedSlot.create({
      endMinutes: record.selectedEndMinutes,
      localDate: utcDateToLocalDateString(record.selectedLocalDate),
      slotKey: record.selectedSlotKey,
      startMinutes: record.selectedStartMinutes,
      timeZone: record.timeZone,
    }),
    source: bookingSourceFromPrisma(record.source),
    status: bookingStatusFromPrisma(record.status),
    updatedAt: record.updatedAt,
  });
}

export function bookingToPrismaWriteModel(
  booking: Booking,
  extraLineIds: Map<string, string>,
): PrismaBookingWriteModel {
  const snapshot = booking.toSnapshot();

  return {
    booking: {
      calendarBlockId: snapshot.calendarBlockId,
      cancelledAt: snapshot.cancelledAt ? new Date(snapshot.cancelledAt) : null,
      cancellationPolicySnapshot: snapshot.cancellationPolicySnapshot,
      cancellationPolicyVersionId:
        snapshot.cancellationPolicySnapshot?.versionId ?? null,
      checkoutLastSeenAt: snapshot.checkoutLastSeenAt
        ? new Date(snapshot.checkoutLastSeenAt)
        : null,
      confirmedAt: snapshot.confirmedAt ? new Date(snapshot.confirmedAt) : null,
      createdAt: new Date(snapshot.createdAt),
      createdByUserId: snapshot.createdByUserId,
      customerEmail: snapshot.customer.email,
      customerLocale: snapshot.customer.preferredLocale,
      customerName: snapshot.customer.fullName,
      customerNotes: snapshot.customer.notes,
      customerPhone: snapshot.customer.phone,
      couponSnapshot: snapshot.priceSnapshot.discountSnapshot,
      depositAmountMinor: snapshot.priceSnapshot.depositAmount.amountMinor,
      depositCurrency: snapshot.priceSnapshot.depositAmount.currency,
      discountAmountMinor: snapshot.priceSnapshot.discountAmount.amountMinor,
      discountCurrency: snapshot.priceSnapshot.discountAmount.currency,
      experienceId: snapshot.experienceId,
      experienceNameSnapshot: snapshot.experienceNameSnapshot,
      guestCount: snapshot.guestCount,
      holdExpiresAt: snapshot.holdExpiresAt
        ? new Date(snapshot.holdExpiresAt)
        : null,
      internalNotes: snapshot.internalNotes,
      operationsSeenAt: snapshot.operationsSeenAt
        ? new Date(snapshot.operationsSeenAt)
        : null,
      paymentRecordId: snapshot.paymentRecordId,
      priceCapturedAt: new Date(snapshot.priceSnapshot.capturedAt),
      reference: snapshot.reference,
      selectedEndMinutes: snapshot.selectedSlot.endMinutes,
      selectedLocalDate: localDateToUtcDate(snapshot.selectedSlot.localDate),
      selectedSlotKey: snapshot.selectedSlot.slotKey,
      selectedStartMinutes: snapshot.selectedSlot.startMinutes,
      source: snapshot.source,
      status: snapshot.status,
      subtotalAmountMinor: snapshot.priceSnapshot.subtotalAmount.amountMinor,
      subtotalCurrency: snapshot.priceSnapshot.subtotalAmount.currency,
      timeZone: snapshot.selectedSlot.timeZone,
      totalAmountMinor: snapshot.priceSnapshot.totalAmount.amountMinor,
      totalCurrency: snapshot.priceSnapshot.totalAmount.currency,
      cashRemainingAmountMinor:
        snapshot.priceSnapshot.remainingAmount.amountMinor,
      cashRemainingCurrency: snapshot.priceSnapshot.remainingAmount.currency,
      updatedAt: new Date(snapshot.updatedAt),
    },
    extras: snapshot.priceSnapshot.extraLines.map((line) => ({
      extraId: line.extraId,
      id: extraLineIds.get(line.extraId) ?? `${snapshot.id}-${line.extraId}`,
      nameSnapshot: line.nameSnapshot,
      quantity: line.quantity,
      totalAmountMinor: line.totalPrice.amountMinor,
      totalCurrency: line.totalPrice.currency,
      unitAmountMinor: line.unitPrice.amountMinor,
      unitCurrency: line.unitPrice.currency,
    })),
    id: snapshot.id,
  };
}

export function paymentRecordToPrismaWriteModel(
  paymentRecord: PaymentRecord,
): PrismaPaymentRecordWriteModel {
  const snapshot = paymentRecord.toSnapshot();

  return {
    amountMinor: snapshot.amount.amountMinor,
    bookingId: snapshot.bookingId,
    createdAt: new Date(snapshot.createdAt),
    currency: snapshot.amount.currency,
    failureReason: snapshot.failureReason,
    id: snapshot.id,
    paidAt: snapshot.paidAt ? new Date(snapshot.paidAt) : null,
    provider: snapshot.provider,
    providerPaymentIntentId: snapshot.providerPaymentIntentId,
    providerSessionId: snapshot.providerSessionId,
    status: snapshot.status,
  };
}

export function paymentRecordFromPrismaRecord(
  record: PrismaPaymentRecordRecord,
) {
  return PaymentRecord.create({
    amount: Money.create({
      amountMinor: record.amountMinor,
      currency: currencyFromPrisma(record.currency),
    }),
    bookingId: record.bookingId,
    createdAt: record.createdAt,
    failureReason: record.failureReason,
    id: record.id,
    paidAt: record.paidAt,
    provider: record.provider,
    providerPaymentIntentId: record.providerPaymentIntentId,
    providerSessionId: record.providerSessionId,
    status: paymentRecordStatusFromPrisma(record.status),
  });
}

export function bookingExperienceOptionFromPrismaRecord(
  record: PrismaBookingExperienceRecord,
): BookingExperienceOptionReadModel {
  return {
    allowsManualScheduling: record.allowsManualScheduling,
    basePrice: {
      amountMinor: record.basePriceAmountMinor,
      currency: currencyFromPrisma(record.basePriceCurrency),
    },
    bufferMinutes: record.bufferMinutes,
    capacity: record.capacity,
    cancellationPolicyId: record.cancellationPolicyId ?? null,
    depositAmount: {
      amountMinor: record.depositAmountMinor,
      currency: currencyFromPrisma(record.depositCurrency),
    },
    durationMinutes: record.durationMinutes,
    extraSelectionRules: record.extraRules.map((rule) => ({
      capacityReduction: rule.capacityReduction,
      enabled: rule.enabled,
      extraId: rule.extraId,
      limitPerBooking: rule.limitPerBooking,
      noticeMinutes: rule.noticeMinutes,
      priceOverride:
        rule.priceOverrideAmountMinor === null
          ? null
          : {
              amountMinor: rule.priceOverrideAmountMinor,
              currency: currencyFromPrisma(rule.priceOverrideCurrency),
            },
    })),
    id: record.id,
    internalName: record.internalName,
    maximumAdvanceMonths: record.maximumAdvanceMonths,
    minimumAdvanceMinutes: record.minimumAdvanceMinutes,
    slotPolicy: slotPolicyFromPrismaRecord(record),
    status: bookingExperienceStatusFromPrisma(record.status),
  };
}

export function bookingExtraOptionFromPrismaRecord(
  record: PrismaBookingExtraOptionRecord,
): BookingExtraOptionReadModel {
  return {
    id: record.id,
    name: record.name,
    price: {
      amountMinor: record.priceAmountMinor,
      currency: currencyFromPrisma(record.priceCurrency),
    },
    status: bookingExtraStatusFromPrisma(record.status),
  };
}

function slotPolicyFromPrismaRecord(record: PrismaBookingExperienceRecord) {
  if (record.slotPolicyMode === "FIXED_SLOTS") {
    return {
      fixedSlots: record.fixedSlots
        .slice()
        .sort((left, right) => left.position - right.position)
        .map((slot) => ({
          enabled: slot.enabled,
          endMinutes: slot.endMinutes,
          id: slot.slotKey,
          label: slot.label,
          startMinutes: slot.startMinutes,
        })),
      mode: "FIXED_SLOTS" as const,
      timeZone: record.slotPolicyTimezone,
    };
  }

  if (record.slotPolicyMode === "ANY_AVAILABLE") {
    return {
      granularityMinutes: record.slotGranularityMinutes,
      mode: "ANY_AVAILABLE" as const,
      operatingWindow:
        record.slotOperatingStartMinutes === null ||
        record.slotOperatingEndMinutes === null
          ? null
          : {
              endMinutes: record.slotOperatingEndMinutes,
              startMinutes: record.slotOperatingStartMinutes,
            },
      timeZone: record.slotPolicyTimezone,
    };
  }

  return {
    mode: "MANUAL_APPROVAL" as const,
    timeZone: record.slotPolicyTimezone,
  };
}

function bookingStatusFromPrisma(value: string) {
  if (
    value === "PENDING_PAYMENT" ||
    value === "CONFIRMED" ||
    value === "EXPIRED" ||
    value === "EXITED" ||
    value === "PAYMENT_FAILED" ||
    value === "CANCELLED"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted booking status.");
}

function bookingSourceFromPrisma(value: string) {
  if (value === "BACKPANEL" || value === "PUBLIC_CHECKOUT") {
    return value;
  }

  throw new Error("Unsupported persisted booking source.");
}

function bookingExperienceStatusFromPrisma(value: string) {
  if (
    value === "ARCHIVED" ||
    value === "DRAFT" ||
    value === "PUBLISHED" ||
    value === "READY"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted experience status.");
}

function bookingExtraStatusFromPrisma(value: string) {
  if (value === "ACTIVE" || value === "ARCHIVED" || value === "DRAFT") {
    return value;
  }

  throw new Error("Unsupported persisted extra status.");
}

function paymentRecordStatusFromPrisma(value: string): PaymentRecordStatus {
  if (
    value === "PENDING" ||
    value === "SUCCEEDED" ||
    value === "MANUALLY_PAID" ||
    value === "FAILED" ||
    value === "CANCELLED" ||
    value === "REFUNDED" ||
    value === "PARTIALLY_REFUNDED"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted payment status.");
}

function subtotalAmountMinorFromRecord(record: PrismaBookingRecord) {
  return (record.subtotalAmountMinor ?? 0) > 0
    ? record.subtotalAmountMinor ?? 0
    : record.totalAmountMinor + (record.discountAmountMinor ?? 0);
}

function currencyFromPrisma(value: string | null): CurrencyCode {
  if (value === "EUR") {
    return value;
  }

  throw new Error("Unsupported persisted currency.");
}
