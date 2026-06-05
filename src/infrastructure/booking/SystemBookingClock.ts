import type { BookingClock } from "@/modules/booking/application/ports/BookingClock";

export class SystemBookingClock implements BookingClock {
  now() {
    return new Date();
  }
}
