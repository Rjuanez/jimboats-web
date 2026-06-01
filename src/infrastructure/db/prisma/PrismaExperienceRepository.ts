import type { ExperienceRepository } from "@/modules/experience-catalog/application/ports/ExperienceRepository";
import type { Experience } from "@/modules/experience-catalog/domain/Experience";

import {
  experienceFromPrismaRecord,
  experienceToPrismaWriteModel,
} from "./PrismaExperienceCatalogMappers";
import type {
  PrismaExperienceExtraRuleRecord,
  PrismaExperienceFixedSlotRecord,
  PrismaExperienceRecord,
  PrismaExperienceWriteModel,
} from "./PrismaExperienceCatalogMappers";

type ExperienceFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type ExperienceUpsertArgs = {
  create: PrismaExperienceWriteModel["experience"] & { id: string };
  update: PrismaExperienceWriteModel["experience"];
  where: { id: string };
};

type DeleteByExperienceArgs = {
  where: { experienceId: string };
};

type CreateFixedSlotsArgs = {
  data: Array<
    PrismaExperienceWriteModel["fixedSlots"][number] & { experienceId: string }
  >;
};

type CreateExtraRulesArgs = {
  data: Array<
    PrismaExperienceWriteModel["extraRules"][number] & { experienceId: string }
  >;
};

type ExperienceDelegate = {
  findMany(args: ExperienceFindArgs): Promise<PrismaExperienceRecord[]>;
  findUnique(args: ExperienceFindArgs): Promise<PrismaExperienceRecord | null>;
  upsert(args: ExperienceUpsertArgs): Promise<unknown>;
};

type FixedSlotDelegate = {
  createMany(args: CreateFixedSlotsArgs): Promise<unknown>;
  deleteMany(args: DeleteByExperienceArgs): Promise<unknown>;
};

type ExtraRuleDelegate = {
  createMany(args: CreateExtraRulesArgs): Promise<unknown>;
  deleteMany(args: DeleteByExperienceArgs): Promise<unknown>;
};

export type PrismaExperienceRepositoryTransaction = {
  experience: ExperienceDelegate;
  experienceExtraRule: ExtraRuleDelegate;
  experienceFixedSlot: FixedSlotDelegate;
};

export type PrismaExperienceRepositoryClient =
  PrismaExperienceRepositoryTransaction & {
    $transaction<T>(
      operation: (
        transaction: PrismaExperienceRepositoryTransaction,
      ) => Promise<T>,
    ): Promise<T>;
  };

const experienceInclude = {
  extraRules: true,
  fixedSlots: {
    orderBy: {
      position: "asc",
    },
  },
};

export class PrismaExperienceRepository implements ExperienceRepository {
  constructor(private readonly prisma: PrismaExperienceRepositoryClient) {}

  async list() {
    const records = await this.prisma.experience.findMany({
      include: experienceInclude,
      orderBy: [{ displayOrder: "asc" }, { internalName: "asc" }],
    });

    return records.map(experienceFromPrismaRecord);
  }

  async findById(id: string) {
    const record = await this.prisma.experience.findUnique({
      include: experienceInclude,
      where: {
        id,
      },
    });

    return record ? experienceFromPrismaRecord(record) : null;
  }

  async save(experience: Experience) {
    const writeModel = experienceToPrismaWriteModel(experience);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.experience.upsert({
        create: {
          id: writeModel.id,
          ...writeModel.experience,
        },
        update: writeModel.experience,
        where: {
          id: writeModel.id,
        },
      });

      await transaction.experienceFixedSlot.deleteMany({
        where: {
          experienceId: writeModel.id,
        },
      });

      await transaction.experienceExtraRule.deleteMany({
        where: {
          experienceId: writeModel.id,
        },
      });

      if (writeModel.fixedSlots.length > 0) {
        await transaction.experienceFixedSlot.createMany({
          data: writeModel.fixedSlots.map((slot) => ({
            experienceId: writeModel.id,
            ...slot,
          })),
        });
      }

      if (writeModel.extraRules.length > 0) {
        await transaction.experienceExtraRule.createMany({
          data: writeModel.extraRules.map((rule) => ({
            experienceId: writeModel.id,
            ...rule,
          })),
        });
      }
    });
  }
}

export type {
  PrismaExperienceExtraRuleRecord,
  PrismaExperienceFixedSlotRecord,
  PrismaExperienceRecord,
};
