import { describe, expect, it } from "vitest";
import { SunCalcBookingSunTimes } from "./SunCalcBookingSunTimes";
const provider = new SunCalcBookingSunTimes();
describe("Barcelona sunset", () => {
  it.each([
    ["2026-01-15", "08:17"],
    ["2026-06-15", "06:18"],
    ["2026-11-12", "07:35"],
  ])("calculates sunrise on %s in Barcelona", (date, expected) => {
    const local = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    }).format(provider.sunrise(date));
    const minutes = (time: string) =>
      Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
    expect(Math.abs(minutes(local) - minutes(expected))).toBeLessThan(4);
  });
  it.each([
    ["2026-01-15", "17:46"],
    ["2026-06-15", "21:26"],
    ["2026-10-15", "19:10"],
  ])(
    "calculates %s near the independently recorded monthly reference",
    (date, expected) => {
      const local = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
      }).format(provider.sunset(date));
      const minutes = (time: string) =>
        Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
      expect(Math.abs(minutes(local) - minutes(expected))).toBeLessThan(4);
    },
  );
  it("uses the selected civil date on either side of DST", () => {
    const before = provider.sunset("2026-10-24");
    const after = provider.sunset("2026-10-25");
    expect(after.getTime() - before.getTime()).toBeGreaterThan(
      23 * 60 * 60_000,
    );
    expect(after.getTime() - before.getTime()).toBeLessThan(24 * 60 * 60_000);
  });
});
