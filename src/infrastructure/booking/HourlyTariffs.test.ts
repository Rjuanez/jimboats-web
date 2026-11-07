import { describe, expect, it } from "vitest";
import { requireHourlyRate } from "@/modules/booking/domain/HourlyRate";
import {
  approvedHourlyTariffs,
  localHourlyTariffs,
  localBookingsEnabled,
  resolveHourlyTariffs,
} from "./HourlyTariffs";
const local = {
  JIMBOATS_LOCAL_BOOKINGS: "1",
  JIMBOATS_SEO_PREVIEW: "1",
  DATABASE_URL: "postgresql://test@127.0.0.1:55439/jimboats_hourly_preview",
  PUBLIC_SITE_URL: "http://127.0.0.1:3100",
};
describe("Isolated hourly simulation", () => {
  it("reads the current persisted deposit for approved rates, independently of preview", () => {
    const record = { id: "daytrip", depositAmountMinor: 10000, depositCurrency: "EUR" };
    expect(resolveHourlyTariffs(approvedHourlyTariffs, record)?.[0].deposit.amountMinor).toBe(10000);
    expect(resolveHourlyTariffs(approvedHourlyTariffs, { ...record, depositAmountMinor: 8000 })?.[0].deposit.amountMinor).toBe(8000);
    expect(resolveHourlyTariffs(localHourlyTariffs, record)?.[0].deposit.amountMinor).toBe(5000);
    expect(() => resolveHourlyTariffs(approvedHourlyTariffs, { ...record, depositCurrency: "USD" })).toThrow();
  });
  it("uses confirmed live totals with the existing production deposit", () => {
    const deposit = { amountMinor: 10000, currency: "EUR" as const };
    expect(approvedHourlyTariffs("daytrip", deposit)?.[0]).toEqual({
      hours: 1, total: { amountMinor: 12000, currency: "EUR" }, deposit,
    });
    expect(approvedHourlyTariffs("romantic", deposit)?.at(-1)?.total.amountMinor).toBe(55000);
    expect(approvedHourlyTariffs("retired", deposit)).toBeUndefined();
    expect(() => requireHourlyRate(approvedHourlyTariffs("daytrip", { ...deposit, amountMinor: 20000 }), 1)).toThrow();
    expect(Object.values(localHourlyTariffs).flat()).toHaveLength(20);
  });
  it("rejects one-hour sunrise and sunset tariffs on the server", () => {
    expect(requireHourlyRate(localHourlyTariffs.daytrip, 1).hours).toBe(1);
    for (const id of ["ex-sunset", "sunrise"]) {
      expect(() => requireHourlyRate(localHourlyTariffs[id], 1)).toThrow();
      expect(requireHourlyRate(localHourlyTariffs[id], 2).hours).toBe(2);
    }
  });
  it("accepts the four romantic tariffs and rejects five or six hours on the server", () => {
    const deposit = { amountMinor: 10000, currency: "EUR" as const };
    for (const rates of [localHourlyTariffs.romantic, approvedHourlyTariffs("romantic", deposit)]) {
      for (const [hours, amount] of [[1, 25000], [2, 35000], [3, 45000], [4, 55000]]) {
        expect(requireHourlyRate(rates, hours).total.amountMinor).toBe(amount);
      }
      for (const hours of [5, 6]) expect(() => requireHourlyRate(rates, hours)).toThrow();
    }
  });
  it("is opt-in and only allows the isolated database and local site", () => {
    expect(localBookingsEnabled({})).toBe(false);
    expect(localBookingsEnabled(local)).toBe(true);
    expect(() =>
      localBookingsEnabled({
        ...local,
        DATABASE_URL: "postgresql://test@production/jimboats",
      }),
    ).toThrow();
    expect(() =>
      localBookingsEnabled({
        ...local,
        PUBLIC_SITE_URL: "https://jimboatscharter.com",
      }),
    ).toThrow();
    expect(() =>
      localBookingsEnabled({ ...local, GOOGLE_CALENDAR_ENABLED: "true" }),
    ).toThrow();
  });
});
