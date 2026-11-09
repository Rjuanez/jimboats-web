import { solarMinutes } from "./HourlySchedulePolicy";
import {
  addDaysToLocalDate,
  minutesToClockTime,
  todayLocalDate,
} from "@/modules/boat-calendar/application/CalendarDateTime";
import { hourlyDepartureSchedule } from "../domain/HourlyDepartureSchedule";
import type { BookingSolarTimes } from "./ports/BookingSunTimes";
import type { PublicBookingExperienceAvailabilityDto } from "./PublicBookingDtos";

/** Review-only calendar: no database, occupancy, holds, payments or notifications. */
export function previewHourlySchedule(input: {
  experienceId: string;
  hours: number;
  now: Date;
  sunTimes: BookingSolarTimes;
  romanticStartMinutes: number;
}): PublicBookingExperienceAvailabilityDto {
  const timeSlotsByDate: PublicBookingExperienceAvailabilityDto["timeSlotsByDate"] =
    {};
  const today = todayLocalDate(input.now);
  // Six months allow the user to compare winter and summer departure times.
  const last = new Date(`${today}T12:00:00Z`);
  last.setUTCMonth(last.getUTCMonth() + 6);
  const endDate = last.toISOString().slice(0, 10);
  const days: PublicBookingExperienceAvailabilityDto["days"] = [];
  for (
    let localDate = addDaysToLocalDate(today, 1);
    localDate <= endDate;
    localDate = addDaysToLocalDate(localDate, 1)
  ) {
    const departures = hourlyDepartureSchedule({
      experienceId: input.experienceId,
      hours: input.hours,
      sunriseMinutes: solarMinutes(input.sunTimes.sunrise(localDate)),
      sunsetMinutes: solarMinutes(input.sunTimes.sunset(localDate)),
      romanticStartMinutes: input.romanticStartMinutes,
    });
    const slots = departures.map((slot) => ({
      ...slot,
      available: true,
      availableExtraIds: ["paddle-surf"],
      id: `${localDate}-${slot.startMinutes}-${input.hours}`,
      label: minutesToClockTime(slot.startMinutes),
      slotKey: null,
    }));
    timeSlotsByDate[localDate] = slots;
    days.push({ localDate, available: slots.length > 0 });
  }
  return { days, timeSlotsByDate };
}
