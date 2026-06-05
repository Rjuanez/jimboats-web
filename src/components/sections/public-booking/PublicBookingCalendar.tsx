"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/design/variants";

import type {
  PublicBookingCalendar as PublicBookingCalendarModel,
  PublicBookingCalendarDay,
  PublicBookingCalendarMonth,
} from "./PublicBookingTypes";

type PublicBookingCalendarProps = {
  calendar: PublicBookingCalendarModel;
  onSelectDate: (dayId: string) => void;
  selectedDateId: string | null;
};

export function PublicBookingCalendar({
  calendar,
  onSelectDate,
  selectedDateId,
}: PublicBookingCalendarProps) {
  const fallbackMonth = useMemo(
    () => ({
      days: calendar.days,
      id: calendar.monthLabel || "available-dates",
      monthLabel: calendar.monthLabel,
    }),
    [calendar.days, calendar.monthLabel],
  );
  const months = useMemo(
    () =>
      calendar.months && calendar.months.length > 0
        ? calendar.months
        : [fallbackMonth],
    [calendar.months, fallbackMonth],
  );
  const [visibleMonthId, setVisibleMonthId] = useState(
    months[0]?.id ?? fallbackMonth.id,
  );
  const visibleMonthIndex = Math.max(
    0,
    months.findIndex((month) => month.id === visibleMonthId),
  );
  const visibleMonth = months[visibleMonthIndex] ?? fallbackMonth;
  const calendarCells = buildCalendarCells(visibleMonth);
  const canGoPrevious = visibleMonthIndex > 0;
  const canGoNext = visibleMonthIndex < months.length - 1;

  return (
    <div className="rounded-[1.75rem] border border-sand/25 bg-white p-4 shadow-soft lg:rounded-[2rem] lg:p-6">
      <div className="mb-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 lg:mb-6">
        <CalendarMonthButton
          ariaLabel="Previous month"
          disabled={!canGoPrevious}
          icon="previous"
          onClick={() => {
            const previousMonth = months[visibleMonthIndex - 1];

            if (previousMonth) {
              setVisibleMonthId(previousMonth.id);
            }
          }}
        />
        <div className="text-center">
          <p className="font-display text-2xl leading-none text-text">
            {visibleMonth.monthLabel}
          </p>
          <p className="mt-1 text-xs font-light text-text-muted">
            Select one of the available dates.
          </p>
        </div>
        <CalendarMonthButton
          ariaLabel="Next month"
          disabled={!canGoNext}
          icon="next"
          onClick={() => {
            const nextMonth = months[visibleMonthIndex + 1];

            if (nextMonth) {
              setVisibleMonthId(nextMonth.id);
            }
          }}
        />
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {calendar.weekdays.map((weekday) => (
          <div
            className="py-1 text-center text-[9px] font-semibold uppercase tracking-widest text-text-muted"
            key={weekday}
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 lg:gap-1.5">
        {calendarCells.map((day) => (
          <CalendarDayButton
            day={day}
            key={day.id}
            onSelect={onSelectDate}
            selected={day.id === selectedDateId}
          />
        ))}
      </div>
    </div>
  );
}

type CalendarCell = PublicBookingCalendarDay & {
  outsideMonth?: boolean;
};

function CalendarMonthButton({
  ariaLabel,
  disabled,
  icon,
  onClick,
}: {
  ariaLabel: string;
  disabled: boolean;
  icon: "next" | "previous";
  onClick: () => void;
}) {
  const Icon = icon === "previous" ? ChevronLeft : ChevronRight;

  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full border border-sand/35 bg-white text-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text",
        !disabled && "hover:border-primary hover:text-primary",
        disabled && "cursor-not-allowed opacity-35",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}

const monthIndexes = new Map(
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].map((month, index) => [month, index]),
);

function buildCalendarCells(
  calendar: PublicBookingCalendarMonth,
): CalendarCell[] {
  const [monthName, yearLabel] = calendar.monthLabel.split(" ");
  const monthIndex = monthIndexes.get(monthName);
  const year = Number(yearLabel);

  if (monthIndex === undefined || !Number.isInteger(year)) {
    return [...calendar.days];
  }

  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const leadingDays = (firstDay.getUTCDay() + 6) % 7;
  const daysByLabel = new Map(calendar.days.map((day) => [day.dayLabel, day]));
  const previousMonthDays = new Date(
    Date.UTC(year, monthIndex, 0),
  ).getUTCDate();
  const cells: CalendarCell[] = [];

  for (let index = leadingDays; index > 0; index -= 1) {
    const dayLabel = String(previousMonthDays - index + 1);
    cells.push({
      ariaLabel: `${dayLabel} outside ${calendar.monthLabel}`,
      dateLabel: dayLabel,
      dayLabel,
      disabled: true,
      id: `outside-before-${dayLabel}`,
      outsideMonth: true,
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const dayLabel = String(dayNumber);
    const existingDay = daysByLabel.get(dayLabel);

    cells.push(
      existingDay ?? {
        ariaLabel: `${monthName} ${dayLabel}, ${year}`,
        dateLabel: `${monthName.slice(0, 3)} ${dayLabel}`,
        dayLabel,
        disabled: true,
        id: `unavailable-${year}-${monthIndex + 1}-${dayLabel}`,
      },
    );
  }

  const targetCellCount = cells.length > 35 ? 42 : 35;
  for (let dayNumber = 1; cells.length < targetCellCount; dayNumber += 1) {
    const dayLabel = String(dayNumber);
    cells.push({
      ariaLabel: `${dayLabel} outside ${calendar.monthLabel}`,
      dateLabel: dayLabel,
      dayLabel,
      disabled: true,
      id: `outside-after-${dayLabel}`,
      outsideMonth: true,
    });
  }

  return cells;
}

function CalendarDayButton({
  day,
  onSelect,
  selected,
}: {
  day: CalendarCell;
  onSelect: (dayId: string) => void;
  selected: boolean;
}) {
  return (
    <button
      aria-label={`Select ${day.ariaLabel}`}
      aria-pressed={selected}
      className={cn(
        "mx-auto flex size-9 items-center justify-center rounded-full text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text lg:size-11 lg:text-sm",
        selected && "bg-primary text-white shadow-floating",
        !selected && !day.disabled && "text-text hover:bg-sky-light",
        day.disabled &&
          !day.outsideMonth &&
          "cursor-not-allowed text-text-muted/35",
        day.outsideMonth && "cursor-not-allowed text-text-muted/20",
      )}
      disabled={day.disabled}
      onClick={() => onSelect(day.id)}
      type="button"
    >
      {day.dayLabel}
    </button>
  );
}
