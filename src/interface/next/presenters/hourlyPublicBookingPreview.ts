import type { PublicBookingExperienceAvailabilityDto } from "@/modules/booking/application/PublicBookingDtos";

// Clearly labelled visual preview only. Never used to confirm availability or create bookings.
export function hourlyPreviewAvailability(
  experienceId: string,
  hours: number,
): PublicBookingExperienceAvailabilityDto {
  const days = Array.from({ length: 60 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + index + 1);
    return { localDate: date.toISOString().slice(0, 10), available: true };
  });
  const starts =
    experienceId === "sunrise"
      ? [7 * 60, 8 * 60]
      : experienceId === "ex-sunset"
        ? [16 * 60, 17 * 60]
        : [10 * 60, 12 * 60, 14 * 60];
  const clock = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return {
    days,
    timeSlotsByDate: Object.fromEntries(
      days.map((day) => [
        day.localDate,
        starts.map((startMinutes) => ({
          available: true,
          availableExtraIds: ["paddle-surf"],
          id: `${day.localDate}-${startMinutes}-${hours}`,
          label: `${clock(startMinutes)} – ${clock(startMinutes + hours * 60)}`,
          startMinutes,
          endMinutes: startMinutes + hours * 60,
          slotKey: null,
        })),
      ]),
    ),
  };
}
