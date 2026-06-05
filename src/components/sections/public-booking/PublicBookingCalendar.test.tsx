import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PublicBookingCalendar } from "./PublicBookingCalendar";
import type { PublicBookingCalendar as PublicBookingCalendarModel } from "./PublicBookingTypes";

describe("PublicBookingCalendar", () => {
  it("navigates between available months", async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();

    render(
      <PublicBookingCalendar
        calendar={calendarFixture()}
        onSelectDate={onSelectDate}
        selectedDateId={null}
      />,
    );

    expect(screen.getByText("June 2026")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Next month" }));

    expect(screen.getByText("July 2026")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Select Tuesday July 7, 2026" }),
    );

    expect(onSelectDate).toHaveBeenCalledWith("2026-07-07");
  });
});

function calendarFixture(): PublicBookingCalendarModel {
  return {
    days: [
      {
        ariaLabel: "Monday June 15, 2026",
        dateLabel: "Jun 15",
        dayLabel: "15",
        id: "2026-06-15",
      },
    ],
    monthLabel: "June 2026",
    months: [
      {
        days: [
          {
            ariaLabel: "Monday June 15, 2026",
            dateLabel: "Jun 15",
            dayLabel: "15",
            id: "2026-06-15",
          },
        ],
        id: "2026-06",
        monthLabel: "June 2026",
      },
      {
        days: [
          {
            ariaLabel: "Tuesday July 7, 2026",
            dateLabel: "Jul 7",
            dayLabel: "7",
            id: "2026-07-07",
          },
        ],
        id: "2026-07",
        monthLabel: "July 2026",
      },
    ],
    weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  };
}
