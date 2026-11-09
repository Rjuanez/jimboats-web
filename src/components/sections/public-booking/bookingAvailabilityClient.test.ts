import { afterEach, describe, expect, it, vi } from "vitest";
import { createBookingAvailabilityClient } from "./bookingAvailabilityClient";

const availability = {
  calendar: { days: [], monthLabel: "June", weekdays: [] },
  timeSlotsByDate: {},
};
const response = () => ({ ok: true, json: async () => ({ availability }) });

describe("booking availability requests", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shares pending requests and expires cached results after 30 seconds", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(response());
    vi.stubGlobal("fetch", fetchMock);
    const client = createBookingAvailabilityClient();
    const pending = client.load("/dates?hours=2&month=2026-06");
    expect(client.load("/dates?hours=2&month=2026-06")).toBe(pending);
    await pending;
    await client.load("/dates?hours=2&month=2026-06");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await client.load("/dates?hours=3&month=2026-06");
    await client.load("/dates?hours=2&month=2026-07");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    vi.advanceTimersByTime(30_001);
    await client.load("/dates?hours=2&month=2026-06");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("does not cache failures and bypasses cached availability before checkout", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValue(response());
    vi.stubGlobal("fetch", fetchMock);
    const client = createBookingAvailabilityClient();
    await expect(client.load("/dates")).rejects.toThrow();
    await client.load("/dates");
    await client.load("/dates", true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith("/dates", { cache: "no-store" });
  });

  it("does not let an older in-flight response overwrite a forced refresh", async () => {
    let resolveOld!: (value: unknown) => void;
    const old = new Promise((resolve) => {
      resolveOld = resolve;
    });
    const fresh = { ...availability, timeSlotsByDate: { "2026-06-01": [] } };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockReturnValueOnce(old)
        .mockResolvedValue({
          ok: true,
          json: async () => ({ availability: fresh }),
        }),
    );
    const client = createBookingAvailabilityClient();
    const pending = client.load("/dates");
    await client.load("/dates", true);
    resolveOld(response());
    await pending;
    expect(await client.load("/dates")).toEqual(fresh);
  });
});
