import type { Booking } from "../domain/Booking";
import type { AdminBookingDto } from "./AdminBookingDtos";

export function bookingToAdminDto(booking: Booking): AdminBookingDto {
  const snapshot = booking.toSnapshot();

  return {
    ...snapshot,
    endTime: minutesToClockTime(snapshot.selectedSlot.endMinutes),
    startTime: minutesToClockTime(snapshot.selectedSlot.startMinutes),
  };
}

export function minutesToClockTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}
