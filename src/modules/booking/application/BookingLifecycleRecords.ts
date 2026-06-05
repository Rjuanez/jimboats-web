import type { Booking, BookingSnapshot } from "../domain/Booking";
import type {
  BookingAuditAction,
  BookingAuditEntryWriteModel,
  BookingJsonValue,
  BookingLifecycleEventType,
  BookingOutboxEventWriteModel,
} from "./ports/BookingRepository";

type BookingLifecycleRecords = {
  auditEntries: BookingAuditEntryWriteModel[];
  outboxEvents: BookingOutboxEventWriteModel[];
};

type BookingJsonObject = {
  [key: string]: BookingJsonValue;
};

export function createBackpanelBookingCreatedRecords(input: {
  actorUserId: string;
  booking: Booking;
  occurredAt: Date;
}): BookingLifecycleRecords {
  const snapshot = input.booking.toSnapshot();

  return {
    auditEntries: [
      auditEntry({
        action: "BOOKING_CREATED",
        actorUserId: input.actorUserId,
        booking: snapshot,
        diff: {
          after: bookingSummary(snapshot),
        },
        occurredAt: input.occurredAt,
      }),
    ],
    outboxEvents: [
      outboxEvent({
        actorUserId: input.actorUserId,
        booking: snapshot,
        eventType: "BookingCreated",
        occurredAt: input.occurredAt,
        payload: {
          booking: bookingSummary(snapshot),
        },
      }),
    ],
  };
}

export function createPublicBookingConfirmedRecords(input: {
  booking: Booking;
  occurredAt: Date;
}): BookingLifecycleRecords {
  const snapshot = input.booking.toSnapshot();

  return {
    auditEntries: [
      auditEntry({
        action: "BOOKING_CREATED",
        actorUserId: null,
        booking: snapshot,
        diff: {
          after: bookingSummary(snapshot),
        },
        occurredAt: input.occurredAt,
      }),
    ],
    outboxEvents: [
      outboxEvent({
        actorUserId: null,
        booking: snapshot,
        eventType: "BookingCreated",
        occurredAt: input.occurredAt,
        payload: {
          booking: bookingSummary(snapshot),
        },
      }),
    ],
  };
}

export function createBackpanelBookingUpdatedRecords(input: {
  actorUserId: string;
  after: Booking;
  before: Booking;
  occurredAt: Date;
}): BookingLifecycleRecords {
  const before = input.before.toSnapshot();
  const after = input.after.toSnapshot();
  const updateDiff = buildBookingUpdateDiff(before, after);
  const auditEntries = [
    auditEntry({
      action: "BOOKING_UPDATED",
      actorUserId: input.actorUserId,
      booking: after,
      diff: updateDiff,
      occurredAt: input.occurredAt,
    }),
  ];
  const outboxEvents = [
    outboxEvent({
      actorUserId: input.actorUserId,
      booking: after,
      eventType: "BookingUpdated",
      occurredAt: input.occurredAt,
      payload: {
        booking: bookingSummary(after),
        diff: updateDiff,
      },
    }),
  ];

  if (hasSelectedSlotChanged(before, after)) {
    const rescheduleDiff = {
      after: selectedSlotSummary(after),
      before: selectedSlotSummary(before),
    };

    auditEntries.push(
      auditEntry({
        action: "BOOKING_RESCHEDULED",
        actorUserId: input.actorUserId,
        booking: after,
        diff: rescheduleDiff,
        occurredAt: input.occurredAt,
      }),
    );
    outboxEvents.push(
      outboxEvent({
        actorUserId: input.actorUserId,
        booking: after,
        eventType: "BookingRescheduled",
        occurredAt: input.occurredAt,
        payload: {
          after: selectedSlotSummary(after),
          before: selectedSlotSummary(before),
          booking: bookingSummary(after),
        },
      }),
    );
  }

  return {
    auditEntries,
    outboxEvents,
  };
}

export function createBackpanelBookingCancelledRecords(input: {
  actorUserId: string;
  after: Booking;
  before: Booking;
  occurredAt: Date;
}): BookingLifecycleRecords {
  const before = input.before.toSnapshot();
  const after = input.after.toSnapshot();
  const diff = {
    after: {
      cancelledAt: after.cancelledAt,
      status: after.status,
    },
    before: {
      cancelledAt: before.cancelledAt,
      status: before.status,
    },
  };

  return {
    auditEntries: [
      auditEntry({
        action: "BOOKING_CANCELLED",
        actorUserId: input.actorUserId,
        booking: after,
        diff,
        occurredAt: input.occurredAt,
      }),
    ],
    outboxEvents: [
      outboxEvent({
        actorUserId: input.actorUserId,
        booking: after,
        eventType: "BookingCancelled",
        occurredAt: input.occurredAt,
        payload: {
          booking: bookingSummary(after),
          diff,
        },
      }),
    ],
  };
}

function auditEntry(input: {
  action: BookingAuditAction;
  actorUserId: string | null;
  booking: BookingSnapshot;
  diff: BookingJsonValue;
  occurredAt: Date;
}): BookingAuditEntryWriteModel {
  return {
    action: input.action,
    actorUserId: input.actorUserId,
    createdAt: input.occurredAt,
    diff: input.diff,
    reason: null,
    resourceId: input.booking.id,
    resourceType: "BOOKING",
  };
}

function outboxEvent(input: {
  actorUserId: string | null;
  booking: BookingSnapshot;
  eventType: BookingLifecycleEventType;
  occurredAt: Date;
  payload: BookingJsonObject;
}): BookingOutboxEventWriteModel {
  return {
    aggregateId: input.booking.id,
    aggregateType: "BOOKING",
    eventType: input.eventType,
    eventVersion: 1,
    occurredAt: input.occurredAt,
    payload: {
      ...input.payload,
      actorUserId: input.actorUserId,
      occurredAt: input.occurredAt.toISOString(),
    },
  };
}

function buildBookingUpdateDiff(
  before: BookingSnapshot,
  after: BookingSnapshot,
): BookingJsonObject {
  const changes = [
    change("customer", customerSummary(before), customerSummary(after)),
    change("guestCount", before.guestCount, after.guestCount),
    change("internalNotes", before.internalNotes, after.internalNotes),
    change("price", priceSummary(before), priceSummary(after)),
    change("selectedSlot", selectedSlotSummary(before), selectedSlotSummary(after)),
  ].filter((item): item is BookingJsonObject => item !== null);

  return {
    changes,
  };
}

function change(
  field: string,
  before: BookingJsonValue,
  after: BookingJsonValue,
): BookingJsonObject | null {
  if (JSON.stringify(before) === JSON.stringify(after)) {
    return null;
  }

  return {
    after,
    before,
    field,
  };
}

function hasSelectedSlotChanged(before: BookingSnapshot, after: BookingSnapshot) {
  return (
    before.selectedSlot.localDate !== after.selectedSlot.localDate ||
    before.selectedSlot.startMinutes !== after.selectedSlot.startMinutes ||
    before.selectedSlot.endMinutes !== after.selectedSlot.endMinutes ||
    before.selectedSlot.slotKey !== after.selectedSlot.slotKey
  );
}

function bookingSummary(snapshot: BookingSnapshot): BookingJsonObject {
  return {
    calendarBlockId: snapshot.calendarBlockId,
    customerEmail: snapshot.customer.email,
    customerName: snapshot.customer.fullName,
    experienceId: snapshot.experienceId,
    guestCount: snapshot.guestCount,
    id: snapshot.id,
    reference: snapshot.reference,
    selectedSlot: selectedSlotSummary(snapshot),
    status: snapshot.status,
    totalAmount: snapshot.priceSnapshot.totalAmount.amountMinor,
    totalCurrency: snapshot.priceSnapshot.totalAmount.currency,
  };
}

function customerSummary(snapshot: BookingSnapshot): BookingJsonObject {
  return {
    email: snapshot.customer.email,
    fullName: snapshot.customer.fullName,
    phone: snapshot.customer.phone,
    preferredLocale: snapshot.customer.preferredLocale,
  };
}

function priceSummary(snapshot: BookingSnapshot): BookingJsonObject {
  return {
    depositAmount: snapshot.priceSnapshot.depositAmount.amountMinor,
    extraIds: snapshot.priceSnapshot.extraLines.map((line) => line.extraId),
    remainingAmount: snapshot.priceSnapshot.remainingAmount.amountMinor,
    totalAmount: snapshot.priceSnapshot.totalAmount.amountMinor,
    totalCurrency: snapshot.priceSnapshot.totalAmount.currency,
  };
}

function selectedSlotSummary(snapshot: BookingSnapshot): BookingJsonObject {
  return {
    endMinutes: snapshot.selectedSlot.endMinutes,
    localDate: snapshot.selectedSlot.localDate,
    slotKey: snapshot.selectedSlot.slotKey,
    startMinutes: snapshot.selectedSlot.startMinutes,
    timeZone: snapshot.selectedSlot.timeZone,
  };
}
