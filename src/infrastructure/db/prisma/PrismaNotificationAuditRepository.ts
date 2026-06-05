import type {
  NotificationAuditEntryWriteModel,
  NotificationAuditRepository,
} from "@/modules/notifications/application/ports/NotificationAuditRepository";

import {
  notificationAuditEntryToPrismaCreateModel,
  type PrismaNotificationAuditEntryCreateModel,
} from "./PrismaNotificationMappers";

type AuditEntryCreateArgs = {
  data: PrismaNotificationAuditEntryCreateModel;
};

type AuditEntryDelegate = {
  create(args: AuditEntryCreateArgs): Promise<unknown>;
};

export type PrismaNotificationAuditRepositoryClient = {
  backpanelAuditEntry: AuditEntryDelegate;
};

export class PrismaNotificationAuditRepository
  implements NotificationAuditRepository
{
  constructor(private readonly prisma: PrismaNotificationAuditRepositoryClient) {}

  async record(entry: NotificationAuditEntryWriteModel) {
    await this.prisma.backpanelAuditEntry.create({
      data: notificationAuditEntryToPrismaCreateModel(entry),
    });
  }
}
