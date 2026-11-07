"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Moon,
  Sun,
  Wind,
} from "lucide-react";
import type { WeatherCopy } from "@/content/marketing/weather";
import type { MarketingLocale } from "@/content/marketing/routes";
import type { WeatherView } from "@/interface/next/presenters/weatherView";

export type WeatherState =
  | { status: "loading" | "unavailable" }
  | { status: "ready"; weather: WeatherView };
const icons = {
  clear: Sun,
  fair: CloudSun,
  partlyCloudy: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  sleet: CloudSnow,
  thunder: CloudLightning,
  unknown: CloudSun,
};

export function WeatherCard({
  copy,
  state,
}: {
  copy: WeatherCopy;
  state: WeatherState;
}) {
  const weather = state.status === "ready" ? state.weather : null;
  const Icon = weather
    ? weather.night && ["clear", "fair"].includes(weather.condition)
      ? Moon
      : icons[weather.condition]
    : CloudSun;
  return (
    <div
      data-testid="port-weather"
      className="mt-5 overflow-hidden rounded-3xl border border-primary/10 bg-sky-light/50 p-5 shadow-soft sm:p-6"
    >
      <h3 className="text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-primary-dark">
        {copy.title}
      </h3>
      <div aria-live="polite" aria-busy={state.status === "loading"}>
        <div className="flex min-h-[134px] items-center justify-between gap-4 py-5">
          <div className="min-w-0">
            {weather ? (
              <>
                <p className="flex items-start font-display text-6xl leading-none tracking-tight text-primary-dark">
                  {weather.temperature}
                  <span className="mt-2 text-2xl tracking-normal">°C</span>
                </p>
                <p className="mt-3 text-sm font-medium leading-5 text-primary-dark">
                  {weather.conditionLabel}
                </p>
              </>
            ) : (
              <p
                role="status"
                className="max-w-48 text-sm leading-6 text-primary-dark"
              >
                {state.status === "loading" ? copy.loading : copy.unavailable}
              </p>
            )}
          </div>
          <Icon
            aria-hidden="true"
            strokeWidth={1.25}
            className="h-14 w-14 shrink-0 text-primary-dark"
          />
        </div>
        <dl className="grid grid-cols-2 gap-4 border-y border-primary/10 py-4">
          <div>
            <dt className="flex items-center gap-2 text-xs leading-5 text-text-muted">
              <Wind aria-hidden="true" className="h-4 w-4 shrink-0" />
              {copy.wind}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-primary-dark">
              {weather?.wind ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs leading-5 text-text-muted">
              <Droplets aria-hidden="true" className="h-4 w-4 shrink-0" />
              {copy.humidity}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-primary-dark">
              {weather?.humidity ?? "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 min-h-5 text-xs leading-5 text-text-muted">
          {weather ? (
            <>
              {copy.forecast} ·{" "}
              <time dateTime={weather.time}>{weather.timeLabel}</time>
            </>
          ) : (
            copy.note
          )}
        </p>
      </div>
      <p className="mt-1 text-[11px] leading-5 text-text-muted">
        {copy.source}{" "}
        <a
          href="https://api.met.no/doc/License"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm text-primary-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          MET Norway · CC BY 4.0
        </a>
      </p>
    </div>
  );
}

export function PortWeather({
  copy,
  locale,
}: {
  copy: WeatherCopy;
  locale: MarketingLocale;
}) {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    let active = true;
    fetch(`/api/weather?locale=${locale}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Weather unavailable");
        const result: { weather: WeatherView | null } = await response.json();
        if (active)
          setState(
            result.weather
              ? { status: "ready", weather: result.weather }
              : { status: "unavailable" },
          );
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [locale]);
  return <WeatherCard copy={copy} state={state} />;
}
