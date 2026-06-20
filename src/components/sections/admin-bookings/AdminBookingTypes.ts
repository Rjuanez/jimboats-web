import type { AdminNavItem } from "@/components/layout/AdminNavigation";

export type AdminBookingStatus =
  | "cancelled"
  | "confirmed"
  | "expired"
  | "exited"
  | "payment_failed"
  | "pending_payment";

export type AdminBookingExtraLine = {
  extraId: string;
  name: string;
  quantity: number;
  totalAmount: number;
  unitAmount: number;
};

export type AdminBookingAuditEntry = {
  action: "cancelled" | "created" | "rescheduled" | "updated";
  actionLabel: string;
  actorLabel: string;
  createdAtLabel: string;
  detail: string;
  id: string;
  reason: string | null;
  tone: "amber" | "emerald" | "neutral" | "rose" | "sky";
};

export type AdminBooking = {
  auditEntries: AdminBookingAuditEntry[];
  calendarBlockId: string;
  customerEmail: string;
  customerName: string;
  customerNotes: string;
  customerPhone: string;
  depositAmount: number;
  endTime: string;
  experienceId: string;
  experienceName: string;
  extras: AdminBookingExtraLine[];
  guestCount: number;
  id: string;
  internalNotes: string;
  localDate: string;
  reference: string;
  remainingAmount: number;
  slotKey: string | null;
  startTime: string;
  status: AdminBookingStatus;
  statusLabel: string;
  totalAmount: number;
};

export type AdminBookingSlotOption = {
  endTime: string;
  id: string;
  label: string;
  startTime: string;
};

export type AdminBookingExperienceOption = {
  basePrice: number;
  capacity: number;
  depositAmount: number;
  durationMinutes: number;
  id: string;
  name: string;
  slotMode: "any_available" | "fixed_slots" | "manual_approval";
  slots: AdminBookingSlotOption[];
};

export type AdminBookingExtraOption = {
  id: string;
  name: string;
  price: number;
};

export type AdminBookingsSummary = {
  cancelledBookings: number;
  confirmedBookings: number;
  pendingPaymentBookings: number;
  totalBookings: number;
};

export type AdminBookingsState = {
  bookings: AdminBooking[];
  experienceOptions: AdminBookingExperienceOption[];
  extraOptions: AdminBookingExtraOption[];
  summary: AdminBookingsSummary;
};

export type AdminBookingsPageData = {
  navItems: AdminNavItem[];
  state: AdminBookingsState;
};

export type AdminBookingView = "create" | "detail" | "list";

export type AdminBookingCreateInput = {
  customerEmail: string;
  customerName: string;
  customerNotes: string;
  customerPhone: string;
  endTime: string;
  experienceId: string;
  guestCount: number;
  internalNotes: string;
  localDate: string;
  selectedExtras: Array<{
    extraId: string;
    quantity: number;
  }>;
  slotKey: string | null;
  startTime: string;
};

export type AdminBookingUpdateInput = AdminBookingCreateInput & {
  bookingId: string;
};

export type AdminBookingCancelInput = {
  bookingId: string;
};

export type AdminBookingIssueAccessLinkInput = {
  bookingId: string;
};

export type AdminBookingIssuedAccessLink = {
  expiresAt: string;
  url: string;
};

export type AdminBookingActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminBookingActions = {
  cancelBooking: (
    input: AdminBookingCancelInput,
  ) => Promise<
    AdminBookingActionResult<{ bookingId: string; state: AdminBookingsState }>
  >;
  createBooking: (
    input: AdminBookingCreateInput,
  ) => Promise<
    AdminBookingActionResult<{ bookingId: string; state: AdminBookingsState }>
  >;
  issueAccessLink: (
    input: AdminBookingIssueAccessLinkInput,
  ) => Promise<AdminBookingActionResult<AdminBookingIssuedAccessLink>>;
  updateBooking: (
    input: AdminBookingUpdateInput,
  ) => Promise<
    AdminBookingActionResult<{ bookingId: string; state: AdminBookingsState }>
  >;
};
