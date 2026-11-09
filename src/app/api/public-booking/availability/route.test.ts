import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { getHourlyPublicBookingAvailability } from "@/interface/next/presenters/hourlyPublicBookingPresenter";
import { GET } from "./route";

vi.mock("@/interface/next/presenters/hourlyPublicBookingPresenter", () => ({
  getHourlyPublicBookingAvailability: vi.fn(),
}));

describe("monthly availability endpoint", () => {
  beforeEach(() => {
    vi.mocked(getHourlyPublicBookingAvailability).mockReset();
  });
  const request = (query = "") =>
    new Request(
      `https://example.com/api/public-booking/availability?locale=es&experienceId=daytrip&hours=2${query}`,
    );

  it("defaults to the current month and prevents shared HTTP caching", async () => {
    vi.mocked(getHourlyPublicBookingAvailability).mockResolvedValue(null);
    const result = await GET(request());
    expect(getHourlyPublicBookingAvailability).toHaveBeenCalledWith(
      "es",
      "daytrip",
      2,
      "current",
    );
    expect(result.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects invalid and out-of-window months", async () => {
    expect((await GET(request("&month=2026-13"))).status).toBe(400);
    expect(getHourlyPublicBookingAvailability).not.toHaveBeenCalled();
    vi.mocked(getHourlyPublicBookingAvailability).mockRejectedValue(
      new ApplicationError("CALENDAR_DATE_RANGE_INVALID", "Out of range"),
    );
    expect((await GET(request("&month=2030-01"))).status).toBe(400);
  });
});
