export type AvailabilitySettings = {
  experienceId: string;
  hourlyScheduleDescription?: string;
  name: string;
  bufferMinutes: number;
  minimumAdvanceMinutes: number;
  maximumAdvanceMonths: number;
  allowsManualScheduling: boolean;
  mode: "ANY_AVAILABLE" | "FIXED_SLOTS" | "MANUAL_APPROVAL" | "HOURLY_SOLAR";
  startTime: string;
  endTime: string;
  granularityMinutes: number;
  slots: Array<{
    id: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
  }>;
};
export type AvailabilitySaveResult =
  | { ok: true }
  | { ok: false; message: string };
