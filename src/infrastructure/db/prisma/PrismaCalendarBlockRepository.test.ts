import { describe, expect, it } from "vitest";

import { PrismaCalendarBlockRepository } from "./PrismaCalendarBlockRepository";
import type { PrismaCalendarBlockRepositoryClient } from "./PrismaCalendarBlockRepository";
import type { PrismaCalendarBlockRecord } from "./PrismaBoatCalendarMappers";
import {
  calendarBlockRecord,
  createCalendarBlock,
} from "./PrismaBoatCalendarMappers.test";

describe("PrismaCalendarBlockRepository", () => {
  it("saves and loads calendar blocks through a Prisma-shaped client", async () => {
    const client = new InMemoryCalendarBlockClient();
    const repository = new PrismaCalendarBlockRepository(client);

    await repository.save(createCalendarBlock());

    const loaded = await repository.findById("block-1");
    const list = await repository.listByLocalDateRange(
      "2026-06-01",
      "2026-06-30",
    );

    expect(loaded?.toSnapshot()).toMatchObject({
      id: "block-1",
      status: "ACTIVE",
    });
    expect(list).toHaveLength(1);
  });

  it("finds only active overlapping blocks", async () => {
    const client = new InMemoryCalendarBlockClient([
      calendarBlockRecord({ id: "active-overlap", status: "ACTIVE" }),
      calendarBlockRecord({
        id: "released-overlap",
        status: "RELEASED",
      }),
      calendarBlockRecord({
        id: "active-later",
        protectedEndAt: new Date("2026-06-05T13:00:00.000Z"),
        protectedStartAt: new Date("2026-06-05T12:00:00.000Z"),
      }),
    ]);
    const repository = new PrismaCalendarBlockRepository(client);

    const result = await repository.findActiveOverlapping(
      new Date("2026-06-05T09:00:00.000Z"),
      new Date("2026-06-05T11:00:00.000Z"),
    );

    expect(result.map((block) => block.id)).toEqual(["active-overlap"]);
  });
});

class InMemoryCalendarBlockClient implements PrismaCalendarBlockRepositoryClient {
  private readonly records = new Map<string, PrismaCalendarBlockRecord>();

  constructor(records: PrismaCalendarBlockRecord[] = []) {
    for (const record of records) {
      this.records.set(record.id, record);
    }
  }

  readonly calendarBlock = {
    findMany: async (
      args: Parameters<
        PrismaCalendarBlockRepositoryClient["calendarBlock"]["findMany"]
      >[0],
    ) => {
      return [...this.records.values()]
        .filter((record) => matchesWhere(record, args.where))
        .sort((left, right) => {
          if (left.localDate.getTime() !== right.localDate.getTime()) {
            return left.localDate.getTime() - right.localDate.getTime();
          }

          return left.visibleStartMinutes - right.visibleStartMinutes;
        });
    },
    findUnique: async (
      args: Parameters<
        PrismaCalendarBlockRepositoryClient["calendarBlock"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? (this.records.get(id) ?? null) : null;
    },
    upsert: async (
      args: Parameters<
        PrismaCalendarBlockRepositoryClient["calendarBlock"]["upsert"]
      >[0],
    ) => {
      const current = this.records.get(args.where.id);
      const next = current
        ? {
            id: args.where.id,
            ...args.update,
          }
        : args.create;

      this.records.set(args.where.id, next);
    },
  };
}

function matchesWhere(record: PrismaCalendarBlockRecord, where: unknown) {
  const criteria = readObject(where);

  if (criteria.status && criteria.status !== record.status) {
    return false;
  }

  const localDateRange = readObject(criteria.localDate);

  if (
    localDateRange.gte instanceof Date &&
    record.localDate < localDateRange.gte
  ) {
    return false;
  }

  if (
    localDateRange.lte instanceof Date &&
    record.localDate > localDateRange.lte
  ) {
    return false;
  }

  const protectedStartFilter = readObject(criteria.protectedStartAt);
  const protectedEndFilter = readObject(criteria.protectedEndAt);

  if (
    protectedStartFilter.lt instanceof Date &&
    record.protectedStartAt >= protectedStartFilter.lt
  ) {
    return false;
  }

  if (
    protectedEndFilter.gt instanceof Date &&
    record.protectedEndAt <= protectedEndFilter.gt
  ) {
    return false;
  }

  return true;
}

function readStringProperty(input: unknown, property: string) {
  const record = readObject(input);
  const value = record[property];

  return typeof value === "string" ? value : null;
}

function readObject(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object") {
    return input as Record<string, unknown>;
  }

  return {};
}
