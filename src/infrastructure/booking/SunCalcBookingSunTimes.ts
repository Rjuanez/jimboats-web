import { getTimes } from "suncalc";
import type { BookingSunTimes } from "@/modules/booking/application/ports/BookingSunTimes";

export class SunCalcBookingSunTimes implements BookingSunTimes {
  sunset(localDate: string): Date {
    // Noon UTC is safely inside the requested civil day in Barcelona, including DST.
    const sunset = getTimes(
      new Date(`${localDate}T12:00:00Z`),
      41.387,
      2.201,
    ).sunset;
    if (!sunset || Number.isNaN(sunset.getTime()))
      throw new Error("Sunset could not be calculated.");
    return sunset;
  }
}
