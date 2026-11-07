import { describe, expect, it } from "vitest";
import { requireHourlyRate } from "./HourlyRate";
const rate = {
  hours: 1,
  total: { amountMinor: 9900, currency: "EUR" as const },
  deposit: { amountMinor: 5000, currency: "EUR" as const },
};
describe("Hourly tariffs", () => {
  it.each([0, 7, -1, 1.5, NaN])("rejects unsupported duration %s", (hours) =>
    expect(() => requireHourlyRate([rate], hours)).toThrow(),
  );
  it("does not substitute another duration or zero when the tariff is missing", () => {
    expect(() => requireHourlyRate([rate], 2)).toThrow();
    expect(() => requireHourlyRate(undefined, 1)).toThrow();
    expect(() => requireHourlyRate([], 1)).toThrow();
  });
  it("rejects nonpositive prices and deposits above the total", () => {
    expect(() =>
      requireHourlyRate(
        [{ ...rate, total: { ...rate.total, amountMinor: 0 } }],
        1,
      ),
    ).toThrow();
    expect(() =>
      requireHourlyRate(
        [{ ...rate, deposit: { ...rate.deposit, amountMinor: 10000 } }],
        1,
      ),
    ).toThrow();
  });
});
