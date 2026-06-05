import { CalendarBlock } from "@/modules/boat-calendar/domain/CalendarBlock";
import type {
  CalendarBlockSource,
  CalendarBlockStatus,
} from "@/modules/boat-calendar/domain/CalendarBlock";

import {
  localDateToUtcDate,
  utcDateToLocalDateString,
} from "@/modules/boat-calendar/application/CalendarDateTime";

export type PrismaCalendarBlockRecord = {
  bookingId: string | null;
  createdAt: Date;
  createdByUserId: string;
  experienceId: string | null;
  expiresAt: Date | null;
  id: string;
  localDate: Date;
  protectedEndAt: Date;
  protectedStartAt: Date;
  reason: string;
  source: string;
  status: string;
  timeZone: string;
  updatedAt: Date;
  visibleEndMinutes: number;
  visibleStartMinutes: number;
};

export type PrismaCalendarBlockWriteModel = {
  block: {
    bookingId: string | null;
    createdAt: Date;
    createdByUserId: string;
    experienceId: string | null;
    expiresAt: Date | null;
    localDate: Date;
    protectedEndAt: Date;
    protectedStartAt: Date;
    reason: string;
    source: CalendarBlockSource;
    status: CalendarBlockStatus;
    timeZone: string;
    updatedAt: Date;
    visibleEndMinutes: number;
    visibleStartMinutes: number;
  };
  id: string;
};

export function calendarBlockFromPrismaRecord(
  record: PrismaCalendarBlockRecord,
) {
  return CalendarBlock.create({
    bookingId: record.bookingId,
    createdAt: record.createdAt,
    createdByUserId: record.createdByUserId,
    experienceId: record.experienceId,
    expiresAt: record.expiresAt,
    id: record.id,
    localDate: utcDateToLocalDateString(record.localDate),
    protectedEndAt: record.protectedEndAt,
    protectedStartAt: record.protectedStartAt,
    reason: record.reason,
    source: calendarBlockSourceFromPrisma(record.source),
    status: calendarBlockStatusFromPrisma(record.status),
    timeZone: record.timeZone,
    updatedAt: record.updatedAt,
    visibleEndMinutes: record.visibleEndMinutes,
    visibleStartMinutes: record.visibleStartMinutes,
  });
}

export function calendarBlockToPrismaWriteModel(
  block: CalendarBlock,
): PrismaCalendarBlockWriteModel {
  const snapshot = block.toSnapshot();

  return {
    block: {
      bookingId: snapshot.bookingId,
      createdAt: new Date(snapshot.createdAt),
      createdByUserId: snapshot.createdByUserId,
      experienceId: snapshot.experienceId,
      expiresAt: snapshot.expiresAt ? new Date(snapshot.expiresAt) : null,
      localDate: localDateToUtcDate(snapshot.localDate),
      protectedEndAt: new Date(snapshot.protectedEndAt),
      protectedStartAt: new Date(snapshot.protectedStartAt),
      reason: snapshot.reason,
      source: snapshot.source,
      status: snapshot.status,
      timeZone: snapshot.timeZone,
      updatedAt: new Date(snapshot.updatedAt),
      visibleEndMinutes: snapshot.visibleEndMinutes,
      visibleStartMinutes: snapshot.visibleStartMinutes,
    },
    id: snapshot.id,
  };
}

function calendarBlockSourceFromPrisma(value: string): CalendarBlockSource {
  if (
    value === "BOOKING_CONFIRMED" ||
    value === "BOOKING_HOLD" ||
    value === "MANUAL_BLOCK"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted calendar block source.");
}

function calendarBlockStatusFromPrisma(value: string): CalendarBlockStatus {
  if (value === "ACTIVE" || value === "RELEASED") {
    return value;
  }

  throw new Error("Unsupported persisted calendar block status.");
}
