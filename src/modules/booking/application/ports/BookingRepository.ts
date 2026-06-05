import type { MoneySnapshot } from "@/shared/domain/Money";

import type { Booking } from "../../domain/Booking";
import type { BookingNotificationPreferences } from "../../domain/BookingNotificationPreferences";
import type { PaymentRecord } from "../../domain/PaymentRecord";

export type BookingExperienceStatus =
  | "ARCHIVED"
  | "DRAFT"
  | "PUBLISHED"
  | "READY";

export type BookingSlotPolicyReadModel =
  | {
      fixedSlots: Array<{
        enabled: boolean;
        endMinutes: number;
        id: string;
        label: string;
        startMinutes: number;
      }>;
      mode: "FIXED_SLOTS";
      timeZone: string;
    }
  | {
      granularityMinutes: number | null;
      mode: "ANY_AVAILABLE";
      operatingWindow: {
        endMinutes: number;
        startMinutes: number;
      } | null;
      timeZone: string;
    }
  | {
      mode: "MANUAL_APPROVAL";
      timeZone: string;
    };

export type BookingExtraSelectionRuleReadModel = {
  capacityReduction: number;
  enabled: boolean;
  extraId: string;
  limitPerBooking: number;
  noticeMinutes: number;
  priceOverride: MoneySnapshot | null;
};

export type BookingExperienceOptionReadModel = {
  allowsManualScheduling: boolean;
  basePrice: MoneySnapshot;
  bufferMinutes: number;
  capacity: number;
  cancellationPolicyId?: string | null;
  depositAmount: MoneySnapshot;
  durationMinutes: number;
  extraSelectionRules: BookingExtraSelectionRuleReadModel[];
  id: string;
  internalName: string;
  maximumAdvanceMonths: number;
  minimumAdvanceMinutes: number;
  slotPolicy: BookingSlotPolicyReadModel;
  status: BookingExperienceStatus;
};

export type BookingExtraOptionReadModel = {
  id: string;
  name: string;
  price: MoneySnapshot;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
};

export type BookingCalendarBlockWriteModel = {
  bookingId: string;
  createdAt: Date;
  createdByUserId: string;
  experienceId: string;
  expiresAt: Date | null;
  id: string;
  localDate: string;
  protectedEndAt: Date;
  protectedStartAt: Date;
  reason: string;
  source: "BOOKING_CONFIRMED" | "BOOKING_HOLD";
  status: "ACTIVE";
  timeZone: string;
  updatedAt: Date;
  visibleEndMinutes: number;
  visibleStartMinutes: number;
};

export type BookingCalendarBlockUpdateModel = Omit<
  BookingCalendarBlockWriteModel,
  "createdAt" | "createdByUserId"
>;

export type BookingJsonValue =
  | boolean
  | null
  | number
  | string
  | BookingJsonValue[]
  | {
      [key: string]: BookingJsonValue;
    };

export type BookingAuditAction =
  | "BOOKING_CANCELLED"
  | "BOOKING_CREATED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_UPDATED";

export type BookingLifecycleEventType =
  | "BookingCancelled"
  | "BookingCreated"
  | "BookingRescheduled"
  | "BookingUpdated";

export type BookingAuditEntryWriteModel = {
  action: BookingAuditAction;
  actorUserId: string | null;
  createdAt: Date;
  diff: BookingJsonValue;
  reason: string | null;
  resourceId: string;
  resourceType: "BOOKING";
};

export type BookingAuditEntryReadModel = {
  action: BookingAuditAction;
  actorUserId: string | null;
  createdAt: Date;
  diff: BookingJsonValue | null;
  id: string;
  reason: string | null;
  resourceId: string;
  resourceType: "BOOKING";
};

export type BookingOutboxEventWriteModel = {
  aggregateId: string;
  aggregateType: "BOOKING";
  eventType: BookingLifecycleEventType;
  eventVersion: 1;
  occurredAt: Date;
  payload: BookingJsonValue;
};

export type AdminCreatedBookingPersistence = {
  auditEntries: BookingAuditEntryWriteModel[];
  booking: Booking;
  calendarBlock: BookingCalendarBlockWriteModel;
  extraLineIds: Map<string, string>;
  outboxEvents: BookingOutboxEventWriteModel[];
  paymentRecord: PaymentRecord;
};

export type AdminUpdatedBookingPersistence = {
  auditEntries: BookingAuditEntryWriteModel[];
  booking: Booking;
  calendarBlock: BookingCalendarBlockUpdateModel;
  extraLineIds: Map<string, string>;
  outboxEvents: BookingOutboxEventWriteModel[];
};

export type AdminCancelledBookingPersistence = {
  auditEntries: BookingAuditEntryWriteModel[];
  booking: Booking;
  calendarBlockId: string;
  outboxEvents: BookingOutboxEventWriteModel[];
  releasedAt: Date;
};

export type PublicPendingBookingPersistence = {
  booking: Booking;
  calendarBlock: BookingCalendarBlockWriteModel;
  extraLineIds: Map<string, string>;
  notificationPreferences: BookingNotificationPreferences;
  paymentRecord: PaymentRecord;
};

export type BookingPaymentReadModel = {
  booking: Booking;
  paymentRecord: PaymentRecord;
};

export type PaymentProviderEventWriteModel = {
  eventType: string;
  payload: BookingJsonValue;
  processedAt: Date;
  provider: string;
  providerEventId: string;
  receivedAt: Date;
  status: "FAILED" | "IGNORED" | "PROCESSED";
};

export type DepositPaymentSucceededPersistence = {
  auditEntries: BookingAuditEntryWriteModel[];
  booking: Booking;
  calendarBlockId: string;
  outboxEvents: BookingOutboxEventWriteModel[];
  paymentRecord: PaymentRecord;
  providerEvent: PaymentProviderEventWriteModel;
};

export type DepositPaymentFailedPersistence = {
  booking: Booking;
  calendarBlockId: string;
  paymentRecord: PaymentRecord;
  providerEvent: PaymentProviderEventWriteModel;
  releasedAt: Date;
};

export type BookingCalendarOverlapReadModel = {
  id: string;
  protectedEndAt: Date;
  protectedStartAt: Date;
};

export type BookingRepository = {
  findActiveCalendarOverlaps(
    startAt: Date,
    endAt: Date,
    input?: {
      excludeBlockId?: string;
    },
  ): Promise<BookingCalendarOverlapReadModel[]>;
  findById(id: string): Promise<Booking | null>;
  findByPaymentProviderSessionId(
    providerSessionId: string,
  ): Promise<BookingPaymentReadModel | null>;
  findExperienceOptionById(
    id: string,
  ): Promise<BookingExperienceOptionReadModel | null>;
  findExtraOptionsByIds(ids: string[]): Promise<BookingExtraOptionReadModel[]>;
  list(): Promise<Booking[]>;
  listAuditEntriesForBookings(
    bookingIds: string[],
  ): Promise<BookingAuditEntryReadModel[]>;
  listExperienceOptions(): Promise<BookingExperienceOptionReadModel[]>;
  listExtraOptions(): Promise<BookingExtraOptionReadModel[]>;
  saveAdminCancelledBooking(input: AdminCancelledBookingPersistence): Promise<void>;
  saveAdminCreatedBooking(input: AdminCreatedBookingPersistence): Promise<void>;
  saveAdminUpdatedBooking(input: AdminUpdatedBookingPersistence): Promise<void>;
  saveDepositPaymentFailed(
    input: DepositPaymentFailedPersistence,
  ): Promise<"DUPLICATE" | "PROCESSED">;
  saveDepositPaymentSucceeded(
    input: DepositPaymentSucceededPersistence,
  ): Promise<"DUPLICATE" | "PROCESSED">;
  savePublicPendingBooking(input: PublicPendingBookingPersistence): Promise<void>;
};
