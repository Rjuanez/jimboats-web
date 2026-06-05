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

  it("normalizes slot ids before checking uniqueness", () => {
    expect(() =>
      SlotPolicy.fixedSlots({
        fixedSlots: [
          {
            enabled: true,
            id: " sunset-1800 ",
            label: "Sunset",
            range: TimeRange.fromLocalTimes("18:00", "20:00"),
          },
          {
            enabled: true,
            id: "sunset-1800",
            label: "Same slot",
            range: TimeRange.fromLocalTimes("20:00", "22:00"),
          },
        ],
        timeZone: "Europe/Madrid",
      }),
    ).toThrow(DomainError);
  });

  it("rejects fixed slots without a label", () => {
    expect(() =>
      SlotPolicy.fixedSlots({
        fixedSlots: [
          {
            enabled: true,
            id: "sunset-1800",
            label: " ",
            range: TimeRange.fromLocalTimes("18:00", "20:00"),
          },
        ],
        timeZone: "Europe/Madrid",
      }),
    ).toThrow(DomainError);
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

  it("rejects flexible granularity larger than the operating window", () => {
    expect(() =>
      SlotPolicy.anyAvailable({
        granularityMinutes: 90,
        operatingWindow: TimeRange.fromLocalTimes("10:00", "11:00"),
        timeZone: "Europe/Madrid",
      }),
    ).toThrow(DomainError);
  });

  it("rejects unsupported time zones", () => {
    expect(() => SlotPolicy.manualApproval({ timeZone: "UTC" })).toThrow(
      DomainError,
    );
  });
});
