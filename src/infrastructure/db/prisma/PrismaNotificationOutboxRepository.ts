import type { OutboxRepository } from "@/modules/notifications/application/ports/OutboxRepository";

import {
  notificationOutboxMessageFromPrismaRecord,
  type PrismaNotificationOutboxMessageRecord,
} from "./PrismaNotificationMappers";

type OutboxMessageFindArgs = {
  orderBy?: unknown;
  take?: number;
  where?: unknown;
};

type OutboxMessageUpdateArgs = {
  data: {
    failureReason?: string | null;
    publishedAt?: Date | null;
    status: "FAILED" | "PUBLISHED";
    updatedAt: Date;
  };
  where: {
    id: string;
  };
};

type OutboxMessageDelegate = {
  findFirst(
    args: OutboxMessageFindArgs,
  ): Promise<PrismaNotificationOutboxMessageRecord | null>;
  findUnique(
    args: OutboxMessageFindArgs,
  ): Promise<PrismaNotificationOutboxMessageRecord | null>;
  update(args: OutboxMessageUpdateArgs): Promise<unknown>;
};

export type PrismaNotificationOutboxRepositoryClient = {
  outboxMessage: OutboxMessageDelegate;
};

export class PrismaNotificationOutboxRepository implements OutboxRepository {
  constructor(private readonly prisma: PrismaNotificationOutboxRepositoryClient) {}

  async findById(id: string) {
    const record = await this.prisma.outboxMessage.findUnique({
      where: {
        id,
      },
    });

    return record ? notificationOutboxMessageFromPrismaRecord(record) : null;
  }

  async findNextPending() {
    const record = await this.prisma.outboxMessage.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        aggregateType: "BOOKING",
        status: "PENDING",
      },
    });

    return record ? notificationOutboxMessageFromPrismaRecord(record) : null;
  }

  async markFailed(id: string, failedAt: Date, reason: string) {
    await this.prisma.outboxMessage.update({
      data: {
        failureReason: reason,
        status: "FAILED",
        updatedAt: failedAt,
      },
      where: {
        id,
      },
    });
  }

  async markPublished(id: string, publishedAt: Date) {
    await this.prisma.outboxMessage.update({
      data: {
        failureReason: null,
        publishedAt,
        status: "PUBLISHED",
        updatedAt: publishedAt,
      },
      where: {
        id,
      },
    });
  }
}

export type { PrismaNotificationOutboxMessageRecord };
