import { getWeatherProvider } from "@/container";
import type { MarketingLocale } from "@/content/marketing/routes";
import { presentWeather, presentSunTimes } from "./weatherView";

export async function getPortWeather(locale: MarketingLocale) {
  const forecast = await getWeatherProvider().getForecast();
  return forecast ? presentWeather(forecast, locale) : null;
}

export async function getPortSunTimes(locale: MarketingLocale) {
  const times = await getWeatherProvider().getSunTimes();
  return times ? presentSunTimes(times, locale) : null;
}
