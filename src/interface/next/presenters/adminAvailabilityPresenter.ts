import type { AvailabilitySettings } from "@/components/sections/admin-availability/AdminAvailabilityTypes";
import type { AdminExperienceDto } from "@/modules/experience-catalog/application/AdminExperienceDtos";
import { getMarketingPage } from "@/content/marketing";
function clock(minutes: number) {
  return `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
}
export function presentAvailability(
  experience: AdminExperienceDto,
): AvailabilitySettings {
  const policy = experience.slotPolicy;
  const title = getMarketingPage("es").experiences.find(
    (item) => item.bookingId === experience.id,
  )?.title;
  return {
    experienceId: experience.id,
    hourlyScheduleDescription: (
      {
        daytrip:
          "Salidas en punto desde las 09:00, de 1 a 6 horas. El regreso debe ser anterior a la puesta de sol de cada fecha.",
        sunrise:
          "De 2 a 6 horas. Salida a la hora en punto anterior al amanecer; las horas adicionales retrasan el regreso.",
        "ex-sunset":
          "De 2 a 6 horas. Regreso a la hora en punto posterior a la puesta de sol; las horas adicionales adelantan la salida.",
        romantic:
          "Salidas en punto desde las 09:00, de 1 a 4 horas. Regreso máximo a las 21:30; con horas completas, el último regreso es a las 21:00.",
      } as Record<string, string>
    )[experience.id],
    name: title ?? experience.internalName,
    bufferMinutes: experience.bufferMinutes,
    minimumAdvanceMinutes: experience.minimumAdvanceMinutes,
    maximumAdvanceMonths: experience.maximumAdvanceMonths,
    allowsManualScheduling: experience.allowsManualScheduling,
    mode: policy.mode,
    startTime: clock(policy.operatingWindow?.startMinutes ?? 600),
    endTime: clock(policy.operatingWindow?.endMinutes ?? 1200),
    granularityMinutes: policy.granularityMinutes ?? 30,
    slots: policy.fixedSlots.map((slot) => ({
      id: slot.id,
      enabled: slot.enabled,
      startTime: clock(slot.startMinutes),
      endTime: clock(slot.endMinutes),
    })),
  };
}
export async function getAdminAvailability(): Promise<AvailabilitySettings[]> {
  const { getContainer } = await import("@/container");
  const workspace = await getContainer().adminExperiences.getWorkspace();
  return workspace.experiences
    .filter((item) => item.experience.status !== "ARCHIVED")
    .map((item) => presentAvailability(item.experience));
}
