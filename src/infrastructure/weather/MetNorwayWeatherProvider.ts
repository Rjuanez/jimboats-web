import { z } from "zod";
import type {
  SunTimes,
  WeatherCondition,
  WeatherForecast,
  WeatherProvider,
} from "@/modules/weather/application/ports/WeatherProvider";

const period = z.object({ summary: z.object({ symbol_code: z.string() }) });
const forecastSchema = z.object({
  properties: z.object({
    meta: z.object({ updated_at: z.iso.datetime() }),
    timeseries: z
      .array(
        z.object({
          time: z.iso.datetime(),
          data: z.object({
            instant: z.object({
              details: z.object({
                air_temperature: z.number().min(-90).max(65),
                wind_speed: z.number().min(0).max(150),
                relative_humidity: z.number().min(0).max(100),
              }),
            }),
            next_1_hours: period.optional(),
            next_6_hours: period.optional(),
          }),
        }),
      )
      .min(1),
  }),
});
type ForecastDocument = z.infer<typeof forecastSchema>;
const endpoint =
  "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=41.387&lon=2.201&altitude=0";
const halfHour = 30 * 60_000;
const sunSchema = z.object({
  properties: z.object({
    sunrise: z.object({ time: z.iso.datetime({ offset: true }) }),
    sunset: z.object({ time: z.iso.datetime({ offset: true }) }),
  }),
});
const barcelonaDate = (time: number | string) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(time));

function conditionFor(symbol: string): WeatherCondition {
  if (symbol.includes("thunder")) return "thunder";
  if (symbol.includes("sleet")) return "sleet";
  if (symbol.includes("snow")) return "snow";
  if (symbol.includes("rain")) return "rain";
  if (symbol.startsWith("clearsky")) return "clear";
  if (symbol.startsWith("fair")) return "fair";
  if (symbol.startsWith("partlycloudy")) return "partlyCloudy";
  if (symbol.startsWith("cloudy")) return "cloudy";
  if (symbol.startsWith("fog")) return "fog";
  return "unknown";
}

// One fixed location; cache and coalesce requests, honour MET's Expires and
// Last-Modified headers. No scheduled process, API key or browser-to-MET traffic.
export class MetNorwayWeatherProvider implements WeatherProvider {
  private document: ForecastDocument | null = null;
  private nextRequestAt = 0;
  private lastModified: string | null = null;
  private pending: Promise<void> | null = null;

  constructor(
    private readonly request: typeof fetch = fetch,
    private readonly now = Date.now,
  ) {}

  private sunCache: {
    date: string;
    value: SunTimes | null;
    retryAt: number;
  } | null = null;
  private sunPending: {
    date: string;
    result: Promise<SunTimes | null>;
  } | null = null;

  async getSunTimes(): Promise<SunTimes | null> {
    const date = barcelonaDate(this.now());
    if (
      this.sunCache?.date === date &&
      (this.sunCache.value || this.now() < this.sunCache.retryAt)
    )
      return this.sunCache.value;
    if (this.sunPending?.date === date) return this.sunPending.result;
    const result = this.fetchSunTimes(date)
      .then((value) => {
        this.sunCache = { date, value, retryAt: this.now() + halfHour };
        return value;
      })
      .finally(() => {
        if (this.sunPending?.date === date) this.sunPending = null;
      });
    this.sunPending = { date, result };
    return result;
  }

  private async fetchSunTimes(date: string): Promise<SunTimes | null> {
    try {
      const response = await this.request(
        `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=41.387&lon=2.201&date=${date}`,
        {
          headers: {
            "User-Agent": "JimBoatsWeather/1.0 (https://jimboatscharter.com)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8_000),
          cache: "no-store",
        },
      );
      if (!response.ok) return null;
      const parsed = sunSchema.safeParse(await response.json());
      if (!parsed.success) return null;
      const sunrise = parsed.data.properties.sunrise.time;
      const sunset = parsed.data.properties.sunset.time;
      if ([sunrise, sunset].some((time) => barcelonaDate(time) !== date))
        return null;
      return { date, sunrise, sunset };
    } catch {
      return null;
    }
  }

  async getForecast(): Promise<WeatherForecast | null> {
    if (this.now() >= this.nextRequestAt && !this.pending) {
      this.pending = this.refresh().finally(() => {
        this.pending = null;
      });
    }
    // Concurrent readers must also wait while the first fetch fills the cache.
    if (this.pending) await this.pending;
    const now = this.now();
    if (
      !this.document ||
      now - Date.parse(this.document.properties.meta.updated_at) >
        12 * 3_600_000
    )
      return null;
    const point = this.document.properties.timeseries.reduce(
      (nearest, current) =>
        Math.abs(Date.parse(current.time) - now) <
        Math.abs(Date.parse(nearest.time) - now)
          ? current
          : nearest,
    );
    if (Math.abs(Date.parse(point.time) - now) > 90 * 60_000) return null;
    const details = point.data.instant.details;
    const symbol =
      (point.data.next_1_hours ?? point.data.next_6_hours)?.summary
        .symbol_code ?? "";
    return {
      time: point.time,
      temperatureC: details.air_temperature,
      windKmh: details.wind_speed * 3.6,
      humidityPercent: details.relative_humidity,
      condition: conditionFor(symbol),
      night: symbol.endsWith("_night"),
    };
  }

  private async refresh() {
    // Back off on network/validation failures instead of retrying for every visitor.
    this.nextRequestAt = this.now() + halfHour;
    try {
      const headers: Record<string, string> = {
        "User-Agent": "JimBoatsWeather/1.0 (https://jimboatscharter.com)",
        Accept: "application/json",
      };
      if (this.lastModified) headers["If-Modified-Since"] = this.lastModified;
      const response = await this.request(endpoint, {
        headers,
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      const expires = Date.parse(response.headers.get("expires") ?? "");
      if (Number.isFinite(expires))
        this.nextRequestAt = Math.max(this.nextRequestAt, expires);
      const retry = response.headers.get("retry-after");
      if (retry) {
        const retryAt = /^\d+$/.test(retry)
          ? this.now() + Number(retry) * 1000
          : Date.parse(retry);
        if (Number.isFinite(retryAt))
          this.nextRequestAt = Math.max(this.nextRequestAt, retryAt);
      }
      if (response.status === 304) return;
      if (!response.ok) return;
      const parsed = forecastSchema.safeParse(await response.json());
      if (!parsed.success) return;
      this.document = parsed.data;
      this.lastModified = response.headers.get("last-modified");
    } catch {
      // The public card renders its translated unavailable state without fabricated data.
    }
  }
}
