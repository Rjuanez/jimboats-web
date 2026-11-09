import { describe, expect, it } from "vitest";
import { solarMinutes } from "./HourlySchedulePolicy";

describe("solar clock minutes", () => {
  it("preserves seconds and resolves daylight saving for every instant", () => {
    for (const [instant, minutes] of [
      ["2026-03-29T00:30:30Z", 90.5],
      ["2026-03-29T01:30:30Z", 210.5],
      ["2026-10-25T00:30:30Z", 150.5],
      ["2026-10-25T01:30:30Z", 150.5],
      ["2026-07-01T22:00:00Z", 0],
      ["2026-01-01T22:00:00Z", 1380],
      ["2026-07-01T22:00:00Z", 0],
    ] as const) {
      expect(solarMinutes(new Date(instant))).toBe(minutes);
    }
  });
});
