import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminCalendarBlockDto,
  ReleaseManualCalendarBlockCommand,
} from "./AdminCalendarDtos";
import { calendarBlockSnapshotToAdminDto } from "./AdminCalendarDtos";
import type { CalendarBlockRepository } from "./ports/CalendarBlockRepository";
import type { CalendarClock } from "./ports/CalendarClock";

export class ReleaseManualCalendarBlockUseCase {
  constructor(
    private readonly blocks: CalendarBlockRepository,
    private readonly clock: CalendarClock,
  ) {}

  async execute(
    command: ReleaseManualCalendarBlockCommand,
  ): Promise<AdminCalendarBlockDto> {
    const block = await this.blocks.findById(command.calendarBlockId);

    if (!block) {
      throw new ApplicationError(
        "CALENDAR_BLOCK_NOT_FOUND",
        "Calendar block was not found.",
      );
    }

    const releasedBlock = block.release(this.clock.now());

    await this.blocks.save(releasedBlock);

    return calendarBlockSnapshotToAdminDto(releasedBlock.toSnapshot());
  }
}
