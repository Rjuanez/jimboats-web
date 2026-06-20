import type { MoneySnapshot } from "@/shared/domain/Money";

import type { BookingSnapshot, BookingStatus } from "../domain/Booking";
import type {
  BookingAuditEntryReadModel,
  BookingExperienceOptionReadModel,
  BookingExtraOptionReadModel,
} from "./ports/BookingRepository";

export type AdminBookingDto = BookingSnapshot & {
  auditEntries?: AdminBookingAuditEntryDto[];
  endTime: string;
  notificationPreference?: AdminBookingNotificationPreferenceDto | null;
  startTime: string;
};

export type AdminBookingAuditEntryDto = BookingAuditEntryReadModel;

export type AdminBookingNotificationPreferenceDto = {
  whatsapp: {
    consentStatus: "GRANTED" | "NOT_ASKED" | "REVOKED";
    destination: string | null;
    enabled: boolean;
  };
};

export type AdminBookingSummaryDto = {
  cancelledBookings: number;
  confirmedBookings: number;
  pendingPaymentBookings: number;
  totalBookings: number;
  unacknowledgedBookings: number;
};

export type AdminBookingsWorkspaceDto = {
  bookings: AdminBookingDto[];
  experienceOptions: BookingExperienceOptionReadModel[];
  extraOptions: BookingExtraOptionReadModel[];
  summary: AdminBookingSummaryDto;
};

export type AdminSelectedBookingExtraCommand = {
  extraId: string;
  quantity: number;
};

export type BackpanelCreateBookingCommand = {
  createdByUserId: string;
  customer: {
    email: string;
    fullName: string;
    notes: string;
    phone: string | null;
    preferredLocale: string;
  };
  endTime: string;
  experienceId: string;
  guestCount: number;
  internalNotes: string;
  localDate: string;
  selectedExtras: AdminSelectedBookingExtraCommand[];
  slotKey: string | null;
  startTime: string;
};

export type BackpanelUpdateBookingCommand = {
  bookingId: string;
  customer: {
    email: string;
    fullName: string;
    notes: string;
    phone: string | null;
    preferredLocale: string;
  };
  endTime: string;
  guestCount: number;
  internalNotes: string;
  localDate: string;
  selectedExtras: AdminSelectedBookingExtraCommand[];
  slotKey: string | null;
  startTime: string;
  updatedByUserId: string;
};

export type BackpanelCancelBookingCommand = {
  bookingId: string;
  cancelledByUserId: string;
};

export type BackpanelIssueBookingAccessLinkCommand = {
  bookingId: string;
};

export type BackpanelMarkBookingSeenCommand = {
  bookingId: string;
};

export type BackpanelMarkBookingSeenDto = {
  bookingId: string;
  seenAt: string;
  status: "ALREADY_SEEN" | "MARKED" | "NOT_CONFIRMED" | "NOT_FOUND";
};

export type BackpanelIssuedBookingAccessLinkDto = {
  expiresAt: string;
  url: string;
};

export type AdminBookingExperienceOptionDto = BookingExperienceOptionReadModel;
export type AdminBookingExtraOptionDto = BookingExtraOptionReadModel;
export type AdminBookingMoneyDto = MoneySnapshot;
export type AdminBookingStatusDto = BookingStatus;
