import type { CalendarBlock } from "../../domain/CalendarBlock";

export type CalendarBlockRepository = {
  findActiveOverlapping(startAt: Date, endAt: Date): Promise<CalendarBlock[]>;
  findById(id: string): Promise<CalendarBlock | null>;
  listByLocalDateRange(
    fromLocalDate: string,
    toLocalDate: string,
  ): Promise<CalendarBlock[]>;
  save(block: CalendarBlock): Promise<void>;
};
