import type { PublicBookingExperienceAvailabilityDto } from "@/modules/booking/application/PublicBookingDtos";
import { getHourlySchedulePreview } from "@/container";

// Clearly labelled visual preview only. Never used to confirm availability or create bookings.
export function hourlyPreviewAvailability(
  experienceId: string,
  hours: number,
): PublicBookingExperienceAvailabilityDto {
  return getHourlySchedulePreview(experienceId, hours, 9 * 60);
}
