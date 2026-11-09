import { describe, expect, it } from "vitest";
import { previewHourlySchedule } from "./PreviewHourlySchedule";

const preview = (
  experienceId: string,
  hours: number,
  now = new Date("2026-10-23T23:30:00Z"),
) =>
  previewHourlySchedule({
    experienceId,
    hours,
    now,
    romanticStartMinutes: 9 * 60,
    sunTimes: {
      // UTC times deliberately straddle the Europe/Madrid clock change.
      sunrise: (day) => new Date(`${day}T06:10:00Z`),
      sunset: (day) => new Date(`${day}T16:55:00Z`),
    },
  });

describe("hourly schedule preview", () => {
  it("starts tomorrow in Barcelona and uses the local date across midnight", () => {
    expect(preview("daytrip", 1).days[0].localDate).toBe("2026-10-25");
  });

  it("adapts the solar departure when clocks change", () => {
    const result = preview("sunrise", 6, new Date("2026-10-23T12:00:00Z"));
    expect(result.timeSlotsByDate["2026-10-24"][0].startMinutes).toBe(8 * 60);
    expect(result.timeSlotsByDate["2026-10-25"][0].startMinutes).toBe(7 * 60);
    expect(result.timeSlotsByDate["2026-10-25"][0].endMinutes).toBe(13 * 60);
  });

  it("keeps the sunset return and advances departure for longer trips", () => {
    const shorter = preview("ex-sunset", 2).timeSlotsByDate["2026-10-25"][0];
    const longer = preview("ex-sunset", 6).timeSlotsByDate["2026-10-25"][0];
    expect(shorter.endMinutes).toBe(18 * 60);
    expect(longer.endMinutes).toBe(shorter.endMinutes);
    expect(longer.startMinutes).toBe(shorter.startMinutes - 4 * 60);
  });

  it("marks a day unavailable if the duration has no departures", () => {
    const result = preview("romantic", 5);
    expect(result.days.every((day) => !day.available)).toBe(true);
    expect(
      Object.values(result.timeSlotsByDate).every(
        (slots) => slots.length === 0,
      ),
    ).toBe(true);
  });
});
