import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminCalendarBlockDto,
  CreateManualCalendarBlockCommand,
} from "./AdminCalendarDtos";
import { calendarBlockSnapshotToAdminDto } from "./AdminCalendarDtos";
import {
  boatCalendarTimeZone,
  buildManualCalendarBlockTimeRange,
} from "./CalendarDateTime";
import type { CalendarBlockRepository } from "./ports/CalendarBlockRepository";
import type { CalendarBlockIdGenerator } from "./ports/CalendarBlockIdGenerator";
import type { CalendarClock } from "./ports/CalendarClock";
import { CalendarBlock } from "../domain/CalendarBlock";

export class CreateManualCalendarBlockUseCase {
  constructor(
    private readonly blocks: CalendarBlockRepository,
    private readonly ids: CalendarBlockIdGenerator,
    private readonly clock: CalendarClock,
  ) {}

  async execute(
    command: CreateManualCalendarBlockCommand,
  ): Promise<AdminCalendarBlockDto> {
    const range = buildManualCalendarBlockTimeRange({
      endTime: command.endTime,
      localDate: command.localDate,
      startTime: command.startTime,
      timeZone: boatCalendarTimeZone,
    });
    const overlappingBlocks = await this.blocks.findActiveOverlapping(
      range.protectedStartAt,
      range.protectedEndAt,
    );

    if (overlappingBlocks.length > 0) {
      throw new ApplicationError(
        "CALENDAR_BLOCK_OVERLAP",
        "This calendar block overlaps an active boat block.",
      );
    }

    const now = this.clock.now();
    const block = CalendarBlock.createManual({
      createdAt: now,
      createdByUserId: command.createdByUserId,
      id: this.ids.newCalendarBlockId(),
      localDate: range.localDate,
      protectedEndAt: range.protectedEndAt,
      protectedStartAt: range.protectedStartAt,
      reason: command.reason,
      timeZone: boatCalendarTimeZone,
      visibleEndMinutes: range.visibleEndMinutes,
      visibleStartMinutes: range.visibleStartMinutes,
    });

    await this.blocks.save(block);

    return calendarBlockSnapshotToAdminDto(block.toSnapshot());
  }
}
