import { applicationError } from "@/shared/application/ApplicationError";

export const boatCalendarTimeZone = "Europe/Madrid";

export type ManualCalendarBlockTimeRange = {
  localDate: string;
  protectedEndAt: Date;
  protectedStartAt: Date;
  visibleEndMinutes: number;
  visibleStartMinutes: number;
};

export function buildManualCalendarBlockTimeRange(input: {
  endTime: string;
  localDate: string;
  startTime: string;
  timeZone?: string;
}): ManualCalendarBlockTimeRange {
  const timeZone = input.timeZone ?? boatCalendarTimeZone;
  const visibleStartMinutes = parseClockTime(input.startTime);
  const visibleEndMinutes = parseClockTime(input.endTime);

  assertLocalDate(input.localDate);

  if (visibleEndMinutes <= visibleStartMinutes) {
    throw applicationError(
      "CALENDAR_DATE_RANGE_INVALID",
      "Calendar block end time must be after start time.",
    );
  }

  return {
    localDate: input.localDate,
    protectedEndAt: localDateTimeToUtcDate(
      input.localDate,
      visibleEndMinutes,
      timeZone,
    ),
    protectedStartAt: localDateTimeToUtcDate(
      input.localDate,
      visibleStartMinutes,
      timeZone,
    ),
    visibleEndMinutes,
    visibleStartMinutes,
  };
}

export function localDateTimeToUtcDate(
  localDate: string,
  minutes: number,
  timeZone = boatCalendarTimeZone,
) {
  const { day, month, year } = parseLocalDateParts(localDate);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const firstOffset = getTimeZoneOffsetMs(utcGuess, timeZone);
  let utcDate = new Date(utcGuess.getTime() - firstOffset);
  const correctedOffset = getTimeZoneOffsetMs(utcDate, timeZone);

  if (correctedOffset !== firstOffset) {
    utcDate = new Date(utcGuess.getTime() - correctedOffset);
  }

  return utcDate;
}

export function localDateToUtcDate(localDate: string) {
  assertLocalDate(localDate);

  return new Date(`${localDate}T00:00:00.000Z`);
}

export function utcDateToLocalDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function minutesToClockTime(minutes: number) {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 24 * 60) {
    throw applicationError(
      "CALENDAR_DATE_RANGE_INVALID",
      "Calendar time minutes are invalid.",
    );
  }

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

export function parseClockTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());

  if (!match) {
    throw applicationError(
      "CALENDAR_DATE_RANGE_INVALID",
      "Calendar time must use HH:mm.",
    );
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function todayLocalDate(now: Date, timeZone = boatCalendarTimeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });

  return formatter.format(now);
}

export function addDaysToLocalDate(localDate: string, days: number) {
  const date = localDateToUtcDate(localDate);
  date.setUTCDate(date.getUTCDate() + days);

  return utcDateToLocalDateString(date);
}

export function assertLocalDate(value: string) {
  parseLocalDateParts(value);
}

function parseLocalDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    throw applicationError(
      "CALENDAR_DATE_RANGE_INVALID",
      "Calendar date must use YYYY-MM-DD.",
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw applicationError(
      "CALENDAR_DATE_RANGE_INVALID",
      "Calendar date is invalid.",
    );
  }

  return {
    day,
    month,
    year,
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return asUtc - date.getTime();
}
