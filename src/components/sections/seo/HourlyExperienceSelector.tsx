"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MarketingCopy } from "@/content/marketing";

export function HourlyExperienceSelector({
  copy,
  bookingHref,
  prices,
  initialHours,
  durationOptions,
  durationLabel,
}: {
  copy: MarketingCopy;
  bookingHref: string;
  prices: string[];
  initialHours: number;
  durationOptions: readonly number[];
  durationLabel: string;
}) {
  const [hours, setHours] = useState(initialHours);
  return (
    <div className="rounded-2xl border border-sand bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest">
        {durationLabel}
      </p>
      <h2 className="mt-3 font-display text-4xl">
        {prices[hours - 1]} / {hours} h
      </h2>
      <p className="mt-2 text-sm text-text-muted">{copy.perBoat}</p>
      <p className="mt-2 text-xs font-semibold text-text-muted">
        {copy.provisionalPrice}
      </p>
      <fieldset className="mt-7">
        <legend className="mb-3 text-sm font-semibold">
          {copy.chooseHours}
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
          {durationOptions.map((value) => (
            <label key={value} className="relative cursor-pointer">
              <input
                type="radio"
                name="hours"
                value={value}
                checked={hours === value}
                onChange={() => setHours(value)}
                className="peer sr-only"
              />
              <span className="flex min-h-12 items-center justify-center rounded-lg border border-sand text-sm peer-checked:border-primary-dark peer-checked:bg-primary-dark peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                {value} h
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-4 text-sm leading-6 text-text-muted">{copy.hourNote}</p>
      <Button
        href={`${bookingHref}&hours=${hours}`}
        variant="accent"
        shape="pill"
        className="mt-6 w-full"
      >
        {copy.reserve}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
