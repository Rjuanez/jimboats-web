import type { NotificationDeliveryRepository } from "@/modules/notifications/application/ports/NotificationDeliveryRepository";
import type { NotificationDelivery } from "@/modules/notifications/domain/NotificationDelivery";

import {
  notificationDeliveryFromPrismaRecord,
  notificationDeliveryToPrismaWriteModel,
  type PrismaNotificationDeliveryRecord,
  type PrismaNotificationDeliveryWriteModel,
} from "./PrismaNotificationMappers";

type NotificationDeliveryFindArgs = {
  orderBy?: unknown;
  take?: number;
  where?: unknown;
};

type NotificationDeliveryUpsertArgs = {
  create: PrismaNotificationDeliveryWriteModel["delivery"] & { id: string };
  update: PrismaNotificationDeliveryWriteModel["delivery"];
  where: {
    id: string;
  };
};

type NotificationDeliveryDelegate = {
  findFirst(
    args: NotificationDeliveryFindArgs,
  ): Promise<PrismaNotificationDeliveryRecord | null>;
  findMany(
    args: NotificationDeliveryFindArgs,
  ): Promise<PrismaNotificationDeliveryRecord[]>;
  findUnique(
    args: NotificationDeliveryFindArgs,
  ): Promise<PrismaNotificationDeliveryRecord | null>;
  upsert(args: NotificationDeliveryUpsertArgs): Promise<unknown>;
};

export type PrismaNotificationDeliveryRepositoryClient = {
  notificationDelivery: NotificationDeliveryDelegate;
};

export class PrismaNotificationDeliveryRepository
  implements NotificationDeliveryRepository
{
  constructor(
    private readonly prisma: PrismaNotificationDeliveryRepositoryClient,
  ) {}

  async findById(id: string) {
    const record = await this.prisma.notificationDelivery.findUnique({
      where: {
        id,
      },
    });

    return record ? notificationDeliveryFromPrismaRecord(record) : null;
  }

  async findByOutboxMessageAndRule(input: {
    outboxMessageId: string;
    ruleId: string;
  }) {
    const record = await this.prisma.notificationDelivery.findFirst({
      where: {
        outboxMessageId: input.outboxMessageId,
        ruleId: input.ruleId,
      },
    });

    return record ? notificationDeliveryFromPrismaRecord(record) : null;
  }

  async findNextPendingToSend(now: Date) {
    const record = await this.prisma.notificationDelivery.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        OR: [
          {
            sendAfter: null,
          },
          {
            sendAfter: {
              lte: now,
            },
          },
        ],
        status: "PENDING",
      },
    });

    return record ? notificationDeliveryFromPrismaRecord(record) : null;
  }

  async listRecent(input: { limit?: number } = {}) {
    const records = await this.prisma.notificationDelivery.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: input.limit ?? 25,
    });

    return records.map(notificationDeliveryFromPrismaRecord);
  }

  async save(delivery: NotificationDelivery) {
    const writeModel = notificationDeliveryToPrismaWriteModel(delivery);

    await this.prisma.notificationDelivery.upsert({
      create: {
        id: writeModel.id,
        ...writeModel.delivery,
      },
      update: writeModel.delivery,
      where: {
        id: writeModel.id,
      },
    });
  }
}

export type { PrismaNotificationDeliveryRecord };
