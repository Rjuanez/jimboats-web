import { domainError } from "@/shared/domain/DomainError";

export type SelectedSlotProps = {
  endMinutes: number;
  localDate: string;
  slotKey: string | null;
  startMinutes: number;
  timeZone: string;
};

export type SelectedSlotSnapshot = SelectedSlotProps & {
  durationMinutes: number;
};

export class SelectedSlot {
  private constructor(private readonly props: SelectedSlotProps) {}

  static create(input: SelectedSlotProps) {
    const localDate = input.localDate.trim();
    const timeZone = input.timeZone.trim();
    const slotKey = input.slotKey?.trim() || null;

    assertLocalDate(localDate);
    assertTimeZone(timeZone);
    assertMinutes(input.startMinutes, input.endMinutes);

    return new SelectedSlot({
      endMinutes: input.endMinutes,
      localDate,
      slotKey,
      startMinutes: input.startMinutes,
      timeZone,
    });
  }

  get durationMinutes() {
    return this.props.endMinutes - this.props.startMinutes;
  }

  get endMinutes() {
    return this.props.endMinutes;
  }

  get localDate() {
    return this.props.localDate;
  }

  get slotKey() {
    return this.props.slotKey;
  }

  get startMinutes() {
    return this.props.startMinutes;
  }

  get timeZone() {
    return this.props.timeZone;
  }

  toSnapshot(): SelectedSlotSnapshot {
    return {
      ...this.props,
      durationMinutes: this.durationMinutes,
    };
  }
}

function assertLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw domainError(
      "BOOKING_SELECTED_SLOT_INVALID",
      "Selected slot date must use YYYY-MM-DD.",
    );
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw domainError(
      "BOOKING_SELECTED_SLOT_INVALID",
      "Selected slot date is invalid.",
    );
  }
}

function assertTimeZone(value: string) {
  if (value !== "Europe/Madrid") {
    throw domainError(
      "BOOKING_SELECTED_SLOT_INVALID",
      "Selected slot time zone must be Europe/Madrid.",
    );
  }
}

function assertMinutes(startMinutes: number, endMinutes: number) {
  if (
    !Number.isInteger(startMinutes) ||
    !Number.isInteger(endMinutes) ||
    startMinutes < 0 ||
    endMinutes > 24 * 60 ||
    endMinutes <= startMinutes
  ) {
    throw domainError(
      "BOOKING_SELECTED_SLOT_INVALID",
      "Selected slot time range is invalid.",
    );
  }
}
