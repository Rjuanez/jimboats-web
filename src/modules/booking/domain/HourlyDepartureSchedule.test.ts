import { describe, expect, it } from "vitest";
import { hourlyDepartureSchedule } from "./HourlyDepartureSchedule";

const winter = {
  sunriseMinutes: 7 * 60 + 35,
  sunsetMinutes: 17 * 60 + 34,
  romanticStartMinutes: 9 * 60,
};
const schedule = (experienceId: string, hours: number, sun = winter) =>
  hourlyDepartureSchedule({ ...sun, experienceId, hours });

describe("hourly departure schedule", () => {
  it("keeps six-hour daytime trips and removes late departures in winter", () => {
    expect(schedule("daytrip", 6)).toEqual([
      { startMinutes: 540, endMinutes: 900 },
      { startMinutes: 600, endMinutes: 960 },
      { startMinutes: 660, endMinutes: 1020 },
    ]);
    expect(
      schedule("daytrip", 6, { ...winter, sunsetMinutes: 21 * 60 + 26 }),
    ).toHaveLength(7);
  });

  it("does not offer a daytime return at or after sunset", () => {
    const slots = schedule("daytrip", 1, { ...winter, sunsetMinutes: 17 * 60 });
    expect(slots.at(-1)).toEqual({
      startMinutes: 15 * 60,
      endMinutes: 16 * 60,
    });
    expect(
      schedule("daytrip", 6, { ...winter, sunsetMinutes: 14 * 60 }),
    ).toEqual([]);
  });

  it("keeps the sunrise departure when duration increases", () => {
    expect(schedule("sunrise", 2)).toEqual([
      { startMinutes: 420, endMinutes: 540 },
    ]);
    expect(schedule("sunrise", 6)).toEqual([
      { startMinutes: 420, endMinutes: 780 },
    ]);
  });

  it("adds sunset hours before the trip, retaining the same return", () => {
    expect(schedule("ex-sunset", 2)).toEqual([
      { startMinutes: 960, endMinutes: 1080 },
    ]);
    expect(schedule("ex-sunset", 6)).toEqual([
      { startMinutes: 720, endMinutes: 1080 },
    ]);
  });

  it("offers romantic four-hour trips without passing the 21:30 return limit", () => {
    const slots = schedule("romantic", 4);
    expect(slots.at(-1)).toEqual({ startMinutes: 1020, endMinutes: 1260 });
    expect(slots.every((slot) => slot.endMinutes <= 1290)).toBe(true);
    expect(schedule("romantic", 1).at(-1)).toEqual({
      startMinutes: 1200,
      endMinutes: 1260,
    });
  });

  it("honours the romantic opening time and offers only whole-hour departures", () => {
    expect(
      schedule("romantic", 4, { ...winter, romanticStartMinutes: 16 * 60 }),
    ).toEqual([
      { startMinutes: 960, endMinutes: 1200 },
      { startMinutes: 1020, endMinutes: 1260 },
    ]);
    for (const id of ["daytrip", "sunrise", "ex-sunset", "romantic"]) {
      for (const hours of [1, 2, 3, 4, 5, 6]) {
        for (const slot of schedule(id, hours)) {
          expect(slot.startMinutes % 60).toBe(0);
          expect(slot.endMinutes - slot.startMinutes).toBe(hours * 60);
        }
      }
    }
  });

  it("does not invent unsupported experiences or durations", () => {
    expect(schedule("unknown", 2)).toEqual([]);
    expect(schedule("sunrise", 1)).toEqual([]);
    expect(schedule("ex-sunset", 1)).toEqual([]);
    expect(schedule("romantic", 5)).toEqual([]);
    expect(() => schedule("daytrip", 1.5)).toThrow();
  });
});
