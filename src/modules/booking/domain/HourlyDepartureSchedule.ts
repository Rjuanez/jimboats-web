import { domainError } from "@/shared/domain/DomainError";

export type HourlyDeparture = {
  startMinutes: number;
  endMinutes: number;
};

/** Candidate departures only. Occupancy, buffers and advance notice are separate checks. */
export function hourlyDepartureSchedule(input: {
  experienceId: string;
  hours: number;
  sunriseMinutes: number;
  sunsetMinutes: number;
  romanticStartMinutes: number;
}): HourlyDeparture[] {
  if (!Number.isInteger(input.hours) || input.hours < 1 || input.hours > 6) {
    throw domainError("BOOKING_DURATION_INVALID", "Invalid hourly duration.");
  }
  const duration = input.hours * 60;
  switch (input.experienceId) {
    case "daytrip":
      // The return must be strictly before sunset, including at an exact hour.
      return hourlyWindow(9 * 60, Math.ceil(input.sunsetMinutes) - 1, duration);
    case "sunrise": {
      if (input.hours < 2) return [];
      const startMinutes = Math.floor(input.sunriseMinutes / 60) * 60;
      return [{ startMinutes, endMinutes: startMinutes + duration }];
    }
    case "ex-sunset": {
      if (input.hours < 2) return [];
      const endMinutes = Math.ceil(input.sunsetMinutes / 60) * 60;
      return [{ startMinutes: endMinutes - duration, endMinutes }];
    }
    case "romantic":
      return input.hours > 4
        ? []
        : hourlyWindow(input.romanticStartMinutes, 21 * 60 + 30, duration);
    default:
      return [];
  }
}

function hourlyWindow(first: number, lastReturn: number, duration: number) {
  const departures: HourlyDeparture[] = [];
  for (
    let startMinutes = Math.ceil(first / 60) * 60;
    startMinutes + duration <= lastReturn;
    startMinutes += 60
  ) {
    departures.push({ startMinutes, endMinutes: startMinutes + duration });
  }
  return departures;
}
