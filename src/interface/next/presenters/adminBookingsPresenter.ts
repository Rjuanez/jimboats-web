import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminBooking,
  AdminBookingAuditEntry,
  AdminBookingExperienceOption,
  AdminBookingExtraOption,
  AdminBookingsPageData,
  AdminBookingsState,
} from "@/components/sections/admin-bookings/AdminBookingTypes";
import type {
  AdminBookingDto,
  AdminBookingsWorkspaceDto,
} from "@/modules/booking/application/AdminBookingDtos";
import type {
  BookingExperienceOptionReadModel,
  BookingExtraOptionReadModel,
} from "@/modules/booking/application/ports/BookingRepository";
import { minutesToClockTime } from "@/modules/booking/application/BookingApplicationMappers";

const previewState: AdminBookingsState = {
  bookings: [
    {
      auditEntries: [
        {
          action: "created",
          actionLabel: "Created",
          actorLabel: "admin-user",
          createdAtLabel: "01 Jun 2026, 12:00",
          detail: "Booking was created.",
          id: "audit-preview-created",
          reason: null,
          tone: "emerald",
        },
        {
          action: "updated",
          actionLabel: "Updated",
          actorLabel: "admin-user",
          createdAtLabel: "02 Jun 2026, 12:00",
          detail: "Updated guest count and internal notes.",
          id: "audit-preview-updated",
          reason: null,
          tone: "sky",
        },
      ],
      calendarBlockId: "block-preview-1",
      customerEmail: "sailor@example.com",
      customerName: "Sailor Guest",
      customerNotes: "Prefers WhatsApp updates.",
      customerPhone: "+34 600 000 000",
      depositAmount: 100,
      endTime: "14:00",
      experienceId: "sunset-cruise",
      experienceName: "Sunset Cruise",
      extras: [
        {
          extraId: "champagne",
          name: "Premium champagne",
          quantity: 1,
          totalAmount: 90,
          unitAmount: 90,
        },
      ],
      guestCount: 4,
      id: "booking-preview-1",
      internalNotes: "Manual booking from WhatsApp.",
      localDate: "2026-06-10",
      reference: "JB-2026-0001",
      remainingAmount: 1190,
      slotKey: "morning",
      startTime: "10:00",
      status: "confirmed",
      statusLabel: "Confirmed",
      totalAmount: 1290,
    },
  ],
  experienceOptions: [
    {
      basePrice: 1200,
      capacity: 10,
      depositAmount: 100,
      durationMinutes: 240,
      id: "sunset-cruise",
      name: "Sunset Cruise",
      slotMode: "fixed_slots",
      slots: [
        {
          endTime: "14:00",
          id: "morning",
          label: "Morning",
          startTime: "10:00",
        },
      ],
    },
  ],
  extraOptions: [
    {
      id: "champagne",
      name: "Premium champagne",
      price: 90,
    },
  ],
  summary: {
    cancelledBookings: 0,
    confirmedBookings: 1,
    pendingPaymentBookings: 0,
    totalBookings: 1,
  },
};

export function getAdminBookingsPreviewPage(): AdminBookingsPageData {
  return {
    navItems: adminNavItems,
    state: previewState,
  };
}

export async function getAdminBookingsPage(): Promise<AdminBookingsPageData> {
  if (process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1") {
    return getAdminBookingsPreviewPage();
  }

  const { getContainer } = await import("@/container");
  const container = getContainer();
  const workspace = await container.adminBookings.getWorkspace();

  return {
    navItems: adminNavItems,
    state: presentAdminBookingsWorkspace(workspace),
  };
}

export function presentAdminBookingsWorkspace(
  workspace: AdminBookingsWorkspaceDto,
): AdminBookingsState {
  return {
    bookings: workspace.bookings.map(presentBooking),
    experienceOptions: workspace.experienceOptions.map(presentExperienceOption),
    extraOptions: workspace.extraOptions.map(presentExtraOption),
    summary: workspace.summary,
  };
}

function presentBooking(booking: AdminBookingDto): AdminBooking {
  return {
    auditEntries: (booking.auditEntries ?? []).map(presentAuditEntry),
    calendarBlockId: booking.calendarBlockId,
    customerEmail: booking.customer.email,
    customerName: booking.customer.fullName,
    customerNotes: booking.customer.notes,
    customerPhone: booking.customer.phone ?? "",
    depositAmount: fromMoney(booking.priceSnapshot.depositAmount),
    endTime: booking.endTime,
    experienceId: booking.experienceId,
    experienceName: booking.experienceNameSnapshot,
    extras: booking.priceSnapshot.extraLines.map((line) => ({
      extraId: line.extraId,
      name: line.nameSnapshot,
      quantity: line.quantity,
      totalAmount: fromMoney(line.totalPrice),
      unitAmount: fromMoney(line.unitPrice),
    })),
    guestCount: booking.guestCount,
    id: booking.id,
    internalNotes: booking.internalNotes,
    localDate: booking.selectedSlot.localDate,
    reference: booking.reference,
    remainingAmount: fromMoney(booking.priceSnapshot.remainingAmount),
    slotKey: booking.selectedSlot.slotKey,
    startTime: booking.startTime,
    status: booking.status.toLowerCase() as AdminBooking["status"],
    statusLabel: statusLabel(booking.status),
    totalAmount: fromMoney(booking.priceSnapshot.totalAmount),
  };
}

type AdminBookingAuditEntryDto = NonNullable<
  AdminBookingDto["auditEntries"]
>[number];

function presentAuditEntry(
  entry: AdminBookingAuditEntryDto,
): AdminBookingAuditEntry {
  return {
    action: auditAction(entry.action),
    actionLabel: auditActionLabel(entry.action),
    actorLabel: entry.actorUserId ?? "System",
    createdAtLabel: formatAuditDate(entry.createdAt),
    detail: auditDetail(entry),
    id: entry.id,
    reason: entry.reason,
    tone: auditTone(entry.action),
  };
}

function presentExperienceOption(
  experience: BookingExperienceOptionReadModel,
): AdminBookingExperienceOption {
  return {
    basePrice: fromMoney(experience.basePrice),
    capacity: experience.capacity,
    depositAmount: fromMoney(experience.depositAmount),
    durationMinutes: experience.durationMinutes,
    id: experience.id,
    name: experience.internalName,
    slotMode: experience.slotPolicy.mode.toLowerCase() as AdminBookingExperienceOption["slotMode"],
    slots:
      experience.slotPolicy.mode === "FIXED_SLOTS"
        ? experience.slotPolicy.fixedSlots
            .filter((slot) => slot.enabled)
            .map((slot) => ({
              endTime: minutesToClockTime(slot.endMinutes),
              id: slot.id,
              label: slot.label,
              startTime: minutesToClockTime(slot.startMinutes),
            }))
        : [],
  };
}

function presentExtraOption(
  extra: BookingExtraOptionReadModel,
): AdminBookingExtraOption {
  return {
    id: extra.id,
    name: extra.name,
    price: fromMoney(extra.price),
  };
}

function fromMoney(money: { amountMinor: number }) {
  return money.amountMinor / 100;
}

function auditAction(
  action: AdminBookingAuditEntryDto["action"],
): AdminBookingAuditEntry["action"] {
  if (action === "BOOKING_CANCELLED") {
    return "cancelled";
  }

  if (action === "BOOKING_RESCHEDULED") {
    return "rescheduled";
  }

  if (action === "BOOKING_UPDATED") {
    return "updated";
  }

  return "created";
}

function auditActionLabel(action: AdminBookingAuditEntryDto["action"]) {
  if (action === "BOOKING_CANCELLED") {
    return "Cancelled";
  }

  if (action === "BOOKING_RESCHEDULED") {
    return "Rescheduled";
  }

  if (action === "BOOKING_UPDATED") {
    return "Updated";
  }

  return "Created";
}

function auditTone(
  action: AdminBookingAuditEntryDto["action"],
): AdminBookingAuditEntry["tone"] {
  if (action === "BOOKING_CANCELLED") {
    return "rose";
  }

  if (action === "BOOKING_RESCHEDULED") {
    return "amber";
  }

  if (action === "BOOKING_UPDATED") {
    return "sky";
  }

  return "emerald";
}

function auditDetail(entry: AdminBookingAuditEntryDto) {
  if (entry.action === "BOOKING_CREATED") {
    return "Booking was created.";
  }

  if (entry.action === "BOOKING_CANCELLED") {
    return "Booking was cancelled and the calendar block was released.";
  }

  if (entry.action === "BOOKING_RESCHEDULED") {
    return rescheduleDetail(entry.diff);
  }

  const changedFields = readChangedFields(entry.diff);

  if (changedFields.length === 0) {
    return "Booking details were updated.";
  }

  return `Updated ${formatList(changedFields)}.`;
}

function readChangedFields(diff: AdminBookingAuditEntryDto["diff"]) {
  const diffObject = readObject(diff);
  const changes = diffObject.changes;

  if (!Array.isArray(changes)) {
    return [];
  }

  return changes
    .map((change) => readObject(change).field)
    .filter((field): field is string => typeof field === "string")
    .map(formatAuditField);
}

function rescheduleDetail(diff: AdminBookingAuditEntryDto["diff"]) {
  const diffObject = readObject(diff);
  const before = selectedSlotLabel(readObject(diffObject.before));
  const after = selectedSlotLabel(readObject(diffObject.after));

  if (!before || !after) {
    return "Booking date or time was changed.";
  }

  return `Moved from ${before} to ${after}.`;
}

function selectedSlotLabel(input: Record<string, unknown>) {
  const localDate = typeof input.localDate === "string" ? input.localDate : null;
  const startMinutes =
    typeof input.startMinutes === "number" ? input.startMinutes : null;
  const endMinutes = typeof input.endMinutes === "number" ? input.endMinutes : null;

  if (!localDate || startMinutes === null || endMinutes === null) {
    return null;
  }

  return `${localDate} ${minutesToClockTime(startMinutes)}-${minutesToClockTime(
    endMinutes,
  )}`;
}

function formatAuditField(field: string) {
  const fieldLabels: Record<string, string> = {
    customer: "customer",
    guestCount: "guest count",
    internalNotes: "internal notes",
    price: "price snapshot",
    selectedSlot: "date and time",
  };

  return fieldLabels[field] ?? field;
}

function formatList(items: string[]) {
  if (items.length === 1) {
    return items[0];
  }

  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function formatAuditDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "short",
    timeZone: "Europe/Madrid",
    year: "numeric",
  }).format(date);
}

function readObject(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }

  return {};
}

function statusLabel(status: AdminBookingDto["status"]) {
  if (status === "CONFIRMED") {
    return "Confirmed";
  }

  if (status === "PENDING_PAYMENT") {
    return "Pending payment";
  }

  if (status === "PAYMENT_FAILED") {
    return "Payment failed";
  }

  if (status === "EXPIRED") {
    return "Expired";
  }

  if (status === "EXITED") {
    return "Exited checkout";
  }

  return "Cancelled";
}
