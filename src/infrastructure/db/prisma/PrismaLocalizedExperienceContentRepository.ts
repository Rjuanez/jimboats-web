import type { LocalizedExperienceContentReader } from "@/modules/experience-catalog/application/ports/LocalizedExperienceContentReader";
import type { AdminLocalizedExperienceContentReadModel } from "@/modules/experience-catalog/application/ports/LocalizedExperienceContentReader";
import type { LocalizedExperienceContentRepository } from "@/modules/localization-seo/application/ports/LocalizedExperienceContentRepository";
import type { LocalizedExperienceContent } from "@/modules/localization-seo/domain/LocalizedExperienceContent";
import type { LocaleCode } from "@/shared/domain/LocaleCode";

import {
  localizedExperienceContentFromPrismaRecord,
  localizedExperienceContentToPrismaWriteModel,
} from "./PrismaLocalizedExperienceContentMappers";
import type {
  PrismaLocalizedExperienceContentRecord,
  PrismaLocalizedExperienceContentWriteModel,
} from "./PrismaLocalizedExperienceContentMappers";

type LocalizedContentFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type LocalizedContentUpsertArgs = {
  create: PrismaLocalizedExperienceContentWriteModel["content"] & {
    id: string;
  };
  update: PrismaLocalizedExperienceContentWriteModel["content"];
  where: {
    experienceId_locale: {
      experienceId: string;
      locale: string;
    };
  };
};

type DeleteFaqArgs = {
  where: {
    localizedContentId: string;
  };
};

type CreateFaqArgs = {
  data: Array<
    PrismaLocalizedExperienceContentWriteModel["faqItems"][number] & {
      localizedContentId: string;
    }
  >;
};

type LocalizedContentDelegate = {
  findMany(
    args: LocalizedContentFindArgs,
  ): Promise<PrismaLocalizedExperienceContentRecord[]>;
  findUnique(
    args: LocalizedContentFindArgs,
  ): Promise<PrismaLocalizedExperienceContentRecord | null>;
  upsert(args: LocalizedContentUpsertArgs): Promise<unknown>;
};

type LocalizedFaqDelegate = {
  createMany(args: CreateFaqArgs): Promise<unknown>;
  deleteMany(args: DeleteFaqArgs): Promise<unknown>;
};

export type PrismaLocalizedExperienceContentTransaction = {
  localizedExperienceContent: LocalizedContentDelegate;
  localizedExperienceFaq: LocalizedFaqDelegate;
};

export type PrismaLocalizedExperienceContentClient =
  PrismaLocalizedExperienceContentTransaction & {
    $transaction<T>(
      operation: (
        transaction: PrismaLocalizedExperienceContentTransaction,
      ) => Promise<T>,
    ): Promise<T>;
  };

const localizedContentInclude = {
  faqItems: {
    orderBy: {
      position: "asc",
    },
  },
};

export class PrismaLocalizedExperienceContentRepository
  implements
    LocalizedExperienceContentRepository,
    LocalizedExperienceContentReader
{
  constructor(
    private readonly prisma: PrismaLocalizedExperienceContentClient,
  ) {}

  async findByExperienceAndLocale(experienceId: string, locale: LocaleCode) {
    const record = await this.prisma.localizedExperienceContent.findUnique({
      include: localizedContentInclude,
      where: {
        experienceId_locale: {
          experienceId,
          locale: locale.value,
        },
      },
    });

    return record ? localizedExperienceContentFromPrismaRecord(record) : null;
  }

  async saveExperienceContent(
    experienceId: string,
    content: LocalizedExperienceContent,
  ) {
    const writeModel = localizedExperienceContentToPrismaWriteModel(
      experienceId,
      content,
    );

    await this.prisma.$transaction(async (transaction) => {
      await transaction.localizedExperienceContent.upsert({
        create: {
          id: writeModel.id,
          ...writeModel.content,
        },
        update: writeModel.content,
        where: {
          experienceId_locale: {
            experienceId,
            locale: writeModel.locale,
          },
        },
      });

      await transaction.localizedExperienceFaq.deleteMany({
        where: {
          localizedContentId: writeModel.id,
        },
      });

      if (writeModel.faqItems.length > 0) {
        await transaction.localizedExperienceFaq.createMany({
          data: writeModel.faqItems.map((faq) => ({
            localizedContentId: writeModel.id,
            ...faq,
          })),
        });
      }
    });
  }

  async listByExperienceId(experienceId: string) {
    const records = await this.prisma.localizedExperienceContent.findMany({
      include: localizedContentInclude,
      orderBy: {
        locale: "asc",
      },
      where: {
        experienceId,
      },
    });

    return records.map((record) =>
      toReadModel(
        record.experienceId,
        localizedExperienceContentFromPrismaRecord(record),
      ),
    );
  }

  async listPublishableCandidatesByExperienceId(experienceId: string) {
    const records = await this.prisma.localizedExperienceContent.findMany({
      include: localizedContentInclude,
      orderBy: {
        locale: "asc",
      },
      where: {
        experienceId,
        publicPageEnabled: true,
        status: {
          in: ["READY", "PUBLISHED"],
        },
      },
    });

    return records.map(localizedExperienceContentFromPrismaRecord);
  }
}

function toReadModel(
  experienceId: string,
  content: LocalizedExperienceContent,
): AdminLocalizedExperienceContentReadModel {
  const snapshot = content.toSnapshot();

  return {
    ...snapshot,
    experienceId,
    publicationIssues: content.getPublicationIssues(),
  };
}
