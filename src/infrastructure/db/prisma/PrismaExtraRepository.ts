import type { ExtraRepository } from "@/modules/experience-catalog/application/ports/ExtraRepository";

import {
  extraFromPrismaRecord,
  type PrismaExtraRecord,
} from "./PrismaExperienceCatalogMappers";

type ExtraFindManyArgs = {
  orderBy?: unknown;
  where?: unknown;
};

export type PrismaExtraRepositoryClient = {
  extra: {
    findMany(args: ExtraFindManyArgs): Promise<PrismaExtraRecord[]>;
  };
};

export class PrismaExtraRepository implements ExtraRepository {
  constructor(private readonly prisma: PrismaExtraRepositoryClient) {}

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
}
