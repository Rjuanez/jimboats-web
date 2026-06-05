import type { NotificationTemplateRepository } from "@/modules/notifications/application/ports/NotificationTemplateRepository";
import type { NotificationTemplate } from "@/modules/notifications/domain/NotificationTemplate";

import {
  notificationTemplateFromPrismaRecord,
  notificationTemplateToPrismaWriteModel,
  type PrismaNotificationTemplateRecord,
  type PrismaNotificationTemplateTranslationRecord,
  type PrismaNotificationTemplateWriteModel,
} from "./PrismaNotificationMappers";

type NotificationTemplateFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type NotificationTemplateUpsertArgs = {
  create: PrismaNotificationTemplateWriteModel["template"] & { id: string };
  update: PrismaNotificationTemplateWriteModel["template"];
  where: {
    id: string;
  };
};

type NotificationTemplateTranslationDeleteManyArgs = {
  where: {
    templateId: string;
  };
};

type NotificationTemplateTranslationCreateManyArgs = {
  data: Array<
    PrismaNotificationTemplateWriteModel["translations"][number] & {
      templateId: string;
    }
  >;
};

type NotificationTemplateDelegate = {
  findMany(
    args: NotificationTemplateFindArgs,
  ): Promise<PrismaNotificationTemplateRecord[]>;
  findUnique(
    args: NotificationTemplateFindArgs,
  ): Promise<PrismaNotificationTemplateRecord | null>;
  upsert(args: NotificationTemplateUpsertArgs): Promise<unknown>;
};

type NotificationTemplateTranslationDelegate = {
  createMany(args: NotificationTemplateTranslationCreateManyArgs): Promise<unknown>;
  deleteMany(args: NotificationTemplateTranslationDeleteManyArgs): Promise<unknown>;
};

export type PrismaNotificationTemplateRepositoryTransaction = {
  notificationTemplate: NotificationTemplateDelegate;
  notificationTemplateTranslation: NotificationTemplateTranslationDelegate;
};

export type PrismaNotificationTemplateRepositoryClient =
  PrismaNotificationTemplateRepositoryTransaction & {
    $transaction?<T>(
      operation: (
        transaction: PrismaNotificationTemplateRepositoryTransaction,
      ) => Promise<T>,
    ): Promise<T>;
  };

const templateInclude = {
  translations: {
    orderBy: {
      locale: "asc",
    },
  },
};

export class PrismaNotificationTemplateRepository
  implements NotificationTemplateRepository
{
  constructor(
    private readonly prisma: PrismaNotificationTemplateRepositoryClient,
  ) {}

  async findById(id: string) {
    const record = await this.prisma.notificationTemplate.findUnique({
      include: templateInclude,
      where: {
        id,
      },
    });

    return record ? notificationTemplateFromPrismaRecord(record) : null;
  }

  async list() {
    const records = await this.prisma.notificationTemplate.findMany({
      include: templateInclude,
      orderBy: {
        id: "asc",
      },
    });

    return records.map(notificationTemplateFromPrismaRecord);
  }

  async save(template: NotificationTemplate) {
    const writeModel = notificationTemplateToPrismaWriteModel(template);

    await runNotificationTemplateOperation(this.prisma, async (transaction) => {
      await transaction.notificationTemplate.upsert({
        create: {
          id: writeModel.id,
          ...writeModel.template,
        },
        update: writeModel.template,
        where: {
          id: writeModel.id,
        },
      });

      await transaction.notificationTemplateTranslation.deleteMany({
        where: {
          templateId: writeModel.id,
        },
      });

      if (writeModel.translations.length > 0) {
        await transaction.notificationTemplateTranslation.createMany({
          data: writeModel.translations.map((translation) => ({
            templateId: writeModel.id,
            ...translation,
          })),
        });
      }
    });
  }
}

async function runNotificationTemplateOperation<T>(
  client: PrismaNotificationTemplateRepositoryClient,
  operation: (
    transaction: PrismaNotificationTemplateRepositoryTransaction,
  ) => Promise<T>,
) {
  if (client.$transaction) {
    return client.$transaction(operation);
  }

  return operation(client);
}

export type {
  PrismaNotificationTemplateRecord,
  PrismaNotificationTemplateTranslationRecord,
};
