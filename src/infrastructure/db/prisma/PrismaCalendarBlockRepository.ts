import type { CalendarBlockRepository } from "@/modules/boat-calendar/application/ports/CalendarBlockRepository";
import type { CalendarBlock } from "@/modules/boat-calendar/domain/CalendarBlock";
import { localDateToUtcDate } from "@/modules/boat-calendar/application/CalendarDateTime";

import {
  calendarBlockFromPrismaRecord,
  calendarBlockToPrismaWriteModel,
} from "./PrismaBoatCalendarMappers";
import type {
  PrismaCalendarBlockRecord,
  PrismaCalendarBlockWriteModel,
} from "./PrismaBoatCalendarMappers";

type CalendarBlockFindArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type CalendarBlockUpsertArgs = {
  create: PrismaCalendarBlockWriteModel["block"] & { id: string };
  update: PrismaCalendarBlockWriteModel["block"];
  where: { id: string };
};

type CalendarBlockDelegate = {
  findMany(args: CalendarBlockFindArgs): Promise<PrismaCalendarBlockRecord[]>;
  findUnique(
    args: CalendarBlockFindArgs,
  ): Promise<PrismaCalendarBlockRecord | null>;
  upsert(args: CalendarBlockUpsertArgs): Promise<unknown>;
};

export type PrismaCalendarBlockRepositoryClient = {
  calendarBlock: CalendarBlockDelegate;
};

export class PrismaCalendarBlockRepository implements CalendarBlockRepository {
  constructor(private readonly prisma: PrismaCalendarBlockRepositoryClient) {}

  async listByLocalDateRange(fromLocalDate: string, toLocalDate: string) {
    const records = await this.prisma.calendarBlock.findMany({
      orderBy: [{ localDate: "asc" }, { visibleStartMinutes: "asc" }],
      where: {
        localDate: {
          gte: localDateToUtcDate(fromLocalDate),
          lte: localDateToUtcDate(toLocalDate),
        },
      },
    });

    return records.map(calendarBlockFromPrismaRecord);
  }

  async findById(id: string) {
    const record = await this.prisma.calendarBlock.findUnique({
      where: {
        id,
      },
    });

    return record ? calendarBlockFromPrismaRecord(record) : null;
  }

  async findActiveOverlapping(startAt: Date, endAt: Date) {
    const records = await this.prisma.calendarBlock.findMany({
      orderBy: [{ localDate: "asc" }, { visibleStartMinutes: "asc" }],
      where: {
        protectedEndAt: {
          gt: startAt,
        },
        protectedStartAt: {
          lt: endAt,
        },
        status: "ACTIVE",
      },
    });

    return records.map(calendarBlockFromPrismaRecord);
  }

  async save(block: CalendarBlock) {
    const writeModel = calendarBlockToPrismaWriteModel(block);

    await this.prisma.calendarBlock.upsert({
      create: {
        id: writeModel.id,
        ...writeModel.block,
      },
      update: writeModel.block,
      where: {
        id: writeModel.id,
      },
    });
  }
}

export type { PrismaCalendarBlockRecord };
