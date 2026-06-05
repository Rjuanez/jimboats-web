import type { AdminNavItem } from "@/components/layout/AdminNavigation";

export type AdminCalendarBlockStatus = "active" | "released";
export type AdminCalendarBlockSource =
  | "booking_confirmed"
  | "booking_hold"
  | "manual_block";

export type AdminCalendarBlock = {
  bookingId: string | null;
  canRelease: boolean;
  createdAt: string;
  createdByUserId: string;
  endTime: string;
  experienceId: string | null;
  expiresAt: string | null;
  id: string;
  localDate: string;
  protectedEndAt: string;
  protectedStartAt: string;
  reason: string;
  source: AdminCalendarBlockSource;
  sourceLabel: string;
  startTime: string;
  status: AdminCalendarBlockStatus;
  statusLabel: string;
  updatedAt: string;
};

export type AdminCalendarSummary = {
  activeBlocks: number;
  bookingBlocks: number;
  manualBlocks: number;
  releasedBlocks: number;
};

export type AdminCalendarState = {
  blocks: AdminCalendarBlock[];
  fromLocalDate: string;
  summary: AdminCalendarSummary;
  timeZone: string;
  toLocalDate: string;
};

export type AdminCalendarPageData = {
  navItems: AdminNavItem[];
  state: AdminCalendarState;
};

export type AdminCalendarManualBlockInput = {
  endTime: string;
  fromLocalDate: string;
  localDate: string;
  reason: string;
  startTime: string;
  toLocalDate: string;
};

export type AdminCalendarReleaseBlockInput = {
  calendarBlockId: string;
  fromLocalDate: string;
  toLocalDate: string;
};

export type AdminCalendarActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminCalendarActions = {
  createManualBlock: (input: AdminCalendarManualBlockInput) => Promise<
    AdminCalendarActionResult<{
      state: AdminCalendarState;
    }>
  >;
  releaseManualBlock: (input: AdminCalendarReleaseBlockInput) => Promise<
    AdminCalendarActionResult<{
      state: AdminCalendarState;
    }>
  >;
};
