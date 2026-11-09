import { getTimes } from "suncalc";
import type { BookingSolarTimes } from "@/modules/booking/application/ports/BookingSunTimes";

export class SunCalcBookingSunTimes implements BookingSolarTimes {
  sunrise(localDate: string): Date {
    return this.event(localDate, "sunrise");
  }

  sunset(localDate: string): Date {
    return this.event(localDate, "sunset");
  }

  private event(localDate: string, name: "sunrise" | "sunset"): Date {
    // Noon UTC is safely inside the requested civil day in Barcelona, including DST.
    const event = getTimes(new Date(`${localDate}T12:00:00Z`), 41.387, 2.201)[
      name
    ];
    if (!event || Number.isNaN(event.getTime()))
      throw new Error(`${name} could not be calculated.`);
    return event;
  }
}
