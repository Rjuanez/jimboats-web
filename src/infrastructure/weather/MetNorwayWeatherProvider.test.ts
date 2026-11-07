import { describe, expect, it, vi } from "vitest";
import { MetNorwayWeatherProvider } from "./MetNorwayWeatherProvider";

const now = Date.parse("2026-11-02T12:00:00Z");
function payload(symbol = "partlycloudy_day") {
  return {
    properties: {
      meta: { updated_at: "2026-11-02T11:30:00Z" },
      timeseries: [
        {
          time: "2026-11-02T09:00:00Z",
          data: {
            instant: {
              details: {
                air_temperature: 12,
                wind_speed: 2,
                relative_humidity: 90,
              },
            },
          },
        },
        {
          time: "2026-11-02T12:00:00Z",
          data: {
            instant: {
              details: {
                air_temperature: 19,
                wind_speed: 3,
                relative_humidity: 68,
              },
            },
            next_1_hours: { summary: { symbol_code: symbol } },
          },
        },
      ],
    },
  };
}

describe("MET Norway weather", () => {
  it("selects the nearest forecast and converts wind units", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(payload()));
    const result = await new MetNorwayWeatherProvider(
      request,
      () => now,
    ).getForecast();
    expect(result).toEqual({
      time: "2026-11-02T12:00:00Z",
      temperatureC: 19,
      windKmh: 10.8,
      humidityPercent: 68,
      condition: "partlyCloudy",
      night: false,
    });
    expect(request.mock.calls[0][1]?.headers).toMatchObject({
      "User-Agent": expect.stringContaining("jimboatscharter.com"),
    });
  });
  it("coalesces requests, honours expiry and conditionally revalidates", async () => {
    let clock = now;
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(payload(), {
          headers: {
            Expires: new Date(now + 3_600_000).toUTCString(),
            "Last-Modified": new Date(now - 60_000).toUTCString(),
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 304 }));
    const provider = new MetNorwayWeatherProvider(request, () => clock);
    const simultaneous = await Promise.all([
      provider.getForecast(),
      provider.getForecast(),
    ]);
    expect(simultaneous).toHaveLength(2);
    for (const forecast of simultaneous) expect(forecast).not.toBeNull();
    clock += 35 * 60_000;
    await provider.getForecast();
    expect(request).toHaveBeenCalledTimes(1);
    clock += 26 * 60_000;
    expect(await provider.getForecast()).not.toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][1]?.headers).toMatchObject({
      "If-Modified-Since": new Date(now - 60_000).toUTCString(),
    });
  });
  it("backs off on rate limiting and never fabricates missing data", async () => {
    let clock = now;
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(null, { status: 429, headers: { "Retry-After": "7200" } }),
      );
    const provider = new MetNorwayWeatherProvider(request, () => clock);
    expect(await provider.getForecast()).toBeNull();
    clock += 3_600_000;
    expect(await provider.getForecast()).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("rejects malformed and obsolete forecasts", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ properties: {} }));
    expect(
      await new MetNorwayWeatherProvider(request, () => now).getForecast(),
    ).toBeNull();
    request.mockResolvedValue(Response.json(payload()));
    expect(
      await new MetNorwayWeatherProvider(
        request,
        () => now + 13 * 3_600_000,
      ).getForecast(),
    ).toBeNull();
  });
  it.each([
    ["clearsky_night", "clear", true],
    ["heavyrainandthunder", "thunder", false],
    ["lightsleetshowers_day", "sleet", false],
    ["unknown_new_code", "unknown", false],
  ])(
    "maps %s without making a sailing recommendation",
    async (symbol, condition, night) => {
      const request = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(payload(String(symbol))));
      expect(
        await new MetNorwayWeatherProvider(request, () => now).getForecast(),
      ).toMatchObject({ condition, night });
    },
  );
});

function sunPayload(date: string) {
  return {
    properties: {
      sunrise: { time: `${date}T06:24+00:00` },
      sunset: { time: `${date}T16:44+00:00` },
    },
  };
}

describe("MET Norway solar times", () => {
  it("uses Barcelona's calendar day, coalesces calls and refreshes after local midnight", async () => {
    let clock = Date.parse("2026-11-03T22:59:00Z");
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(sunPayload("2026-11-03")))
      .mockResolvedValueOnce(Response.json(sunPayload("2026-11-04")));
    const provider = new MetNorwayWeatherProvider(request, () => clock);
    const first = await Promise.all([
      provider.getSunTimes(),
      provider.getSunTimes(),
    ]);
    expect(first[0]).toEqual({
      date: "2026-11-03",
      sunrise: "2026-11-03T06:24+00:00",
      sunset: "2026-11-03T16:44+00:00",
    });
    expect(first[1]).toEqual(first[0]);
    await provider.getSunTimes();
    expect(request).toHaveBeenCalledTimes(1);
    clock += 120_000;
    expect(await provider.getSunTimes()).toMatchObject({ date: "2026-11-04" });
    expect(request.mock.calls[1][0]).toContain("date=2026-11-04");
  });
  it("does not reuse yesterday's times when the new day's request fails", async () => {
    let clock = Date.parse("2026-11-03T22:59:00Z");
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(sunPayload("2026-11-03")))
      .mockResolvedValue(new Response(null, { status: 503 }));
    const provider = new MetNorwayWeatherProvider(request, () => clock);
    expect(await provider.getSunTimes()).not.toBeNull();
    clock += 120_000;
    expect(await provider.getSunTimes()).toBeNull();
    expect(await provider.getSunTimes()).toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
  });
  it.each([{ properties: {} }, sunPayload("2026-11-01")])(
    "rejects missing or wrong-date solar data",
    async (body) => {
      const request = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(body));
      expect(
        await new MetNorwayWeatherProvider(request, () => now).getSunTimes(),
      ).toBeNull();
    },
  );
});
