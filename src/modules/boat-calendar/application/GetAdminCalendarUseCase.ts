import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminCalendarDto,
  GetAdminCalendarQuery,
} from "./AdminCalendarDtos";
import {
  calendarBlockSnapshotToAdminDto,
  summarizeCalendarBlocks,
} from "./AdminCalendarDtos";
import { boatCalendarTimeZone, localDateToUtcDate } from "./CalendarDateTime";
import type { CalendarBlockRepository } from "./ports/CalendarBlockRepository";

export class GetAdminCalendarUseCase {
  constructor(private readonly blocks: CalendarBlockRepository) {}

  async execute(query: GetAdminCalendarQuery): Promise<AdminCalendarDto> {
    const fromDate = localDateToUtcDate(query.fromLocalDate);
    const toDate = localDateToUtcDate(query.toLocalDate);

    if (toDate.getTime() < fromDate.getTime()) {
      throw applicationError(
        "CALENDAR_DATE_RANGE_INVALID",
        "Calendar end date must be after start date.",
      );
    }

    const blocks = (
      await this.blocks.listByLocalDateRange(
        query.fromLocalDate,
        query.toLocalDate,
      )
    )
      .map((block) => calendarBlockSnapshotToAdminDto(block.toSnapshot()))
      .sort((first, second) => {
        if (first.localDate !== second.localDate) {
          return first.localDate.localeCompare(second.localDate);
        }

        return first.visibleStartMinutes - second.visibleStartMinutes;
      });

    return {
      blocks,
      fromLocalDate: query.fromLocalDate,
      summary: summarizeCalendarBlocks(blocks),
      timeZone: boatCalendarTimeZone,
      toLocalDate: query.toLocalDate,
    };
  }
}
