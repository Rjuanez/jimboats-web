import type {
  CalendarBlockSnapshot,
  CalendarBlockSource,
  CalendarBlockStatus,
} from "../domain/CalendarBlock";
import { minutesToClockTime } from "./CalendarDateTime";

export type AdminCalendarBlockDto = CalendarBlockSnapshot & {
  canRelease: boolean;
  endTime: string;
  startTime: string;
};

export type AdminCalendarSummaryDto = {
  activeBlocks: number;
  bookingBlocks: number;
  manualBlocks: number;
  releasedBlocks: number;
};

export type AdminCalendarDto = {
  blocks: AdminCalendarBlockDto[];
  fromLocalDate: string;
  summary: AdminCalendarSummaryDto;
  timeZone: string;
  toLocalDate: string;
};

export type GetAdminCalendarQuery = {
  fromLocalDate: string;
  toLocalDate: string;
};

export type CreateManualCalendarBlockCommand = {
  createdByUserId: string;
  endTime: string;
  localDate: string;
  reason: string;
  startTime: string;
};

export type ReleaseManualCalendarBlockCommand = {
  calendarBlockId: string;
};

export type PersistedCalendarBlockSource = CalendarBlockSource;
export type PersistedCalendarBlockStatus = CalendarBlockStatus;

export function calendarBlockSnapshotToAdminDto(
  snapshot: CalendarBlockSnapshot,
): AdminCalendarBlockDto {
  return {
    ...snapshot,
    canRelease:
      snapshot.source === "MANUAL_BLOCK" && snapshot.status === "ACTIVE",
    endTime: minutesToClockTime(snapshot.visibleEndMinutes),
    startTime: minutesToClockTime(snapshot.visibleStartMinutes),
  };
}

export function summarizeCalendarBlocks(blocks: AdminCalendarBlockDto[]) {
  return {
    activeBlocks: blocks.filter((block) => block.status === "ACTIVE").length,
    bookingBlocks: blocks.filter(
      (block) =>
        block.source === "BOOKING_CONFIRMED" || block.source === "BOOKING_HOLD",
    ).length,
    manualBlocks: blocks.filter((block) => block.source === "MANUAL_BLOCK")
      .length,
    releasedBlocks: blocks.filter((block) => block.status === "RELEASED")
      .length,
  };
}
