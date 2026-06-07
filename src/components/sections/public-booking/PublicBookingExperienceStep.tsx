import { Check, Clock, Star } from "lucide-react";

import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { cn } from "@/design/variants";
import { getPublicDictionary } from "@/i18n/public";

import { PublicBookingCalendar } from "./PublicBookingCalendar";
import type {
  PublicBookingCalendar as PublicBookingCalendarModel,
  PublicBookingContent,
  PublicBookingExperience,
  PublicBookingTimeSlot,
} from "./PublicBookingTypes";

type PublicBookingExperienceStepProps = {
  calendar: PublicBookingCalendarModel;
  content: PublicBookingContent;
  formatPrice: (amount: number) => string;
  onSelectDate: (dayId: string) => void;
  onSelectExperience: (experienceId: string) => void;
  onSelectTimeSlot: (slotId: string) => void;
  selectedDateId: string | null;
  selectedExperienceId: string | null;
  selectedTimeSlotId: string | null;
  timeSlots: readonly PublicBookingTimeSlot[];
};

export function PublicBookingExperienceStep({
  calendar,
  content,
  formatPrice,
  onSelectDate,
  onSelectExperience,
  onSelectTimeSlot,
  selectedDateId,
  selectedExperienceId,
  selectedTimeSlotId,
  timeSlots,
}: PublicBookingExperienceStepProps) {
  const copy = getPublicDictionary(content.locale).booking.experienceStep;

  return (
    <div className="space-y-6 lg:space-y-16">
      <header className="px-1 lg:px-0">
        <h1 className="font-display text-4xl leading-tight text-text lg:text-6xl">
          <span className="lg:hidden">{copy.mobileTitle}</span>
          <span className="hidden lg:inline">{copy.desktopTitle}</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-light leading-6 text-text-muted lg:mt-4 lg:text-lg lg:leading-8">
          {copy.subtitle}
        </p>
      </header>

      <section
        aria-labelledby="experience-selection-title"
        className="px-1 lg:px-0"
      >
        <h2
          className="font-display text-2xl leading-none text-text lg:text-3xl"
          id="experience-selection-title"
        >
          <span className="lg:hidden">{copy.experienceMobileTitle}</span>
          <span className="hidden lg:inline">{copy.experienceDesktopTitle}</span>
        </h2>
        <div className="mt-4 grid gap-4 lg:mt-8 lg:grid-cols-2 lg:gap-6">
          {content.experiences.length > 0 ? (
            content.experiences.map((experience) => (
              <ExperienceOption
                experience={experience}
                fromLabel={copy.from}
                formatPrice={formatPrice}
                key={experience.id}
                onSelect={onSelectExperience}
                selected={experience.id === selectedExperienceId}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-sand/35 bg-white px-5 py-8 text-sm text-text-muted shadow-soft lg:col-span-2">
              {copy.emptyExperiences}
            </div>
          )}
        </div>
      </section>

      {selectedExperienceId ? (
        <section
          aria-labelledby="date-selection-title"
          className="scroll-mt-36 px-1 lg:px-0"
          id="public-booking-date-selection"
        >
          <div className="mb-4 lg:mb-8">
            <h2
              className="font-display text-2xl leading-none text-text lg:text-3xl"
              id="date-selection-title"
            >
              <span className="lg:hidden">{copy.dateMobileTitle}</span>
              <span className="hidden lg:inline">{copy.dateDesktopTitle}</span>
            </h2>
            <p className="mt-2 text-xs text-text-muted lg:text-sm">
              {content.maxAdvanceLabel}
            </p>
          </div>
          <PublicBookingCalendar
            calendar={calendar}
            key={selectedExperienceId}
            onSelectDate={onSelectDate}
            selectedDateId={selectedDateId}
          />
        </section>
      ) : null}

      {selectedDateId ? (
        <section
          aria-labelledby="time-selection-title"
          className="scroll-mt-36 px-1 lg:px-0"
          id="public-booking-time-selection"
        >
          <h2
            className="font-display text-2xl leading-none text-text lg:text-3xl"
            id="time-selection-title"
          >
            <span className="lg:hidden">{copy.timeMobileTitle}</span>
            <span className="hidden lg:inline">{copy.timeDesktopTitle}</span>
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3 lg:mt-8 lg:flex lg:flex-wrap lg:gap-4">
            {timeSlots.length > 0 ? (
              timeSlots.map((slot) => (
                <TimeSlotButton
                  key={slot.id}
                  onSelect={onSelectTimeSlot}
                  selected={slot.id === selectedTimeSlotId}
                  slot={slot}
                />
              ))
            ) : (
              <div className="col-span-3 rounded-3xl border border-sand/35 bg-white px-5 py-6 text-sm text-text-muted shadow-soft">
                {copy.departureTimesUnavailable}
              </div>
            )}
          </div>
          <div
            aria-hidden="true"
            className="h-1 scroll-mt-36"
            id="public-booking-continue-anchor"
          />
        </section>
      ) : null}
    </div>
  );
}

function ExperienceOption({
  experience,
  formatPrice,
  fromLabel,
  onSelect,
  selected,
}: {
  experience: PublicBookingExperience;
  formatPrice: (amount: number) => string;
  fromLabel: string;
  onSelect: (experienceId: string) => void;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-[100px] overflow-hidden rounded-2xl border-2 bg-white text-left shadow-soft transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text lg:block lg:rounded-[2rem]",
        selected
          ? "border-primary shadow-floating lg:-translate-y-1"
          : "border-transparent hover:border-sand/60 lg:hover:-translate-y-0.5",
      )}
      onClick={() => onSelect(experience.id)}
      type="button"
    >
      {experience.badge ? (
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[9px] font-semibold uppercase tracking-widest text-text lg:left-4 lg:top-4 lg:px-4 lg:py-2 lg:text-xs">
          <Star aria-hidden="true" className="size-3" />
          {experience.badge}
        </span>
      ) : null}
      <span className="block w-28 shrink-0 overflow-hidden bg-sand/25 lg:h-[280px] lg:w-full">
        <MarketingImageFrame image={experience.image} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 lg:block lg:p-6">
        <span>
          <span className="block font-display text-xl leading-tight text-text lg:text-3xl">
            {experience.title}
          </span>
          <span className="mt-0.5 block text-xs font-light leading-snug text-text-muted lg:mt-2 lg:text-sm lg:leading-6">
            {experience.description}
          </span>
        </span>
        <span className="flex items-end justify-between gap-4 lg:mt-4">
          <span>
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-text-muted lg:text-xs">
              {fromLabel}
            </span>
            <span className="font-display text-lg leading-none text-text lg:text-2xl">
              {formatPrice(experience.price)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-text-muted lg:text-sm">
            <Clock aria-hidden="true" className="size-4" />
            {experience.durationLabel}
          </span>
        </span>
      </span>
      <span
        className={cn(
          "absolute right-3 top-3 inline-flex size-5 items-center justify-center rounded-full border-2 transition lg:size-8",
          selected
            ? "border-primary bg-primary text-white"
            : "border-sand bg-white/80 text-transparent",
        )}
      >
        <Check aria-hidden="true" className="size-3 lg:size-4" />
      </span>
    </button>
  );
}

function TimeSlotButton({
  onSelect,
  selected,
  slot,
}: {
  onSelect: (slotId: string) => void;
  selected: boolean;
  slot: PublicBookingTimeSlot;
}) {
  return (
    <button
      aria-label={`${slot.label}${slot.available ? "" : " unavailable"}`}
      aria-pressed={selected}
      className={cn(
        "min-h-12 rounded-2xl border-2 px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text lg:min-h-14 lg:rounded-full lg:px-8",
        selected && "scale-[1.03] border-primary bg-primary text-white",
        !selected &&
          slot.available &&
          "border-sand/40 bg-white text-text hover:border-primary",
        !slot.available &&
          "cursor-not-allowed border-sand/30 bg-sand/20 text-text-muted/45",
      )}
      disabled={!slot.available}
      onClick={() => onSelect(slot.id)}
      type="button"
    >
      {slot.label}
    </button>
  );
}
