import { describe, expect, it } from "vitest";

import { PrismaExperienceRepository } from "./PrismaExperienceRepository";
import type {
  PrismaExperienceExtraRuleRecord,
  PrismaExperienceFixedSlotRecord,
  PrismaExperienceRecord,
  PrismaExperienceRepositoryClient,
  PrismaExperienceRepositoryTransaction,
} from "./PrismaExperienceRepository";
import { PrismaExtraRepository } from "./PrismaExtraRepository";
import type { PrismaExtraRepositoryClient } from "./PrismaExtraRepository";
import type { PrismaExtraRecord } from "./PrismaExperienceCatalogMappers";
import {
  createExperience,
  experienceRecord,
} from "./PrismaExperienceCatalogMappers.test";

describe("Prisma experience repositories", () => {
  it("saves and loads experiences through the Prisma-shaped client", async () => {
    const client = new InMemoryExperienceClient();
    const repository = new PrismaExperienceRepository(client);

    await repository.save(createExperience());

    const loaded = await repository.findById("sunset-experience");
    const list = await repository.list();

    expect(loaded?.toSnapshot()).toMatchObject({
      id: "sunset-experience",
      slotPolicy: {
        fixedSlots: [
          {
            id: "sunset-1800",
          },
        ],
      },
    });
    expect(list).toHaveLength(1);
  });

  it("loads extras by ids without duplicating id filters", async () => {
    const client = new InMemoryExtraClient([
      {
        defaultNoticeMinutes: 0,
        id: "premium-champagne",
        name: "Premium champagne",
        priceAmountMinor: 9_000,
        priceCurrency: "EUR",
        status: "ACTIVE",
      },
    ]);
    const repository = new PrismaExtraRepository(client);

    const extras = await repository.findManyByIds([
      "premium-champagne",
      "premium-champagne",
    ]);

    expect(extras).toHaveLength(1);
    expect(extras[0].id).toBe("premium-champagne");
  });
});

class InMemoryExperienceClient implements PrismaExperienceRepositoryClient {
  private readonly experiences = new Map<
    string,
    Omit<PrismaExperienceRecord, "extraRules" | "fixedSlots">
  >();
  private readonly fixedSlots: PrismaExperienceFixedSlotRecord[] = [];
  private readonly extraRules: PrismaExperienceExtraRuleRecord[] = [];

  readonly experience = {
    findMany: async () => {
      return [...this.experiences.values()]
        .sort((left, right) =>
          left.internalName.localeCompare(right.internalName),
        )
        .map((record) => this.hydrate(record.id));
    },
    findUnique: async (
      args: Parameters<
        PrismaExperienceRepositoryClient["experience"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.hydrate(id) : null;
    },
    upsert: async (
      args: Parameters<
        PrismaExperienceRepositoryClient["experience"]["upsert"]
      >[0],
    ) => {
      const current = this.experiences.get(args.where.id);
      const next = current
        ? {
            id: args.where.id,
            ...args.update,
          }
        : args.create;

      this.experiences.set(args.where.id, next);
    },
  };

  readonly experienceFixedSlot = {
    createMany: async (
      args: Parameters<
        PrismaExperienceRepositoryClient["experienceFixedSlot"]["createMany"]
      >[0],
    ) => {
      this.fixedSlots.push(...args.data);
    },
    deleteMany: async (
      args: Parameters<
        PrismaExperienceRepositoryClient["experienceFixedSlot"]["deleteMany"]
      >[0],
    ) => {
      removeMatching(this.fixedSlots, args.where.experienceId);
    },
  };

  readonly experienceExtraRule = {
    createMany: async (
      args: Parameters<
        PrismaExperienceRepositoryClient["experienceExtraRule"]["createMany"]
      >[0],
    ) => {
      this.extraRules.push(...args.data);
    },
    deleteMany: async (
      args: Parameters<
        PrismaExperienceRepositoryClient["experienceExtraRule"]["deleteMany"]
      >[0],
    ) => {
      removeMatching(this.extraRules, args.where.experienceId);
    },
  };

  async $transaction<T>(
    operation: (
      transaction: PrismaExperienceRepositoryTransaction,
    ) => Promise<T>,
  ) {
    return operation(this);
  }

  private hydrate(id: string): PrismaExperienceRecord {
    const record = this.experiences.get(id) ?? experienceRecord({ id });

    return {
      ...record,
      extraRules: this.extraRules.filter((rule) => rule.id.includes(`${id}:`)),
      fixedSlots: this.fixedSlots.filter((slot) => slot.id.includes(`${id}:`)),
    };
  }
}

class InMemoryExtraClient implements PrismaExtraRepositoryClient {
  constructor(private readonly records: PrismaExtraRecord[]) {}

  readonly extra = {
    findMany: async (
      args: Parameters<PrismaExtraRepositoryClient["extra"]["findMany"]>[0],
    ) => {
      const ids = readStringArrayFilter(args.where, "id");

      if (ids.length === 0) {
        return this.records
          .slice()
          .sort((left, right) => left.name.localeCompare(right.name));
      }

      return this.records.filter((record) => ids.includes(record.id));
    },
  };
}

function readStringProperty(value: unknown, property: string) {
  if (!isRecord(value)) {
    return null;
  }

  const field = value[property];

  return typeof field === "string" ? field : null;
}

function readStringArrayFilter(value: unknown, property: string) {
  if (!isRecord(value)) {
    return [];
  }

  const field = value[property];

  if (!isRecord(field) || !Array.isArray(field.in)) {
    return [];
  }

  return field.in.filter((candidate): candidate is string => {
    return typeof candidate === "string";
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function removeMatching(records: Array<{ id: string }>, experienceId: string) {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index].id.includes(`${experienceId}:`)) {
      records.splice(index, 1);
    }
  }
}
