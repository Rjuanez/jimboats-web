import { describe, expect, it } from "vitest";

import { PrismaNotificationAuditRepository } from "./PrismaNotificationAuditRepository";
import type { PrismaNotificationAuditRepositoryClient } from "./PrismaNotificationAuditRepository";
import { PrismaNotificationBookingReader } from "./PrismaNotificationBookingReader";
import type { PrismaNotificationBookingReaderClient } from "./PrismaNotificationBookingReader";
import { PrismaNotificationDeliveryRepository } from "./PrismaNotificationDeliveryRepository";
import type { PrismaNotificationDeliveryRepositoryClient } from "./PrismaNotificationDeliveryRepository";
import { PrismaNotificationOutboxRepository } from "./PrismaNotificationOutboxRepository";
import type { PrismaNotificationOutboxRepositoryClient } from "./PrismaNotificationOutboxRepository";
import { PrismaNotificationRuleRepository } from "./PrismaNotificationRuleRepository";
import type { PrismaNotificationRuleRepositoryClient } from "./PrismaNotificationRuleRepository";
import { PrismaNotificationTemplateRepository } from "./PrismaNotificationTemplateRepository";
import type {
  PrismaNotificationTemplateRepositoryClient,
  PrismaNotificationTemplateRepositoryTransaction,
} from "./PrismaNotificationTemplateRepository";
import type {
  PrismaNotificationAuditEntryCreateModel,
  PrismaNotificationDeliveryRecord,
  PrismaNotificationOutboxMessageRecord,
  PrismaNotificationRuleRecord,
  PrismaNotificationTemplateRecord,
  PrismaNotificationTemplateTranslationRecord,
} from "./PrismaNotificationMappers";
import {
  bookingRecord,
  createNotificationDelivery,
  createNotificationRule,
  createNotificationTemplate,
} from "./PrismaNotificationMappers.test";

describe("Prisma notification repositories", () => {
  it("saves and queries notification rules", async () => {
    const client = new InMemoryNotificationClient();
    const repository = new PrismaNotificationRuleRepository(client);

    await repository.save(createNotificationRule());

    const loaded = await repository.findById("rule-email");
    const active = await repository.findActiveByIdentity({
      channel: "EMAIL",
      eventType: "BookingCreated",
      recipientType: "BUYER",
    });
    const allRules = await repository.list();
    const rules = await repository.listByEventType("BookingCreated");

    expect(loaded?.toSnapshot()).toMatchObject({
      id: "rule-email",
      templateId: "template-email",
    });
    expect(active?.id).toBe("rule-email");
    expect(allRules).toHaveLength(1);
    expect(rules).toHaveLength(1);
  });

  it("saves templates with their translations in a transaction", async () => {
    const client = new InMemoryNotificationClient();
    const repository = new PrismaNotificationTemplateRepository(client);

    await repository.save(createNotificationTemplate());

    const loaded = await repository.findById("template-email");
    const templates = await repository.list();

    expect(client.transactions).toBe(1);
    expect(loaded?.toSnapshot()).toMatchObject({
      id: "template-email",
      translations: [
        {
          locale: "en",
          status: "PUBLISHED",
        },
      ],
    });
    expect(templates.map((template) => template.id)).toEqual([
      "template-email",
    ]);
  });

  it("saves deliveries and finds idempotent outbox-rule matches", async () => {
    const client = new InMemoryNotificationClient();
    const repository = new PrismaNotificationDeliveryRepository(client);

    await repository.save(createNotificationDelivery());
    await repository.save(
      createNotificationDelivery({
        createdAt: date("2026-06-02T10:00:00.000Z"),
        id: "delivery-2",
        updatedAt: date("2026-06-02T10:00:00.000Z"),
      }),
    );

    const loaded = await repository.findById("delivery-1");
    const byOutboxAndRule = await repository.findByOutboxMessageAndRule({
      outboxMessageId: "outbox-1",
      ruleId: "rule-email",
    });
    const nextPending = await repository.findNextPendingToSend(
      date("2026-06-03T10:00:00.000Z"),
    );
    const recent = await repository.listRecent({ limit: 1 });

    expect(loaded?.toSnapshot()).toMatchObject({
      id: "delivery-1",
      status: "PENDING",
    });
    expect(byOutboxAndRule?.toSnapshot().id).toBe("delivery-1");
    expect(nextPending?.toSnapshot().id).toBe("delivery-1");
    expect(recent.map((delivery) => delivery.toSnapshot().id)).toEqual([
      "delivery-2",
    ]);
  });

  it("loads and marks notification outbox messages", async () => {
    const client = new InMemoryNotificationClient();
    const repository = new PrismaNotificationOutboxRepository(client);

    client.outboxMessages.set("outbox-1", outboxRecord());

    const loaded = await repository.findById("outbox-1");
    const nextPending = await repository.findNextPending();
    await repository.markPublished("outbox-1", date("2026-06-03T10:00:00.000Z"));
    await repository.markFailed(
      "outbox-1",
      date("2026-06-03T10:01:00.000Z"),
      "Renderer failed.",
    );

    expect(loaded).toMatchObject({
      aggregateType: "BOOKING",
      status: "PENDING",
    });
    expect(nextPending?.id).toBe("outbox-1");
    expect(client.outboxMessages.get("outbox-1")).toMatchObject({
      failureReason: "Renderer failed.",
      status: "FAILED",
    });
  });

  it("reads booking notification data and writes notification audits", async () => {
    const client = new InMemoryNotificationClient();
    const bookingReader = new PrismaNotificationBookingReader(client);
    const auditRepository = new PrismaNotificationAuditRepository(client);

    client.bookings.set("booking-1", bookingRecord());

    const booking = await bookingReader.findNotificationBookingById("booking-1");
    await auditRepository.record({
      action: "NOTIFICATION_RULE_UPDATED",
      actorUserId: "admin-user",
      createdAt: date("2026-06-03T10:00:00.000Z"),
      diff: {
        after: {
          enabled: true,
        },
      },
      resourceId: "rule-email",
      resourceType: "NOTIFICATION_RULE",
    });

    expect(booking).toMatchObject({
      id: "booking-1",
      notificationPreferences: {
        email: {
          consentStatus: "GRANTED",
        },
      },
    });
    expect(client.auditEntries).toMatchObject([
      {
        action: "NOTIFICATION_RULE_UPDATED",
        resourceId: "rule-email",
      },
    ]);
  });
});

class InMemoryNotificationClient
  implements
    PrismaNotificationAuditRepositoryClient,
    PrismaNotificationBookingReaderClient,
    PrismaNotificationDeliveryRepositoryClient,
    PrismaNotificationOutboxRepositoryClient,
    PrismaNotificationRuleRepositoryClient,
    PrismaNotificationTemplateRepositoryClient
{
  readonly auditEntries: PrismaNotificationAuditEntryCreateModel[] = [];
  readonly bookings = new Map<string, ReturnType<typeof bookingRecord>>();
  readonly deliveries = new Map<string, PrismaNotificationDeliveryRecord>();
  readonly outboxMessages = new Map<string, PrismaNotificationOutboxMessageRecord>();
  readonly rules = new Map<string, PrismaNotificationRuleRecord>();
  readonly templates = new Map<
    string,
    Omit<PrismaNotificationTemplateRecord, "translations">
  >();
  readonly translations: PrismaNotificationTemplateTranslationRecord[] = [];
  transactions = 0;

  readonly backpanelAuditEntry = {
    create: async (
      args: Parameters<
        PrismaNotificationAuditRepositoryClient["backpanelAuditEntry"]["create"]
      >[0],
    ) => {
      this.auditEntries.push(args.data);
    },
  };

  readonly booking = {
    findUnique: async (
      args: Parameters<
        PrismaNotificationBookingReaderClient["booking"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.bookings.get(id) ?? null : null;
    },
  };

  readonly notificationDelivery = {
    findFirst: async (
      args: Parameters<
        PrismaNotificationDeliveryRepositoryClient["notificationDelivery"]["findFirst"]
      >[0],
    ) => {
      const where = readObject(args.where);
      const outboxMessageId = readStringProperty(where, "outboxMessageId");
      const ruleId = readStringProperty(where, "ruleId");
      const status = readStringProperty(where, "status");

      return (
        maybeSortByCreatedAt(
          [...this.deliveries.values()].filter((delivery) => {
            return (
              (!outboxMessageId ||
                delivery.outboxMessageId === outboxMessageId) &&
              (!ruleId || delivery.ruleId === ruleId) &&
              (!status || delivery.status === status)
            );
          }),
          args.orderBy,
        )[0] ?? null
      );
    },
    findMany: async (
      args: Parameters<
        PrismaNotificationDeliveryRepositoryClient["notificationDelivery"]["findMany"]
      >[0],
    ) => {
      return [...this.deliveries.values()]
        .sort((left, right) => {
          const leftTime = left.createdAt.getTime();
          const rightTime = right.createdAt.getTime();

          return readOrderDirection(args.orderBy, "createdAt") === "asc"
            ? leftTime - rightTime
            : rightTime - leftTime;
        })
        .slice(0, args.take ?? this.deliveries.size);
    },
    findUnique: async (
      args: Parameters<
        PrismaNotificationDeliveryRepositoryClient["notificationDelivery"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.deliveries.get(id) ?? null : null;
    },
    upsert: async (
      args: Parameters<
        PrismaNotificationDeliveryRepositoryClient["notificationDelivery"]["upsert"]
      >[0],
    ) => {
      const current = this.deliveries.get(args.where.id);

      this.deliveries.set(args.where.id, {
        ...(current ?? args.create),
        ...args.update,
        id: args.where.id,
      });
    },
  };

  readonly notificationRule = {
    findFirst: async (
      args: Parameters<
        PrismaNotificationRuleRepositoryClient["notificationRule"]["findFirst"]
      >[0],
    ) => {
      const where = readObject(args.where);

      return (
        [...this.rules.values()].find((rule) => {
          return (
            matchesWhere(rule.channel, where.channel) &&
            matchesWhere(rule.eventType, where.eventType) &&
            matchesWhere(rule.recipientType, where.recipientType) &&
            matchesWhere(rule.status, where.status)
          );
        }) ?? null
      );
    },
    findMany: async (
      args: Parameters<
        PrismaNotificationRuleRepositoryClient["notificationRule"]["findMany"]
      >[0],
    ) => {
      const eventType = readStringProperty(args.where, "eventType");

      return [...this.rules.values()].filter(
        (rule) => !eventType || rule.eventType === eventType,
      );
    },
    findUnique: async (
      args: Parameters<
        PrismaNotificationRuleRepositoryClient["notificationRule"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.rules.get(id) ?? null : null;
    },
    upsert: async (
      args: Parameters<
        PrismaNotificationRuleRepositoryClient["notificationRule"]["upsert"]
      >[0],
    ) => {
      const current = this.rules.get(args.where.id);

      this.rules.set(args.where.id, {
        ...(current ?? args.create),
        ...args.update,
        id: args.where.id,
      });
    },
  };

  readonly notificationTemplate = {
    findMany: async () => {
      return [...this.templates.keys()]
        .sort((left, right) => left.localeCompare(right))
        .map((id) => this.hydrateTemplate(id))
        .filter(
          (
            template,
          ): template is PrismaNotificationTemplateRecord => template !== null,
        );
    },
    findUnique: async (
      args: Parameters<
        PrismaNotificationTemplateRepositoryClient["notificationTemplate"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.hydrateTemplate(id) : null;
    },
    upsert: async (
      args: Parameters<
        PrismaNotificationTemplateRepositoryClient["notificationTemplate"]["upsert"]
      >[0],
    ) => {
      const current = this.templates.get(args.where.id);

      this.templates.set(args.where.id, {
        ...(current ?? args.create),
        ...args.update,
        id: args.where.id,
      });
    },
  };

  readonly notificationTemplateTranslation = {
    createMany: async (
      args: Parameters<
        PrismaNotificationTemplateRepositoryClient["notificationTemplateTranslation"]["createMany"]
      >[0],
    ) => {
      this.translations.push(...args.data);
    },
    deleteMany: async (
      args: Parameters<
        PrismaNotificationTemplateRepositoryClient["notificationTemplateTranslation"]["deleteMany"]
      >[0],
    ) => {
      const remaining = this.translations.filter(
        (translation) => translation.templateId !== args.where.templateId,
      );

      this.translations.length = 0;
      this.translations.push(...remaining);
    },
  };

  readonly outboxMessage = {
    findFirst: async (
      args: Parameters<
        PrismaNotificationOutboxRepositoryClient["outboxMessage"]["findFirst"]
      >[0],
    ) => {
      const where = readObject(args.where);
      const aggregateType = readStringProperty(where, "aggregateType");
      const status = readStringProperty(where, "status");

      return (
        [...this.outboxMessages.values()]
          .filter((message) => {
            return (
              (!aggregateType || message.aggregateType === aggregateType) &&
              (!status || message.status === status)
            );
          })
          .sort((left, right) => {
            const leftTime = readDateProperty(left, "createdAt").getTime();
            const rightTime = readDateProperty(right, "createdAt").getTime();

            return readOrderDirection(args.orderBy, "createdAt") === "asc"
              ? leftTime - rightTime
              : rightTime - leftTime;
          })[0] ?? null
      );
    },
    findUnique: async (
      args: Parameters<
        PrismaNotificationOutboxRepositoryClient["outboxMessage"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.outboxMessages.get(id) ?? null : null;
    },
    update: async (
      args: Parameters<
        PrismaNotificationOutboxRepositoryClient["outboxMessage"]["update"]
      >[0],
    ) => {
      const record = this.outboxMessages.get(args.where.id);

      if (!record) {
        throw new Error("Outbox message not found.");
      }

      this.outboxMessages.set(args.where.id, {
        ...record,
        ...args.data,
      });
    },
  };

  async $transaction<T>(
    operation: (
      transaction: PrismaNotificationTemplateRepositoryTransaction,
    ) => Promise<T>,
  ) {
    this.transactions += 1;

    return operation(this);
  }

  private hydrateTemplate(id: string): PrismaNotificationTemplateRecord | null {
    const template = this.templates.get(id);

    if (!template) {
      return null;
    }

    return {
      ...template,
      translations: this.translations
        .filter((translation) => translation.templateId === id)
        .sort((left, right) => left.locale.localeCompare(right.locale)),
    };
  }
}

function outboxRecord(
  patch: Partial<PrismaNotificationOutboxMessageRecord> = {},
): PrismaNotificationOutboxMessageRecord {
  return {
    aggregateId: "booking-1",
    aggregateType: "BOOKING",
    eventType: "BookingCreated",
    id: "outbox-1",
    payload: {
      bookingId: "booking-1",
    },
    status: "PENDING",
    ...patch,
  };
}

function matchesWhere(value: string, expected: unknown) {
  return typeof expected !== "string" || value === expected;
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readStringProperty(value: unknown, key: string) {
  const object = readObject(value);

  return typeof object[key] === "string" ? object[key] : null;
}

function readDateProperty(value: unknown, key: string) {
  const object = readObject(value);
  const property = object[key];

  return property instanceof Date ? property : new Date(0);
}

function readOrderDirection(value: unknown, key: string) {
  const object = readObject(value);

  return object[key] === "asc" ? "asc" : "desc";
}

function maybeSortByCreatedAt<TRecord extends { createdAt: Date }>(
  records: TRecord[],
  orderBy: unknown,
) {
  if (!orderBy) {
    return records;
  }

  return records.sort((left, right) => {
    const leftTime = left.createdAt.getTime();
    const rightTime = right.createdAt.getTime();

    return readOrderDirection(orderBy, "createdAt") === "asc"
      ? leftTime - rightTime
      : rightTime - leftTime;
  });
}

function date(value: string) {
  return new Date(value);
}
