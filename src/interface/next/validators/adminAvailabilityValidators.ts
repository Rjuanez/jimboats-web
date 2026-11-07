import { z } from "zod";
import type { UpdateExperienceAvailabilityCommand } from "@/modules/experience-catalog/application/AdminExperienceDtos";
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa el formato HH:mm.");
const schema = z.object({
  experienceId: z.string().trim().min(1),
  bufferMinutes: z.number().int().min(0).max(720),
  minimumAdvanceMinutes: z.number().int().min(0),
  maximumAdvanceMonths: z.number().int().min(1).max(6),
  allowsManualScheduling: z.boolean(),
  mode: z.enum(["ANY_AVAILABLE", "FIXED_SLOTS", "MANUAL_APPROVAL"]),
  startTime: time,
  endTime: time,
  granularityMinutes: z.number().int().min(1).max(720),
  slots: z
    .array(
      z.object({
        id: z.string().min(1),
        enabled: z.boolean(),
        startTime: time,
        endTime: time,
      }),
    )
    .max(48),
});
function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}
export function parseAdminAvailability(
  input: unknown,
): UpdateExperienceAvailabilityCommand {
  const data = schema.parse(input);
  return {
    experienceId: data.experienceId,
    bufferMinutes: data.bufferMinutes,
    minimumAdvanceMinutes: data.minimumAdvanceMinutes,
    maximumAdvanceMonths: data.maximumAdvanceMonths,
    allowsManualScheduling: data.allowsManualScheduling,
    slotPolicy:
      data.mode === "ANY_AVAILABLE"
        ? {
            mode: data.mode,
            timeZone: "Europe/Madrid",
            granularityMinutes: data.granularityMinutes,
            operatingWindow: {
              startMinutes: minutes(data.startTime),
              endMinutes: minutes(data.endTime),
            },
          }
        : data.mode === "FIXED_SLOTS"
          ? {
              mode: data.mode,
              timeZone: "Europe/Madrid",
              fixedSlots: data.slots.map((slot) => ({
                id: slot.id,
                label: slot.startTime,
                enabled: slot.enabled,
                startMinutes: minutes(slot.startTime),
                endMinutes: minutes(slot.endTime),
              })),
            }
          : { mode: data.mode, timeZone: "Europe/Madrid" },
  };
}
