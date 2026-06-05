import type { CalendarClock } from "@/modules/boat-calendar/application/ports/CalendarClock";

export class SystemCalendarClock implements CalendarClock {
  now() {
    return new Date();
  }
}
