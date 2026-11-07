export function finishesBeforeSunset(
  experienceId: string,
  endAt: Date,
  sunset: Date,
): boolean {
  return experienceId !== "daytrip" || endAt.getTime() < sunset.getTime();
}
