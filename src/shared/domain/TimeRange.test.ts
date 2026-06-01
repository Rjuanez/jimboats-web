import { describe, expect, it } from "vitest";

import { DomainError } from "./DomainError";
import { TimeRange } from "./TimeRange";

describe("TimeRange", () => {
  it("creates a valid time range from local times", () => {
    const range = TimeRange.fromLocalTimes("18:00", "20:00");

    expect(range.toSnapshot()).toEqual({
      endMinutes: 1_200,
      startMinutes: 1_080,
    });
  });

  it("detects overlapping ranges", () => {
    const sunset = TimeRange.fromLocalTimes("18:00", "20:00");
    const late = TimeRange.fromLocalTimes("19:30", "21:00");

    expect(sunset.overlaps(late)).toBe(true);
  });

  it("does not treat touching ranges as overlapping", () => {
    const morning = TimeRange.fromLocalTimes("10:00", "12:00");
    const afternoon = TimeRange.fromLocalTimes("12:00", "14:00");

    expect(morning.overlaps(afternoon)).toBe(false);
  });

  it("rejects ranges that end before they start", () => {
    expect(() => TimeRange.fromLocalTimes("12:00", "10:00")).toThrow(
      DomainError,
    );
  });
});
