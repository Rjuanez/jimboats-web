import { domainError } from "./DomainError";

export type TimeRangeSnapshot = {
  endMinutes: number;
  startMinutes: number;
};

export class TimeRange {
  private constructor(
    readonly startMinutes: number,
    readonly endMinutes: number,
  ) {}

  static create(input: TimeRangeSnapshot) {
    if (
      !Number.isInteger(input.startMinutes) ||
      !Number.isInteger(input.endMinutes)
    ) {
      throw domainError(
        "TIME_RANGE_INVALID",
        "Time range minutes must be integers.",
      );
    }

    if (
      input.startMinutes < 0 ||
      input.endMinutes > 24 * 60 ||
      input.endMinutes <= input.startMinutes
    ) {
      throw domainError("TIME_RANGE_INVALID", "Time range is invalid.");
    }

    return new TimeRange(input.startMinutes, input.endMinutes);
  }

  static fromLocalTimes(startTime: string, endTime: string) {
    return TimeRange.create({
      endMinutes: parseLocalTime(endTime),
      startMinutes: parseLocalTime(startTime),
    });
  }

  overlaps(other: TimeRange) {
    return (
      this.startMinutes < other.endMinutes &&
      other.startMinutes < this.endMinutes
    );
  }

  toSnapshot(): TimeRangeSnapshot {
    return {
      endMinutes: this.endMinutes,
      startMinutes: this.startMinutes,
    };
  }
}

function parseLocalTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw domainError("TIME_RANGE_INVALID", "Local time is invalid.");
  }

  return hour * 60 + minute;
}
