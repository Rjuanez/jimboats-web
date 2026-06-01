import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { TimeRange } from "@/shared/domain/TimeRange";

import { SlotPolicy } from "./SlotPolicy";

describe("SlotPolicy", () => {
  it("creates fixed slots when at least one enabled slot exists", () => {
    const policy = SlotPolicy.fixedSlots({
      fixedSlots: [
        {
          enabled: true,
          id: "sunset-1800",
          label: "Sunset departure",
          range: TimeRange.fromLocalTimes("18:00", "20:00"),
        },
      ],
      timeZone: "Europe/Madrid",
    });

    expect(policy.toSnapshot()).toMatchObject({
      mode: "FIXED_SLOTS",
      timeZone: "Europe/Madrid",
    });
  });

  it("rejects overlapping enabled fixed slots", () => {
    expect(() =>
      SlotPolicy.fixedSlots({
        fixedSlots: [
          {
            enabled: true,
            id: "sunset-1800",
            label: "Sunset",
            range: TimeRange.fromLocalTimes("18:00", "20:00"),
          },
          {
            enabled: true,
            id: "late-1900",
            label: "Late",
            range: TimeRange.fromLocalTimes("19:00", "21:00"),
          },
        ],
        timeZone: "Europe/Madrid",
      }),
    ).toThrow(DomainError);
  });

  it("allows disabled slots to overlap active templates", () => {
    const policy = SlotPolicy.fixedSlots({
      fixedSlots: [
        {
          enabled: true,
          id: "sunset-1800",
          label: "Sunset",
          range: TimeRange.fromLocalTimes("18:00", "20:00"),
        },
        {
          enabled: false,
          id: "late-1900",
          label: "Late",
          range: TimeRange.fromLocalTimes("19:00", "21:00"),
        },
      ],
      timeZone: "Europe/Madrid",
    });

    expect(policy.hasOverlappingEnabledSlots()).toBe(false);
  });

  it("creates a flexible policy with operating window and granularity", () => {
    const policy = SlotPolicy.anyAvailable({
      granularityMinutes: 30,
      operatingWindow: TimeRange.fromLocalTimes("10:00", "20:00"),
      timeZone: "Europe/Madrid",
    });

    expect(policy.toSnapshot()).toMatchObject({
      granularityMinutes: 30,
      mode: "ANY_AVAILABLE",
    });
  });

  it("rejects unsupported time zones", () => {
    expect(() => SlotPolicy.manualApproval({ timeZone: "UTC" })).toThrow(
      DomainError,
    );
  });
});
