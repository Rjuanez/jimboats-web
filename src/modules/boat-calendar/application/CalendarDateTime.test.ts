import { describe, expect, it } from "vitest";
import { localDateTimeToUtcDate, todayLocalDate } from "./CalendarDateTime";

describe("calendar time zone conversion", () => {
  it("keeps the correct Madrid offset when alternating seasons and time zones", () => {
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const [day, expected] of [
        ["2026-03-28", "08:00"],
        ["2026-03-29", "07:00"],
        ["2026-10-24", "07:00"],
        ["2026-10-25", "08:00"],
      ]) {
        expect(localDateTimeToUtcDate(day, 540).toISOString()).toBe(
          `${day}T${expected}:00.000Z`,
        );
        expect(localDateTimeToUtcDate(day, 540, "UTC").toISOString()).toBe(
          `${day}T09:00:00.000Z`,
        );
      }
    }
  });

  it("computes each local date from the current instant, including midnight and DST", () => {
    const summer = new Date("2026-07-01T22:30:00Z");
    const winter = new Date("2026-01-01T22:30:00Z");
    expect(todayLocalDate(summer)).toBe("2026-07-02");
    expect(todayLocalDate(summer, "UTC")).toBe("2026-07-01");
    expect(todayLocalDate(winter)).toBe("2026-01-01");
    expect(todayLocalDate(new Date("2026-01-01T23:30:00Z"))).toBe("2026-01-02");
    expect(todayLocalDate(summer)).toBe("2026-07-02");
  });
});
