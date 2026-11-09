import { describe, expect, it } from "vitest";
import { parseAdminAvailability } from "./adminAvailabilityValidators";
const input = {
  experienceId: "daytrip",
  name: "Paseo privado",
  bufferMinutes: 15,
  minimumAdvanceMinutes: 60,
  maximumAdvanceMonths: 6,
  allowsManualScheduling: true,
  mode: "ANY_AVAILABLE",
  startTime: "10:00",
  endTime: "20:00",
  granularityMinutes: 30,
  slots: [],
};
describe("operational availability input", () => {
  it("persists the opt-in solar mode without obsolete time windows", () => {
    expect(
      parseAdminAvailability({ ...input, mode: "HOURLY_SOLAR" }).slotPolicy,
    ).toEqual({ mode: "HOURLY_SOLAR", timeZone: "Europe/Madrid" });
  });
  it("maps times and only allows operational fields", () => {
    const result = parseAdminAvailability({
      ...input,
      basePrice: 1,
      title: "tampered",
      translations: {},
    });
    expect(result).toEqual({
      experienceId: "daytrip",
      bufferMinutes: 15,
      minimumAdvanceMinutes: 60,
      maximumAdvanceMonths: 6,
      allowsManualScheduling: true,
      slotPolicy: {
        mode: "ANY_AVAILABLE",
        timeZone: "Europe/Madrid",
        granularityMinutes: 30,
        operatingWindow: { startMinutes: 600, endMinutes: 1200 },
      },
    });
  });
  it("preserves fixed departures, bounds and disabled slots", () => {
    expect(
      parseAdminAvailability({
        ...input,
        mode: "FIXED_SLOTS",
        slots: [
          {
            id: "morning",
            startTime: "07:30",
            endTime: "12:00",
            enabled: false,
          },
        ],
      }).slotPolicy,
    ).toEqual({
      mode: "FIXED_SLOTS",
      timeZone: "Europe/Madrid",
      fixedSlots: [
        {
          id: "morning",
          label: "07:30",
          startMinutes: 450,
          endMinutes: 720,
          enabled: false,
        },
      ],
    });
  });
  it.each([
    { startTime: "25:00" },
    { bufferMinutes: -1 },
    { granularityMinutes: 0 },
    { maximumAdvanceMonths: 7 },
  ])("rejects invalid settings %s", (patch) => {
    expect(() => parseAdminAvailability({ ...input, ...patch })).toThrow();
  });
});
