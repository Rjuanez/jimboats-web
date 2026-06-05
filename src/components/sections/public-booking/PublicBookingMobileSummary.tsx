"use client";

import { CalendarDays, ChevronDown, Clock, Info, MapPin } from "lucide-react";
import { useState } from "react";

import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { cn } from "@/design/variants";

import type {
  PublicBookingCalendarDay,
  PublicBookingContent,
  PublicBookingExperience,
  PublicBookingExtra,
  PublicBookingTimeSlot,
} from "./PublicBookingTypes";

type PublicBookingMobileSummaryProps = {
  content: PublicBookingContent;
  experience: PublicBookingExperience;
  extras: readonly PublicBookingExtra[];
  formatPrice: (amount: number) => string;
  selectedDate: PublicBookingCalendarDay;
  selectedTimeSlot: PublicBookingTimeSlot;
  totalAmount: number;
};

export function PublicBookingMobileSummary({
  content,
  experience,
  extras,
  formatPrice,
  selectedDate,
  selectedTimeSlot,
  totalAmount,
}: PublicBookingMobileSummaryProps) {
  const [open, setOpen] = useState(true);
  const extrasAmount = extras.reduce((sum, extra) => sum + extra.price, 0);

  return (
    <section aria-label="Booking summary" className="mb-5 lg:hidden">
      <div className="overflow-hidden rounded-3xl border border-sand/30 bg-white shadow-soft">
        <button
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-sand/25">
              <MarketingImageFrame image={experience.image} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-xl leading-tight text-text">
                {experience.title}
              </span>
              <span className="block truncate text-xs font-light text-text-muted">
                {selectedDate.dateLabel} · {selectedTimeSlot.label}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="font-display text-2xl leading-none text-text">
              {formatPrice(totalAmount)}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 text-text-muted transition",
                open && "rotate-180",
              )}
            />
          </span>
        </button>

        {open ? (
          <div className="border-t border-sand/20 px-5 pb-5 pt-4">
            <dl className="mb-4 space-y-3 text-sm">
              <SummaryLine
                icon={<CalendarDays aria-hidden="true" className="size-4" />}
                label="Date"
                value={selectedDate.dateLabel}
              />
              <SummaryLine
                icon={<Clock aria-hidden="true" className="size-4" />}
                label="Time"
                value={selectedTimeSlot.label}
              />
            </dl>

            <div className="mb-4 border-t border-sand/20 pt-3">
              <p className="mb-2 text-xs font-semibold text-text">
                Selected Extras
              </p>
              {extras.length > 0 ? (
                <ul className="space-y-2">
                  {extras.map((extra) => (
                    <li
                      className="flex items-center justify-between gap-4 text-sm"
                      key={extra.id}
                    >
                      <span className="text-text-muted">{extra.title}</span>
                      <span className="font-semibold text-text">
                        {formatPrice(extra.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-light text-text-muted">
                  No extras selected.
                </p>
              )}
            </div>

            <div className="mb-4 border-t border-sand/20 pt-3 text-sm">
              <SummaryLine
                label="Experience"
                value={formatPrice(experience.price)}
              />
              <SummaryLine label="Extras" value={formatPrice(extrasAmount)} />
              <div className="mt-3 flex items-center justify-between border-t-2 border-sand/50 pt-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Total
                </span>
                <span className="font-display text-3xl leading-none text-text">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SummaryNote
                icon={<Info aria-hidden="true" className="size-3.5" />}
                label="Cancellation"
                value={content.policies.cancellation}
              />
              <SummaryNote
                icon={<MapPin aria-hidden="true" className="size-3.5" />}
                label="Meeting Point"
                value={content.policies.meetingPoint}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SummaryLine({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 font-light text-text-muted">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold text-text">{value}</dd>
    </div>
  );
}

function SummaryNote({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-sand/30 bg-background p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-primary">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-text">{label}</p>
          <p className="mt-0.5 line-clamp-2 text-[10px] font-light leading-relaxed text-text-muted">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
