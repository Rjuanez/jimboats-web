"use client";

import { useEffect, useState } from "react";
import { Sunrise, Sunset } from "lucide-react";
import type { MarketingLocale } from "@/content/marketing/routes";
import type { SunTimesView } from "@/interface/next/presenters/weatherView";

export function PortSunTime({
  locale,
  event,
  copy,
}: {
  locale: MarketingLocale;
  event: "sunrise" | "sunset";
  copy: { sunrise: string; sunset: string; today: string; unavailable: string };
}) {
  const [sun, setSun] = useState<SunTimesView | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    let active = true;
    fetch(`/api/weather?locale=${locale}&view=sun`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Sun times unavailable");
        const result: { sun: SunTimesView | null } = await response.json();
        if (active) {
          setSun(result.sun);
          setUnavailable(!result.sun);
        }
      })
      .catch(() => {
        if (active) setUnavailable(true);
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [locale]);
  const Icon = event === "sunrise" ? Sunrise : Sunset;
  return (
    <p
      className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
      aria-live="polite"
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>
        {copy[event]} ({copy.today}):
      </span>
      {sun ? (
        <time dateTime={sun[event].time} className="font-semibold tabular-nums">
          {sun[event].label}
        </time>
      ) : (
        <span>{unavailable ? copy.unavailable : "—"}</span>
      )}
      {sun && (
        <a
          href="https://api.met.no/doc/License"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-xs text-white/80 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          MET Norway
        </a>
      )}
    </p>
  );
}
