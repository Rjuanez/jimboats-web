import type { BookingRepository } from "@/modules/booking/application/ports/BookingRepository";
import type {
  AdminCancelledBookingPersistence,
  AdminCreatedBookingPersistence,
  BookingAuditAction,
  BookingAuditEntryReadModel,
  AdminUpdatedBookingPersistence,
  BookingAuditEntryWriteModel,
  BookingCalendarBlockUpdateModel,
  BookingCalendarBlockWriteModel,
  BookingOutboxEventWriteModel,
  DepositPaymentFailedPersistence,
  DepositPaymentSucceededPersistence,
  PaymentProviderEventWriteModel,
  PublicPendingBookingPersistence,
} from "@/modules/booking/application/ports/BookingRepository";

import {
  bookingExperienceOptionFromPrismaRecord,
  bookingExtraOptionFromPrismaRecord,
  bookingFromPrismaRecord,
  bookingToPrismaWriteModel,
  paymentRecordFromPrismaRecord,
  paymentRecordToPrismaWriteModel,
} from "./PrismaBookingMappers";
import type {
  PrismaBookingExperienceRecord,
  PrismaBookingExtraOptionRecord,
  PrismaBookingRecord,
  PrismaBookingWriteModel,
  PrismaPaymentRecordRecord,
  PrismaPaymentRecordWriteModel,
} from "./PrismaBookingMappers";
import { localDateToUtcDate } from "@/modules/boat-calendar/application/CalendarDateTime";

type BookingFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  take?: number;
  where?: unknown;
};

type BookingCreateArgs = {
  data: PrismaBookingWriteModel["booking"] & { id: string };
};

type BookingUpdateArgs = {
  data: Partial<PrismaBookingWriteModel["booking"]> & {
    externalCalendarEventId?: string | null;
    externalCalendarSyncedAt?: Date | null;
    externalCalendarSyncError?: string | null;
  };
  where: {
    id: string;
  };
};

type BookingExtraCreateManyArgs = {
  data: Array<
    PrismaBookingWriteModel["extras"][number] & {
      bookingId: string;
    }
  >;
};

type BookingExtraDeleteManyArgs = {
  where: {
    bookingId: string;
  };
};

type PaymentRecordCreateArgs = {
  data: PrismaPaymentRecordWriteModel;
};

type PaymentRecordFindFirstArgs = {
  where?: unknown;
};

type PaymentRecordUpdateArgs = {
  data: Partial<PrismaPaymentRecordWriteModel>;
  where: {
    id: string;
  };
};

type BookingNotificationPreferenceCreateArgs = {
  data: BookingNotificationPreferenceCreateModel;
};

type PaymentProviderEventCreateArgs = {
  data: PaymentProviderEventCreateModel;
};

type CalendarBlockFindManyArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type CalendarBlockCreateArgs = {
  data: CalendarBlockCreateModel;
};

type CalendarBlockUpdateArgs = {
  data: Partial<
    Omit<CalendarBlockCreateModel, "status"> & {
      status: "ACTIVE" | "RELEASED";
    }
  >;
  where: {
    id: string;
  };
};

type AuditEntryCreateManyArgs = {
  data: BookingAuditEntryCreateModel[];
};

type AuditEntryFindManyArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type OutboxMessageCreateManyArgs = {
  data: BookingOutboxMessageCreateModel[];
};

type ExperienceFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type ExtraFindArgs = {
  orderBy?: unknown;
  where?: unknown;
};

type BookingDelegate = {
  create(args: BookingCreateArgs): Promise<unknown>;
  findMany(args: BookingFindArgs): Promise<PrismaBookingRecord[]>;
  findUnique(args: BookingFindArgs): Promise<PrismaBookingRecord | null>;
  update(args: BookingUpdateArgs): Promise<unknown>;
};

type BookingExtraDelegate = {
  createMany(args: BookingExtraCreateManyArgs): Promise<unknown>;
  deleteMany(args: BookingExtraDeleteManyArgs): Promise<unknown>;
};

type PaymentRecordDelegate = {
  create(args: PaymentRecordCreateArgs): Promise<unknown>;
  findFirst(
    args: PaymentRecordFindFirstArgs,
  ): Promise<PrismaPaymentRecordRecord | null>;
  update(args: PaymentRecordUpdateArgs): Promise<unknown>;
};

type BookingNotificationPreferenceDelegate = {
  create(args: BookingNotificationPreferenceCreateArgs): Promise<unknown>;
};

type PaymentProviderEventDelegate = {
  create(args: PaymentProviderEventCreateArgs): Promise<unknown>;
};

type CalendarBlockOverlapRecord = {
  id: string;
  protectedEndAt: Date;
  protectedStartAt: Date;
};

type CalendarBlockDelegate = {
  create(args: CalendarBlockCreateArgs): Promise<unknown>;
  findMany(args: CalendarBlockFindManyArgs): Promise<CalendarBlockOverlapRecord[]>;
  update(args: CalendarBlockUpdateArgs): Promise<unknown>;
};

type AuditEntryDelegate = {
  createMany(args: AuditEntryCreateManyArgs): Promise<unknown>;
  findMany(args: AuditEntryFindManyArgs): Promise<BookingAuditEntryRecord[]>;
};

type OutboxMessageDelegate = {
  createMany(args: OutboxMessageCreateManyArgs): Promise<unknown>;
};

type ExperienceDelegate = {
  findMany(args: ExperienceFindArgs): Promise<PrismaBookingExperienceRecord[]>;
  findUnique(
    args: ExperienceFindArgs,
  ): Promise<PrismaBookingExperienceRecord | null>;
};

type ExtraDelegate = {
  findMany(args: ExtraFindArgs): Promise<PrismaBookingExtraOptionRecord[]>;
};

export type PrismaBookingRepositoryTransaction = {
  backpanelAuditEntry: AuditEntryDelegate;
  booking: BookingDelegate;
  bookingExtra: BookingExtraDelegate;
  bookingNotificationPreference: BookingNotificationPreferenceDelegate;
  calendarBlock: CalendarBlockDelegate;
  outboxMessage: OutboxMessageDelegate;
  paymentRecord: PaymentRecordDelegate;
  paymentProviderEvent: PaymentProviderEventDelegate;
};

export type PrismaBookingRepositoryClient = PrismaBookingRepositoryTransaction & {
  experience: ExperienceDelegate;
  extra: ExtraDelegate;
  $transaction<T>(
    operation: (transaction: PrismaBookingRepositoryTransaction) => Promise<T>,
  ): Promise<T>;
};

const bookingInclude = {
  extras: {
    orderBy: {
      nameSnapshot: "asc",
    },
  },
};

const experienceInclude = {
  extraRules: true,
  fixedSlots: {
    orderBy: {
      position: "asc",
    },
  },
};

export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaBookingRepositoryClient) {}

  async findCalendarSyncState(bookingId: string) {
    const record = await this.prisma.booking.findUnique({
      include: bookingInclude,
      where: {
        id: bookingId,
      },
    });

    return record
      ? {
          externalEventId: record.externalCalendarEventId,
          syncError: record.externalCalendarSyncError,
          syncedAt: record.externalCalendarSyncedAt,
        }
      : null;
  }

  async findBookingsPendingCalendarSync(input: { limit: number }) {
    const records = await this.prisma.booking.findMany({
      include: bookingInclude,
      orderBy: {
        updatedAt: "asc",
      },
      take: input.limit,
      where: {
        OR: [
          {
            externalCalendarEventId: null,
            status: "CONFIRMED",
          },
          {
            externalCalendarSyncError: {
              not: null,
            },
            status: {
              in: ["CANCELLED", "CONFIRMED"],
            },
          },
          {
            externalCalendarEventId: {
              not: null,
            },
            externalCalendarSyncedAt: null,
            status: {
              in: ["CANCELLED", "CONFIRMED"],
            },
          },
          {
            externalCalendarEventId: {
              not: null,
            },
            status: {
              in: ["CANCELLED", "CONFIRMED"],
            },
            updatedAt: {
              gt: bookingFields(this.prisma.booking).externalCalendarSyncedAt,
            },
          },
        ],
      },
    });

    return records.map(bookingFromPrismaRecord);
  }

  async list() {
    const records = await this.prisma.booking.findMany({
      include: bookingInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(bookingFromPrismaRecord);
  }

  async findById(id: string) {
    const record = await this.prisma.booking.findUnique({
      include: bookingInclude,
      where: {
        id,
      },
    });

    return record ? bookingFromPrismaRecord(record) : null;
  }

  async findByPaymentProviderSessionId(providerSessionId: string) {
    const paymentRecord = await this.prisma.paymentRecord.findFirst({
      where: {
        providerSessionId,
      },
    });

    if (!paymentRecord) {
      return null;
    }

    const booking = await this.prisma.booking.findUnique({
      include: bookingInclude,
      where: {
        id: paymentRecord.bookingId,
      },
    });

    if (!booking) {
      return null;
    }

    return {
      booking: bookingFromPrismaRecord(booking),
      paymentRecord: paymentRecordFromPrismaRecord(paymentRecord),
    };
  }

  async listAuditEntriesForBookings(
    bookingIds: string[],
  ): Promise<BookingAuditEntryReadModel[]> {
    const uniqueBookingIds = [...new Set(bookingIds)];

    if (uniqueBookingIds.length === 0) {
      return [];
    }

    const records = await this.prisma.backpanelAuditEntry.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        resourceId: {
          in: uniqueBookingIds,
        },
        resourceType: "BOOKING",
      },
    });

    return records.map(auditEntryFromPrismaRecord);
  }

  async listExperienceOptions() {
    const records = await this.prisma.experience.findMany({
      include: experienceInclude,
      orderBy: [{ displayOrder: "asc" }, { internalName: "asc" }],
      where: {
        status: {
          not: "ARCHIVED",
        },
      },
    });

    return records.map(bookingExperienceOptionFromPrismaRecord);
  }

  async findExperienceOptionById(id: string) {
    const record = await this.prisma.experience.findUnique({
      include: experienceInclude,
      where: {
        id,
      },
    });

    return record ? bookingExperienceOptionFromPrismaRecord(record) : null;
  }

  async listExtraOptions() {
    const records = await this.prisma.extra.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        status: "ACTIVE",
      },
    });

    return records.map(bookingExtraOptionFromPrismaRecord);
  }

  async findExtraOptionsByIds(ids: string[]) {
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

    return records.map(bookingExtraOptionFromPrismaRecord);
  }

  async findActiveCalendarOverlaps(
    startAt: Date,
    endAt: Date,
    input: { excludeBlockId?: string } = {},
  ) {
    const where: Record<string, unknown> = {
      protectedEndAt: {
        gt: startAt,
      },
      protectedStartAt: {
        lt: endAt,
      },
      status: "ACTIVE",
    };

    if (input.excludeBlockId) {
      where.id = {
        not: input.excludeBlockId,
      };
    }

    return this.prisma.calendarBlock.findMany({
      orderBy: [{ localDate: "asc" }, { visibleStartMinutes: "asc" }],
      where,
    });
  }

  async saveAdminCreatedBooking(input: AdminCreatedBookingPersistence) {
    const bookingWriteModel = bookingToPrismaWriteModel(
      input.booking,
      input.extraLineIds,
    );
    const paymentWriteModel = paymentRecordToPrismaWriteModel(
      input.paymentRecord,
    );

    await this.prisma.$transaction(async (transaction) => {
      await transaction.booking.create({
        data: {
          id: bookingWriteModel.id,
          ...bookingWriteModel.booking,
        },
      });

      if (bookingWriteModel.extras.length > 0) {
        await transaction.bookingExtra.createMany({
          data: bookingWriteModel.extras.map((extra) => ({
            bookingId: bookingWriteModel.id,
            ...extra,
          })),
        });
      }

      await transaction.paymentRecord.create({
        data: paymentWriteModel,
      });

      await transaction.calendarBlock.create({
        data: calendarBlockToPrismaCreateModel(input.calendarBlock),
      });

      await transaction.backpanelAuditEntry.createMany({
        data: auditEntriesToPrismaCreateModels(input.auditEntries),
      });

      await transaction.outboxMessage.createMany({
        data: outboxEventsToPrismaCreateModels(input.outboxEvents),
      });
    });
  }

  async savePublicPendingBooking(input: PublicPendingBookingPersistence) {
    const bookingWriteModel = bookingToPrismaWriteModel(
      input.booking,
      input.extraLineIds,
    );
    const paymentWriteModel = paymentRecordToPrismaWriteModel(
      input.paymentRecord,
    );

    await this.prisma.$transaction(async (transaction) => {
      await transaction.booking.create({
        data: {
          id: bookingWriteModel.id,
          ...bookingWriteModel.booking,
        },
      });

      if (bookingWriteModel.extras.length > 0) {
        await transaction.bookingExtra.createMany({
          data: bookingWriteModel.extras.map((extra) => ({
            bookingId: bookingWriteModel.id,
            ...extra,
          })),
        });
      }

      await transaction.paymentRecord.create({
        data: paymentWriteModel,
      });

      await transaction.calendarBlock.create({
        data: calendarBlockToPrismaCreateModel(input.calendarBlock),
      });

      await transaction.bookingNotificationPreference.create({
        data: notificationPreferencesToPrismaCreateModel({
          bookingId: bookingWriteModel.id,
          preferences: input.notificationPreferences,
        }),
      });
    });
  }

  async saveAdminUpdatedBooking(input: AdminUpdatedBookingPersistence) {
    const bookingWriteModel = bookingToPrismaWriteModel(
      input.booking,
      input.extraLineIds,
    );

    await this.prisma.$transaction(async (transaction) => {
      await transaction.booking.update({
        data: bookingWriteModel.booking,
        where: {
          id: bookingWriteModel.id,
        },
      });

      await transaction.bookingExtra.deleteMany({
        where: {
          bookingId: bookingWriteModel.id,
        },
      });

      if (bookingWriteModel.extras.length > 0) {
        await transaction.bookingExtra.createMany({
          data: bookingWriteModel.extras.map((extra) => ({
            bookingId: bookingWriteModel.id,
            ...extra,
          })),
        });
      }

      await transaction.calendarBlock.update({
        data: calendarBlockToPrismaUpdateModel(input.calendarBlock),
        where: {
          id: input.calendarBlock.id,
        },
      });

      await transaction.backpanelAuditEntry.createMany({
        data: auditEntriesToPrismaCreateModels(input.auditEntries),
      });

      await transaction.outboxMessage.createMany({
        data: outboxEventsToPrismaCreateModels(input.outboxEvents),
      });
    });
  }

  async saveDepositPaymentSucceeded(
    input: DepositPaymentSucceededPersistence,
  ) {
    const booking = input.booking.toSnapshot();
    const paymentRecord = paymentRecordToPrismaWriteModel(input.paymentRecord);

    try {
      await this.prisma.$transaction(async (transaction) => {
        await transaction.paymentProviderEvent.create({
          data: paymentProviderEventToPrismaCreateModel(input.providerEvent),
        });

        await transaction.booking.update({
          data: {
            confirmedAt: booking.confirmedAt
              ? new Date(booking.confirmedAt)
              : null,
            holdExpiresAt: booking.holdExpiresAt
              ? new Date(booking.holdExpiresAt)
              : null,
            status: booking.status,
            updatedAt: new Date(booking.updatedAt),
          },
          where: {
            id: booking.id,
          },
        });

        await transaction.paymentRecord.update({
          data: {
            failureReason: paymentRecord.failureReason,
            paidAt: paymentRecord.paidAt,
            providerPaymentIntentId: paymentRecord.providerPaymentIntentId,
            providerSessionId: paymentRecord.providerSessionId,
            status: paymentRecord.status,
          },
          where: {
            id: paymentRecord.id,
          },
        });

        await transaction.calendarBlock.update({
          data: {
            expiresAt: null,
            source: "BOOKING_CONFIRMED",
            updatedAt: new Date(booking.updatedAt),
          },
          where: {
            id: input.calendarBlockId,
          },
        });

        await transaction.backpanelAuditEntry.createMany({
          data: auditEntriesToPrismaCreateModels(input.auditEntries),
        });

        await transaction.outboxMessage.createMany({
          data: outboxEventsToPrismaCreateModels(input.outboxEvents),
        });
      });

      return "PROCESSED" as const;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return "DUPLICATE" as const;
      }

      throw error;
    }
  }

  async saveDepositPaymentFailed(input: DepositPaymentFailedPersistence) {
    const booking = input.booking.toSnapshot();
    const paymentRecord = paymentRecordToPrismaWriteModel(input.paymentRecord);

    try {
      await this.prisma.$transaction(async (transaction) => {
        await transaction.paymentProviderEvent.create({
          data: paymentProviderEventToPrismaCreateModel(input.providerEvent),
        });

        await transaction.booking.update({
          data: {
            holdExpiresAt: booking.holdExpiresAt
              ? new Date(booking.holdExpiresAt)
              : null,
            status: booking.status,
            updatedAt: new Date(booking.updatedAt),
          },
          where: {
            id: booking.id,
          },
        });

        await transaction.paymentRecord.update({
          data: {
            failureReason: paymentRecord.failureReason,
            paidAt: paymentRecord.paidAt,
            providerPaymentIntentId: paymentRecord.providerPaymentIntentId,
            providerSessionId: paymentRecord.providerSessionId,
            status: paymentRecord.status,
          },
          where: {
            id: paymentRecord.id,
          },
        });

        await transaction.calendarBlock.update({
          data: {
            status: "RELEASED",
            updatedAt: input.releasedAt,
          },
          where: {
            id: input.calendarBlockId,
          },
        });
      });

      return "PROCESSED" as const;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return "DUPLICATE" as const;
      }

      throw error;
    }
  }

  async saveAdminCancelledBooking(input: AdminCancelledBookingPersistence) {
    const snapshot = input.booking.toSnapshot();

    await this.prisma.$transaction(async (transaction) => {
      await transaction.booking.update({
        data: {
          cancelledAt: snapshot.cancelledAt ? new Date(snapshot.cancelledAt) : null,
          status: snapshot.status,
          updatedAt: new Date(snapshot.updatedAt),
        },
        where: {
          id: snapshot.id,
        },
      });

      await transaction.calendarBlock.update({
        data: {
          status: "RELEASED",
          updatedAt: input.releasedAt,
        },
        where: {
          id: input.calendarBlockId,
        },
      });

      await transaction.backpanelAuditEntry.createMany({
        data: auditEntriesToPrismaCreateModels(input.auditEntries),
      });

      await transaction.outboxMessage.createMany({
        data: outboxEventsToPrismaCreateModels(input.outboxEvents),
      });
    });
  }

  async markCalendarSynced(input: {
    bookingId: string;
    externalEventId: string;
    syncedAt: Date;
  }) {
    await this.prisma.booking.update({
      data: {
        externalCalendarEventId: input.externalEventId,
        externalCalendarSyncError: null,
        externalCalendarSyncedAt: input.syncedAt,
      },
      where: {
        id: input.bookingId,
      },
    });
  }

  async markCalendarSyncFailed(input: {
    bookingId: string;
    syncError: string;
  }) {
    await this.prisma.booking.update({
      data: {
        externalCalendarSyncError: input.syncError,
      },
      where: {
        id: input.bookingId,
      },
    });
  }
}

function bookingFields(booking: BookingDelegate) {
  return (booking as BookingDelegate & {
    fields: {
      externalCalendarSyncedAt: unknown;
    };
  }).fields;
}

type CalendarBlockCreateModel = {
  bookingId: string;
  createdAt: Date;
  createdByUserId: string;
  experienceId: string;
  expiresAt: Date | null;
  id: string;
  localDate: Date;
  protectedEndAt: Date;
  protectedStartAt: Date;
  reason: string;
  source: "BOOKING_CONFIRMED" | "BOOKING_HOLD";
  status: "ACTIVE";
  timeZone: string;
  updatedAt: Date;
  visibleEndMinutes: number;
  visibleStartMinutes: number;
};

type BookingAuditEntryCreateModel = {
  action: string;
  actorUserId: string | null;
  createdAt: Date;
  diffJson: BookingAuditEntryWriteModel["diff"];
  reason: string | null;
  resourceId: string;
  resourceType: string;
};

type BookingAuditEntryRecord = BookingAuditEntryCreateModel & {
  id: string;
};

type BookingOutboxMessageCreateModel = {
  aggregateId: string;
  aggregateType: string;
  createdAt: Date;
  eventType: string;
  eventVersion: number;
  occurredAt: Date;
  payload: BookingOutboxEventWriteModel["payload"];
  status: "PENDING";
  updatedAt: Date;
};

type BookingNotificationPreferenceCreateModel = {
  bookingId: string;
  consentCapturedAt: Date;
  consentNotes: string | null;
  consentSource: "BACKPANEL" | "BUYER_ACCESS" | "CHECKOUT";
  emailAddress: string | null;
  emailConsentStatus: "GRANTED" | "NOT_ASKED" | "REVOKED";
  emailEnabled: boolean;
  id: string;
  preferredLocale: string;
  whatsappConsentStatus: "GRANTED" | "NOT_ASKED" | "REVOKED";
  whatsappEnabled: boolean;
  whatsappPhone: string | null;
};

type PaymentProviderEventCreateModel = {
  eventType: string;
  failureReason: string | null;
  payloadJson: PaymentProviderEventWriteModel["payload"];
  processedAt: Date | null;
  provider: string;
  providerEventId: string;
  receivedAt: Date;
  status: "FAILED" | "IGNORED" | "PROCESSED";
};

function calendarBlockToPrismaCreateModel(
  block: BookingCalendarBlockWriteModel,
): CalendarBlockCreateModel {
  return {
    bookingId: block.bookingId,
    createdAt: block.createdAt,
    createdByUserId: block.createdByUserId,
    experienceId: block.experienceId,
    expiresAt: block.expiresAt,
    id: block.id,
    localDate: localDateToUtcDate(block.localDate),
    protectedEndAt: block.protectedEndAt,
    protectedStartAt: block.protectedStartAt,
    reason: block.reason,
    source: block.source,
    status: block.status,
    timeZone: block.timeZone,
    updatedAt: block.updatedAt,
    visibleEndMinutes: block.visibleEndMinutes,
    visibleStartMinutes: block.visibleStartMinutes,
  };
}

function notificationPreferencesToPrismaCreateModel(input: {
  bookingId: string;
  preferences: PublicPendingBookingPersistence["notificationPreferences"];
}): BookingNotificationPreferenceCreateModel {
  const snapshot = input.preferences.toSnapshot();

  return {
    bookingId: input.bookingId,
    consentCapturedAt: new Date(snapshot.consentCapturedAt),
    consentNotes: snapshot.consentNotes || null,
    consentSource: snapshot.consentSource,
    emailAddress: snapshot.email.destination,
    emailConsentStatus: snapshot.email.consentStatus,
    emailEnabled: snapshot.email.enabled,
    id: `booking-notification-preference-${input.bookingId}`,
    preferredLocale: snapshot.preferredLocale,
    whatsappConsentStatus: snapshot.whatsapp.consentStatus,
    whatsappEnabled: snapshot.whatsapp.enabled,
    whatsappPhone: snapshot.whatsapp.destination,
  };
}

function paymentProviderEventToPrismaCreateModel(
  event: PaymentProviderEventWriteModel,
): PaymentProviderEventCreateModel {
  return {
    eventType: event.eventType,
    failureReason: null,
    payloadJson: event.payload,
    processedAt: event.processedAt,
    provider: event.provider,
    providerEventId: event.providerEventId,
    receivedAt: event.receivedAt,
    status: event.status,
  };
}

function auditEntriesToPrismaCreateModels(
  entries: BookingAuditEntryWriteModel[],
): BookingAuditEntryCreateModel[] {
  return entries.map((entry) => ({
    action: entry.action,
    actorUserId: entry.actorUserId,
    createdAt: entry.createdAt,
    diffJson: entry.diff,
    reason: entry.reason,
    resourceId: entry.resourceId,
    resourceType: entry.resourceType,
  }));
}

function auditEntryFromPrismaRecord(
  record: BookingAuditEntryRecord,
): BookingAuditEntryReadModel {
  return {
    action: record.action as BookingAuditAction,
    actorUserId: record.actorUserId,
    createdAt: record.createdAt,
    diff: record.diffJson ?? null,
    id: record.id,
    reason: record.reason,
    resourceId: record.resourceId,
    resourceType: "BOOKING",
  };
}

function outboxEventsToPrismaCreateModels(
  events: BookingOutboxEventWriteModel[],
): BookingOutboxMessageCreateModel[] {
  return events.map((event) => ({
    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    createdAt: event.occurredAt,
    eventType: event.eventType,
    eventVersion: event.eventVersion,
    occurredAt: event.occurredAt,
    payload: event.payload,
    status: "PENDING",
    updatedAt: event.occurredAt,
  }));
}

function calendarBlockToPrismaUpdateModel(
  block: BookingCalendarBlockUpdateModel,
): Partial<CalendarBlockCreateModel> {
  return {
    bookingId: block.bookingId,
    experienceId: block.experienceId,
    expiresAt: block.expiresAt,
    localDate: localDateToUtcDate(block.localDate),
    protectedEndAt: block.protectedEndAt,
    protectedStartAt: block.protectedStartAt,
    reason: block.reason,
    source: block.source,
    status: block.status,
    timeZone: block.timeZone,
    updatedAt: block.updatedAt,
    visibleEndMinutes: block.visibleEndMinutes,
    visibleStartMinutes: block.visibleStartMinutes,
  };
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export type {
  PrismaBookingExperienceRecord,
  PrismaBookingExtraOptionRecord,
  PrismaBookingRecord,
};
