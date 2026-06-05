import type { ExtraRepository } from "@/modules/experience-catalog/application/ports/ExtraRepository";
import type { Extra } from "@/modules/experience-catalog/domain/Extra";

import {
  extraFromPrismaRecord,
  extraToPrismaWriteModel,
  type PrismaExtraRecord,
  type PrismaExtraWriteModel,
} from "./PrismaExperienceCatalogMappers";

type ExtraFindManyArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type ExtraFindUniqueArgs = {
  where: {
    id: string;
  };
};

type ExtraUpsertArgs = {
  create: PrismaExtraWriteModel;
  update: PrismaExtraWriteModel;
  where: {
    id: string;
  };
};

export type PrismaExtraRepositoryClient = {
  extra: {
    findUnique(args: ExtraFindUniqueArgs): Promise<PrismaExtraRecord | null>;
    findMany(args: ExtraFindManyArgs): Promise<PrismaExtraRecord[]>;
    upsert(args: ExtraUpsertArgs): Promise<unknown>;
  };
};

export class PrismaExtraRepository implements ExtraRepository {
  constructor(private readonly prisma: PrismaExtraRepositoryClient) {}

  async findById(id: string) {
    const record = await this.prisma.extra.findUnique({
      where: {
        id,
      },
    });

    return record ? extraFromPrismaRecord(record) : null;
  }

  async list() {
    const records = await this.prisma.extra.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return records.map(extraFromPrismaRecord);
  }

  async findManyByIds(ids: string[]) {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length === 0) {
      return [];
    }

    const records = await this.prisma.extra.findMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
    });

    return records.map(extraFromPrismaRecord);
  }

  async save(extra: Extra) {
    const writeModel = extraToPrismaWriteModel(extra);

    await this.prisma.extra.upsert({
      create: writeModel,
      update: writeModel,
      where: {
        id: writeModel.id,
      },
    });
  }
}
