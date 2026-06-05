import { domainError } from "@/shared/domain/DomainError";

export type CalendarBlockSource =
  | "BOOKING_CONFIRMED"
  | "BOOKING_HOLD"
  | "MANUAL_BLOCK";
export type CalendarBlockStatus = "ACTIVE" | "RELEASED";

export type CalendarBlockProps = {
  bookingId: string | null;
  createdAt: Date;
  createdByUserId: string;
  experienceId: string | null;
  expiresAt: Date | null;
  id: string;
  localDate: string;
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

export type CalendarBlockSnapshot = {
  bookingId: string | null;
  createdAt: string;
  createdByUserId: string;
  experienceId: string | null;
  expiresAt: string | null;
  id: string;
  localDate: string;
  protectedEndAt: string;
  protectedStartAt: string;
  reason: string;
  source: CalendarBlockSource;
  status: CalendarBlockStatus;
  timeZone: string;
  updatedAt: string;
  visibleEndMinutes: number;
  visibleStartMinutes: number;
};

export type CreateManualCalendarBlockInput = Omit<
  CalendarBlockProps,
  "bookingId" | "experienceId" | "expiresAt" | "source" | "status" | "updatedAt"
>;

const supportedSources = new Set<CalendarBlockSource>([
  "BOOKING_CONFIRMED",
  "BOOKING_HOLD",
  "MANUAL_BLOCK",
]);
const supportedStatuses = new Set<CalendarBlockStatus>(["ACTIVE", "RELEASED"]);

export class CalendarBlock {
  private constructor(private readonly props: CalendarBlockProps) {}

  static create(input: CalendarBlockProps) {
    const id = input.id.trim();
    const reason = normalizeText(input.reason);
    const bookingId = input.bookingId?.trim() || null;
    const createdByUserId = input.createdByUserId.trim();
    const experienceId = input.experienceId?.trim() || null;
    const timeZone = input.timeZone.trim();

    if (!id) {
      throw domainError(
        "CALENDAR_BLOCK_ID_MISSING",
        "Calendar block id is required.",
      );
    }

    if (!supportedSources.has(input.source)) {
      throw domainError(
        "CALENDAR_BLOCK_RANGE_INVALID",
        "Calendar block source is not supported.",
      );
    }

    if (!supportedStatuses.has(input.status)) {
      throw domainError(
        "CALENDAR_BLOCK_RANGE_INVALID",
        "Calendar block status is not supported.",
      );
    }

    assertLocalDate(input.localDate);
    assertVisibleRange(input.visibleStartMinutes, input.visibleEndMinutes);
    assertProtectedRange(input.protectedStartAt, input.protectedEndAt);
    assertTimeZone(timeZone);

    if (input.source === "MANUAL_BLOCK" && !reason) {
      throw domainError(
        "CALENDAR_BLOCK_REASON_MISSING",
        "Manual calendar blocks require a reason.",
      );
    }

    if (input.source === "BOOKING_CONFIRMED" && (!bookingId || !experienceId)) {
      throw domainError(
        "CALENDAR_BLOCK_BOOKING_ID_MISSING",
        "Confirmed booking calendar blocks require booking and experience ids.",
      );
    }

    if (
      input.source === "BOOKING_HOLD" &&
      (!bookingId || !experienceId || !input.expiresAt)
    ) {
      throw domainError(
        "CALENDAR_BLOCK_BOOKING_ID_MISSING",
        "Booking hold calendar blocks require booking, experience, and expiry.",
      );
    }

    if (!createdByUserId) {
      throw domainError(
        "CALENDAR_BLOCK_CREATED_BY_MISSING",
        "Calendar block creator is required.",
      );
    }

    return new CalendarBlock({
      ...input,
      bookingId,
      createdByUserId,
      experienceId,
      id,
      reason,
      timeZone,
    });
  }

  static createManual(input: CreateManualCalendarBlockInput) {
    return CalendarBlock.create({
      ...input,
      source: "MANUAL_BLOCK",
      status: "ACTIVE",
      bookingId: null,
      experienceId: null,
      expiresAt: null,
      updatedAt: input.createdAt,
    });
  }

  get id() {
    return this.props.id;
  }

  get status() {
    return this.props.status;
  }

  get source() {
    return this.props.source;
  }

  isActive() {
    return this.props.status === "ACTIVE";
  }

  overlapsProtectedRange(startAt: Date, endAt: Date) {
    assertProtectedRange(startAt, endAt);

    if (!this.isActive()) {
      return false;
    }

    return (
      startAt.getTime() < this.props.protectedEndAt.getTime() &&
      this.props.protectedStartAt.getTime() < endAt.getTime()
    );
  }

  release(releasedAt: Date) {
    if (this.props.source !== "MANUAL_BLOCK") {
      throw domainError(
        "CALENDAR_BLOCK_CANNOT_BE_RELEASED",
        "Only manual calendar blocks can be released from the backpanel.",
      );
    }

    if (!this.isActive()) {
      throw domainError(
        "CALENDAR_BLOCK_ALREADY_INACTIVE",
        "Only active calendar blocks can be released.",
      );
    }

    return CalendarBlock.create({
      ...this.props,
      status: "RELEASED",
      updatedAt: releasedAt,
    });
  }

  toSnapshot(): CalendarBlockSnapshot {
    return {
      bookingId: this.props.bookingId,
      createdAt: this.props.createdAt.toISOString(),
      createdByUserId: this.props.createdByUserId,
      experienceId: this.props.experienceId,
      expiresAt: this.props.expiresAt?.toISOString() ?? null,
      id: this.props.id,
      localDate: this.props.localDate,
      protectedEndAt: this.props.protectedEndAt.toISOString(),
      protectedStartAt: this.props.protectedStartAt.toISOString(),
      reason: this.props.reason,
      source: this.props.source,
      status: this.props.status,
      timeZone: this.props.timeZone,
      updatedAt: this.props.updatedAt.toISOString(),
      visibleEndMinutes: this.props.visibleEndMinutes,
      visibleStartMinutes: this.props.visibleStartMinutes,
    };
  }
}

function assertLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw domainError(
      "CALENDAR_BLOCK_RANGE_INVALID",
      "Calendar block local date must use YYYY-MM-DD.",
    );
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw domainError(
      "CALENDAR_BLOCK_RANGE_INVALID",
      "Calendar block local date is invalid.",
    );
  }
}

function assertVisibleRange(startMinutes: number, endMinutes: number) {
  if (
    !Number.isInteger(startMinutes) ||
    !Number.isInteger(endMinutes) ||
    startMinutes < 0 ||
    endMinutes > 24 * 60 ||
    endMinutes <= startMinutes
  ) {
    throw domainError(
      "CALENDAR_BLOCK_RANGE_INVALID",
      "Calendar block visible time range is invalid.",
    );
  }
}

function assertProtectedRange(startAt: Date, endAt: Date) {
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    endAt.getTime() <= startAt.getTime()
  ) {
    throw domainError(
      "CALENDAR_BLOCK_RANGE_INVALID",
      "Calendar block protected time range is invalid.",
    );
  }
}

function assertTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
  } catch {
    throw domainError(
      "CALENDAR_BLOCK_TIME_ZONE_INVALID",
      "Calendar block time zone is invalid.",
    );
  }
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
