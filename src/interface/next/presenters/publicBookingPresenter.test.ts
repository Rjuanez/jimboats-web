import { describe, expect, it } from "vitest";
import { presentPublicBookingAvailability } from "./publicBookingPresenter";

describe("calendar labels", () => {
  it("keeps locales separate and preserves dates and availability across months", () => {
    const availability = {
      days: [
        { localDate: "2026-03-29", available: true },
        { localDate: "2026-03-30", available: false },
        { localDate: "2026-04-01", available: true },
      ],
      timeSlotsByDate: {},
    };
    for (const [locale, march, april] of [
      ["es", "marzo de 2026", "abril de 2026"],
      ["en", "March 2026", "April 2026"],
      ["fr", "mars 2026", "avril 2026"],
      ["es", "marzo de 2026", "abril de 2026"],
    ] as const) {
      const result = presentPublicBookingAvailability(availability, locale);
      expect(result.calendar.months?.map((month) => month.monthLabel)).toEqual([
        march,
        april,
      ]);
      expect(
        result.calendar.months
          ?.flatMap((month) => month.days)
          .map((day) => ({
            id: day.id,
            dayLabel: day.dayLabel,
            disabled: day.disabled,
          })),
      ).toEqual([
        { id: "2026-03-29", dayLabel: "29", disabled: false },
        { id: "2026-03-30", dayLabel: "30", disabled: true },
        { id: "2026-04-01", dayLabel: "1", disabled: false },
      ]);
      expect(result.timeSlotsByDate).toEqual({});
    }
    const spanish = presentPublicBookingAvailability(availability, "es");
    expect(spanish.calendar.days[0].ariaLabel).toBe(
      "domingo, 29 de marzo de 2026",
    );
    expect(spanish.calendar.days[0].dateLabel).toBe("29 mar");
  });
});
