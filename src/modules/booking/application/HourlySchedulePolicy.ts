import { ApplicationError } from "@/shared/application/ApplicationError";
import { boatCalendarTimeZone } from "@/modules/boat-calendar/application/CalendarDateTime";
import { hourlyDepartureSchedule } from "../domain/HourlyDepartureSchedule";
import type { BookingSunTimes } from "./ports/BookingSunTimes";
import type { BookingSlotPolicyReadModel } from "./ports/BookingRepository";

const solarTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: boatCalendarTimeZone,
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function resolveHourlySchedulePolicy(
  experience: { id: string; slotPolicy: BookingSlotPolicyReadModel },
  localDate: string,
  hours: number,
  sunTimes?: BookingSunTimes,
): BookingSlotPolicyReadModel {
  if (experience.slotPolicy.mode !== "HOURLY_SOLAR")
    return experience.slotPolicy;
  if (
    !sunTimes?.sunrise ||
    !["daytrip", "sunrise", "ex-sunset", "romantic"].includes(experience.id)
  ) {
    throw new ApplicationError(
      "BOOKING_SELECTED_SLOT_OUTSIDE_POLICY",
      "Hourly solar schedule unavailable.",
    );
  }
  const departures = hourlyDepartureSchedule({
    experienceId: experience.id,
    hours,
    sunriseMinutes: solarMinutes(sunTimes.sunrise(localDate)),
    sunsetMinutes: solarMinutes(sunTimes.sunset(localDate)),
    romanticStartMinutes: 9 * 60,
  });
  // Alternative departures may overlap; occupancy is checked separately against
  // the shared boat calendar. These are not persisted fixed-slot windows.
  return {
    mode: "FIXED_SLOTS",
    timeZone: boatCalendarTimeZone,
    fixedSlots: departures.map((slot) => ({
      ...slot,
      enabled: true,
      id: `hourly-${slot.startMinutes}`,
      label: String(slot.startMinutes),
    })),
  };
}

export function solarMinutes(date: Date): number {
  const parts = solarTimeFormatter.formatToParts(date);
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  return value("hour") * 60 + value("minute") + value("second") / 60;
}
