import type { NotificationRuleRepository } from "@/modules/notifications/application/ports/NotificationRuleRepository";
import type { NotificationRule } from "@/modules/notifications/domain/NotificationRule";

import {
  notificationRuleFromPrismaRecord,
  notificationRuleToPrismaWriteModel,
  type PrismaNotificationRuleRecord,
  type PrismaNotificationRuleWriteModel,
} from "./PrismaNotificationMappers";

type NotificationRuleFindArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type NotificationRuleUpsertArgs = {
  create: PrismaNotificationRuleWriteModel["rule"] & { id: string };
  update: PrismaNotificationRuleWriteModel["rule"];
  where: {
    id: string;
  };
};

type NotificationRuleDelegate = {
  findFirst(
    args: NotificationRuleFindArgs,
  ): Promise<PrismaNotificationRuleRecord | null>;
  findMany(args: NotificationRuleFindArgs): Promise<PrismaNotificationRuleRecord[]>;
  findUnique(
    args: NotificationRuleFindArgs,
  ): Promise<PrismaNotificationRuleRecord | null>;
  upsert(args: NotificationRuleUpsertArgs): Promise<unknown>;
};

export type PrismaNotificationRuleRepositoryClient = {
  notificationRule: NotificationRuleDelegate;
};

export class PrismaNotificationRuleRepository
  implements NotificationRuleRepository
{
  constructor(private readonly prisma: PrismaNotificationRuleRepositoryClient) {}

  async findActiveByIdentity(
    identity: Parameters<NotificationRuleRepository["findActiveByIdentity"]>[0],
  ) {
    const record = await this.prisma.notificationRule.findFirst({
      where: {
        channel: identity.channel,
        eventType: identity.eventType,
        recipientType: identity.recipientType,
        status: "ACTIVE",
      },
    });

    return record ? notificationRuleFromPrismaRecord(record) : null;
  }

  async findById(id: string) {
    const record = await this.prisma.notificationRule.findUnique({
      where: {
        id,
      },
    });

    return record ? notificationRuleFromPrismaRecord(record) : null;
  }

  async list() {
    const records = await this.prisma.notificationRule.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return records.map(notificationRuleFromPrismaRecord);
  }

  async listByEventType(eventType: string) {
    const records = await this.prisma.notificationRule.findMany({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        eventType,
      },
    });

    return records.map(notificationRuleFromPrismaRecord);
  }

  async save(rule: NotificationRule) {
    const writeModel = notificationRuleToPrismaWriteModel(rule);

    await this.prisma.notificationRule.upsert({
      create: {
        id: writeModel.id,
        ...writeModel.rule,
      },
      update: writeModel.rule,
      where: {
        id: writeModel.id,
      },
    });
  }
}

export type { PrismaNotificationRuleRecord };
