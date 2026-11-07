import type {
  WeatherForecast,
  SunTimes,
} from "@/modules/weather/application/ports/WeatherProvider";
import type { MarketingLocale } from "@/content/marketing/routes";
import { weatherCopy } from "@/content/marketing/weather";

export function presentWeather(
  forecast: WeatherForecast,
  locale: MarketingLocale,
) {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return {
    time: forecast.time,
    timeLabel: new Intl.DateTimeFormat(locale, {
      timeZone: "Europe/Madrid",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(forecast.time)),
    temperature: number.format(forecast.temperatureC),
    wind: `${number.format(forecast.windKmh)} km/h`,
    humidity: `${number.format(forecast.humidityPercent)} %`,
    condition: forecast.condition,
    conditionLabel: weatherCopy[locale].conditions[forecast.condition],
    night: forecast.night,
  };
}
export type WeatherView = ReturnType<typeof presentWeather>;

export function presentSunTimes(times: SunTimes, locale: MarketingLocale) {
  const format = new Intl.DateTimeFormat(locale, {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return {
    date: times.date,
    sunrise: {
      time: times.sunrise,
      label: format.format(new Date(times.sunrise)),
    },
    sunset: {
      time: times.sunset,
      label: format.format(new Date(times.sunset)),
    },
  };
}
export type SunTimesView = ReturnType<typeof presentSunTimes>;
