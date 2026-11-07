import { domainError } from "@/shared/domain/DomainError";
import type { MoneySnapshot } from "@/shared/domain/Money";

export type HourlyRate = {
  hours: number;
  total: MoneySnapshot;
  deposit: MoneySnapshot;
};
export function requireHourlyRate(
  rates: readonly HourlyRate[] | undefined,
  hours: number,
): HourlyRate {
  if (!Number.isInteger(hours) || hours < 1 || hours > 6) {
    throw domainError(
      "BOOKING_DURATION_INVALID",
      "Choose a duration from 1 to 6 hours.",
    );
  }
  const rate = rates?.find((item) => item.hours === hours);
  if (
    !rate ||
    !Number.isSafeInteger(rate.total.amountMinor) ||
    rate.total.amountMinor <= 0 ||
    !Number.isSafeInteger(rate.deposit.amountMinor) ||
    rate.deposit.amountMinor <= 0 ||
    rate.deposit.amountMinor > rate.total.amountMinor ||
    rate.deposit.currency !== rate.total.currency
  ) {
    throw domainError(
      "BOOKING_RATE_UNAVAILABLE",
      "This duration has no confirmed booking tariff.",
    );
  }
  return rate;
}
