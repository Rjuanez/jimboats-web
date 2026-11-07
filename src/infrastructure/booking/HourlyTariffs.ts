import type { HourlyRate } from "@/modules/booking/domain/HourlyRate";
import { hourlyPrices } from "@/content/booking/hourlyPrices";

export const localHourlyTariffs: Record<string, HourlyRate[]> = Object.fromEntries(
  Object.entries(hourlyPrices).map(([id, prices]) => [
    id,
    Object.entries(prices).map(([hours, euros]): HourlyRate => ({
      hours: Number(hours),
      total: { amountMinor: euros * 100, currency: "EUR" },
      deposit: { amountMinor: 5000, currency: "EUR" },
    })),
  ]),
);

type Deposit = HourlyRate["deposit"];
export type HourlyTariffSource = Record<string, HourlyRate[]> |
  ((experienceId: string, deposit: Deposit) => HourlyRate[] | undefined);

// Use the owner's confirmed totals and retain the operational deposit from DB.
export function approvedHourlyTariffs(experienceId: string, deposit: Deposit): HourlyRate[] | undefined {
  const prices = hourlyPrices[experienceId];
  if (!prices) return undefined;
  return Object.entries(prices).map(([hours, euros]) => ({
    hours: Number(hours),
    total: { amountMinor: euros * 100, currency: "EUR" },
    deposit,
  }));
}

export function resolveHourlyTariffs(source: HourlyTariffSource, record: {
  id: string; depositAmountMinor: number; depositCurrency: string;
}) {
  if (record.depositCurrency !== "EUR") throw new Error("Unsupported deposit currency.");
  return typeof source === "function"
    ? source(record.id, { amountMinor: record.depositAmountMinor, currency: "EUR" })
    : source[record.id];
}

export function localBookingsEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (env.JIMBOATS_LOCAL_BOOKINGS !== "1") return false;
  const db = new URL(env.DATABASE_URL || "http://invalid");
  const site = new URL(env.PUBLIC_SITE_URL || "http://invalid");
  if (
    db.hostname !== "127.0.0.1" ||
    db.pathname !== "/jimboats_hourly_preview" ||
    site.hostname !== "127.0.0.1" ||
    env.JIMBOATS_SEO_PREVIEW !== "1" ||
    env.GOOGLE_CALENDAR_ENABLED === "true"
  ) {
    throw new Error(
      "Local booking simulation requires the isolated loopback preview database and website.",
    );
  }
  return true;
}
