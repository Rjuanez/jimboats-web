import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { buildManualCalendarBlockTimeRange } from "./CalendarDateTime";
import { CreateManualCalendarBlockUseCase } from "./CreateManualCalendarBlockUseCase";
import { GetAdminCalendarUseCase } from "./GetAdminCalendarUseCase";
import { ReleaseManualCalendarBlockUseCase } from "./ReleaseManualCalendarBlockUseCase";
import type { CalendarBlockRepository } from "./ports/CalendarBlockRepository";
import { CalendarBlock } from "../domain/CalendarBlock";

describe("Boat calendar use cases", () => {
  it("converts Barcelona local block times into canonical UTC instants", () => {
    const range = buildManualCalendarBlockTimeRange({
      endTime: "12:00",
      localDate: "2026-06-05",
      startTime: "10:00",
    });

    expect(range.protectedStartAt.toISOString()).toBe(
      "2026-06-05T08:00:00.000Z",
    );
    expect(range.protectedEndAt.toISOString()).toBe("2026-06-05T10:00:00.000Z");
  });

  it("creates manual blocks and lists them for the admin calendar", async () => {
    const dependencies = createDependencies();

    const createdBlock = await new CreateManualCalendarBlockUseCase(
      dependencies.blocks,
      dependencies.ids,
      dependencies.clock,
    ).execute({
      createdByUserId: "admin-user",
      endTime: "12:00",
      localDate: "2026-06-05",
      reason: "Maintenance window",
      startTime: "10:00",
    });
    const calendar = await new GetAdminCalendarUseCase(
      dependencies.blocks,
    ).execute({
      fromLocalDate: "2026-06-01",
      toLocalDate: "2026-06-30",
    });

    expect(createdBlock).toMatchObject({
      canRelease: true,
      id: "block-1",
      source: "MANUAL_BLOCK",
      startTime: "10:00",
      status: "ACTIVE",
    });
    expect(calendar.summary).toMatchObject({
      activeBlocks: 1,
      manualBlocks: 1,
      releasedBlocks: 0,
    });
    expect(calendar.blocks[0].id).toBe("block-1");
  });

  it("rejects a manual block that overlaps another active block", async () => {
    const dependencies = createDependencies({
      blocks: [createCalendarBlock()],
    });

    await expect(
      new CreateManualCalendarBlockUseCase(
        dependencies.blocks,
        dependencies.ids,
        dependencies.clock,
      ).execute({
        createdByUserId: "admin-user",
        endTime: "12:30",
        localDate: "2026-06-05",
        reason: "Team training",
        startTime: "11:30",
      }),
    ).rejects.toThrow(ApplicationError);
  });

  it("releases an active manual block", async () => {
    const dependencies = createDependencies({
      blocks: [createCalendarBlock()],
    });

    const result = await new ReleaseManualCalendarBlockUseCase(
      dependencies.blocks,
      dependencies.clock,
    ).execute({
      calendarBlockId: "block-existing",
    });

    expect(result).toMatchObject({
      canRelease: false,
      id: "block-existing",
      status: "RELEASED",
    });
    expect((await dependencies.blocks.findById("block-existing"))?.status).toBe(
      "RELEASED",
    );
  });

  it("fails when releasing a missing block", async () => {
    const dependencies = createDependencies();

    await expect(
      new ReleaseManualCalendarBlockUseCase(
        dependencies.blocks,
        dependencies.clock,
      ).execute({
        calendarBlockId: "missing",
      }),
    ).rejects.toThrow(ApplicationError);
  });
});

function createDependencies(input: { blocks?: CalendarBlock[] } = {}) {
  return {
    blocks: new InMemoryCalendarBlockRepository(input.blocks ?? []),
    clock: {
      now: () => new Date("2026-06-01T10:00:00.000Z"),
    },
    ids: {
      newCalendarBlockId: () => "block-1",
    },
  };
}

function createCalendarBlock() {
  return CalendarBlock.createManual({
    createdAt: new Date("2026-06-01T09:00:00.000Z"),
    createdByUserId: "admin-user",
    id: "block-existing",
    localDate: "2026-06-05",
    protectedEndAt: new Date("2026-06-05T10:00:00.000Z"),
    protectedStartAt: new Date("2026-06-05T08:00:00.000Z"),
    reason: "Maintenance window",
    timeZone: "Europe/Madrid",
    visibleEndMinutes: 12 * 60,
    visibleStartMinutes: 10 * 60,
  });
}

class InMemoryCalendarBlockRepository implements CalendarBlockRepository {
  private readonly blocksById = new Map<string, CalendarBlock>();

  constructor(blocks: CalendarBlock[]) {
    for (const block of blocks) {
      this.blocksById.set(block.id, block);
    }
  }

  async findActiveOverlapping(startAt: Date, endAt: Date) {
    return [...this.blocksById.values()].filter((block) =>
      block.overlapsProtectedRange(startAt, endAt),
    );
  }

  async findById(id: string) {
    return this.blocksById.get(id) ?? null;
  }

  async listByLocalDateRange(fromLocalDate: string, toLocalDate: string) {
    return [...this.blocksById.values()].filter((block) => {
      const snapshot = block.toSnapshot();

      return (
        snapshot.localDate >= fromLocalDate && snapshot.localDate <= toLocalDate
      );
    });
  }

  async save(block: CalendarBlock) {
    this.blocksById.set(block.id, block);
  }
}
