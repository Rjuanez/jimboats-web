import { describe, expect, it } from "vitest";

import { PaymentRecord } from "@/modules/booking/domain/PaymentRecord";
import { Money } from "@/shared/domain/Money";

import { PrismaBookingRepository } from "./PrismaBookingRepository";
import type {
  PrismaBookingRepositoryClient,
  PrismaBookingRepositoryTransaction,
} from "./PrismaBookingRepository";
import type {
  PrismaBookingExtraOptionRecord,
  PrismaBookingRecord,
  PrismaPaymentRecordRecord,
} from "./PrismaBookingMappers";
import { bookingFromPrismaRecord } from "./PrismaBookingMappers";
import { bookingRecord, experienceRecord } from "./PrismaBookingMappers.test";

describe("PrismaBookingRepository", () => {
  it("creates and loads admin bookings through a Prisma-shaped client", async () => {
    const client = new InMemoryBookingClient();
    const repository = new PrismaBookingRepository(client);

    await repository.saveAdminCreatedBooking(createPersistence());

    const loaded = await repository.findById("booking-1");
    const list = await repository.list();
    const auditEntries = await repository.listAuditEntriesForBookings([
      "booking-1",
    ]);

    expect(loaded?.toSnapshot()).toMatchObject({
      reference: "JB-2026-0001",
      status: "CONFIRMED",
    });
    expect(list).toHaveLength(1);
    expect(client.calendarBlocks).toMatchObject([
      {
        bookingId: "booking-1",
        source: "BOOKING_CONFIRMED",
      },
    ]);
    expect(client.auditEntries).toMatchObject([
      {
        action: "BOOKING_CREATED",
        resourceId: "booking-1",
      },
    ]);
    expect(client.outboxMessages).toMatchObject([
      {
        aggregateId: "booking-1",
        eventType: "BookingCreated",
        status: "PENDING",
      },
    ]);
    expect(auditEntries).toMatchObject([
      {
        action: "BOOKING_CREATED",
        resourceId: "booking-1",
      },
    ]);
  });

  it("stores external calendar sync metadata", async () => {
    const client = new InMemoryBookingClient();
    const repository = new PrismaBookingRepository(client);

    await repository.saveAdminCreatedBooking(createPersistence());
    await repository.markCalendarSynced({
      bookingId: "booking-1",
      externalEventId: "jb-calendar-event",
      syncedAt: new Date("2026-06-02T10:00:00.000Z"),
    });

    await expect(
      repository.findCalendarSyncState("booking-1"),
    ).resolves.toMatchObject({
      externalEventId: "jb-calendar-event",
      syncError: null,
      syncedAt: new Date("2026-06-02T10:00:00.000Z"),
    });

    await repository.markCalendarSyncFailed({
      bookingId: "booking-1",
      syncError: "Calendar unavailable.",
    });

    await expect(
      repository.findCalendarSyncState("booking-1"),
    ).resolves.toMatchObject({
      externalEventId: "jb-calendar-event",
      syncError: "Calendar unavailable.",
      syncedAt: new Date("2026-06-02T10:00:00.000Z"),
    });
  });

  it("updates admin bookings and rewrites their selected extras", async () => {
    const client = new InMemoryBookingClient();
    const repository = new PrismaBookingRepository(client);

    await repository.saveAdminCreatedBooking(createPersistence());
    await repository.saveAdminUpdatedBooking({
      auditEntries: [
        {
          action: "BOOKING_UPDATED",
          actorUserId: "admin-user",
          createdAt: new Date("2026-06-02T10:00:00.000Z"),
          diff: {
            changes: [
              {
                field: "selectedSlot",
              },
            ],
          },
          reason: null,
          resourceId: "booking-1",
          resourceType: "BOOKING",
        },
      ],
      booking: bookingFromPrismaRecord(
        bookingRecord({
          customerEmail: "updated@example.com",
          customerName: "Updated Guest",
          guestCount: 2,
          selectedEndMinutes: 16 * 60,
          selectedLocalDate: new Date("2026-06-12T00:00:00.000Z"),
          selectedSlotKey: "afternoon",
          selectedStartMinutes: 12 * 60,
        }),
      ),
      calendarBlock: {
        bookingId: "booking-1",
        experienceId: "sunset-cruise",
        expiresAt: null,
        id: "block-booking-1",
        localDate: "2026-06-12",
        protectedEndAt: new Date("2026-06-12T14:30:00.000Z"),
        protectedStartAt: new Date("2026-06-12T09:30:00.000Z"),
        reason: "Booking JB-2026-0001",
        source: "BOOKING_CONFIRMED",
        status: "ACTIVE",
        timeZone: "Europe/Madrid",
        updatedAt: new Date("2026-06-02T10:00:00.000Z"),
        visibleEndMinutes: 16 * 60,
        visibleStartMinutes: 12 * 60,
      },
      extraLineIds: new Map([["champagne", "line-champagne-updated"]]),
      outboxEvents: [
        {
          aggregateId: "booking-1",
          aggregateType: "BOOKING",
          eventType: "BookingUpdated",
          eventVersion: 1,
          occurredAt: new Date("2026-06-02T10:00:00.000Z"),
          payload: {
            bookingId: "booking-1",
          },
        },
      ],
    });

    const loaded = await repository.findById("booking-1");

    expect(loaded?.toSnapshot()).toMatchObject({
      customer: {
        email: "updated@example.com",
      },
      guestCount: 2,
      selectedSlot: {
        localDate: "2026-06-12",
        slotKey: "afternoon",
      },
    });
    expect(client.bookingExtras).toMatchObject([
      {
        id: "line-champagne-updated",
      },
    ]);
    expect(client.calendarBlocks).toMatchObject([
      {
        id: "block-booking-1",
        visibleStartMinutes: 12 * 60,
      },
    ]);
    expect(client.auditEntries.at(-1)).toMatchObject({
      action: "BOOKING_UPDATED",
      resourceId: "booking-1",
    });
    expect(client.outboxMessages.at(-1)).toMatchObject({
      aggregateId: "booking-1",
      eventType: "BookingUpdated",
    });
  });

  it("cancels admin bookings and releases their calendar block", async () => {
    const client = new InMemoryBookingClient();
    const repository = new PrismaBookingRepository(client);

    await repository.saveAdminCreatedBooking(createPersistence());
    await repository.saveAdminCancelledBooking({
      auditEntries: [
        {
          action: "BOOKING_CANCELLED",
          actorUserId: "admin-user",
          createdAt: new Date("2026-06-02T10:00:00.000Z"),
          diff: {
            after: {
              status: "CANCELLED",
            },
            before: {
              status: "CONFIRMED",
            },
          },
          reason: null,
          resourceId: "booking-1",
          resourceType: "BOOKING",
        },
      ],
      booking: bookingFromPrismaRecord(
        bookingRecord({
          cancelledAt: new Date("2026-06-02T10:00:00.000Z"),
          status: "CANCELLED",
          updatedAt: new Date("2026-06-02T10:00:00.000Z"),
        }),
      ),
      calendarBlockId: "block-booking-1",
      outboxEvents: [
        {
          aggregateId: "booking-1",
          aggregateType: "BOOKING",
          eventType: "BookingCancelled",
          eventVersion: 1,
          occurredAt: new Date("2026-06-02T10:00:00.000Z"),
          payload: {
            bookingId: "booking-1",
          },
        },
      ],
      releasedAt: new Date("2026-06-02T10:00:00.000Z"),
    });

    const loaded = await repository.findById("booking-1");

    expect(loaded?.toSnapshot()).toMatchObject({
      status: "CANCELLED",
    });
    expect(client.calendarBlocks).toMatchObject([
      {
        id: "block-booking-1",
        status: "RELEASED",
      },
    ]);
    expect(client.auditEntries.at(-1)).toMatchObject({
      action: "BOOKING_CANCELLED",
      resourceId: "booking-1",
    });
    expect(client.outboxMessages.at(-1)).toMatchObject({
      aggregateId: "booking-1",
      eventType: "BookingCancelled",
    });
  });

  it("loads booking catalog options and calendar overlaps", async () => {
    const client = new InMemoryBookingClient({
      calendarBlocks: [
        {
          id: "block-active",
          protectedEndAt: new Date("2026-06-10T13:00:00.000Z"),
          protectedStartAt: new Date("2026-06-10T07:00:00.000Z"),
          status: "ACTIVE",
        },
      ],
    });
    const repository = new PrismaBookingRepository(client);

    const experiences = await repository.listExperienceOptions();
    const extras = await repository.findExtraOptionsByIds(["champagne"]);
    const overlaps = await repository.findActiveCalendarOverlaps(
      new Date("2026-06-10T08:00:00.000Z"),
      new Date("2026-06-10T09:00:00.000Z"),
    );

    expect(experiences[0]).toMatchObject({
      id: "sunset-cruise",
      slotPolicy: {
        mode: "FIXED_SLOTS",
      },
    });
    expect(extras).toMatchObject([{ id: "champagne" }]);
    expect(overlaps).toMatchObject([{ id: "block-active" }]);
  });

  it("loads and releases expired public payment holds", async () => {
    const client = new InMemoryBookingClient();
    const repository = new PrismaBookingRepository(client);
    const persistence = createPersistence();
    const pendingBooking = bookingFromPrismaRecord(
      bookingRecord({
        confirmedAt: null,
        holdExpiresAt: new Date("2026-06-01T10:30:00.000Z"),
        source: "PUBLIC_CHECKOUT",
        status: "PENDING_PAYMENT",
      }),
    );
    const paymentRecord = PaymentRecord.createStripePendingDeposit({
      amount: Money.create({ amountMinor: 10_000, currency: "EUR" }),
      bookingId: "booking-1",
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      id: "payment-1",
    });

    await repository.savePublicPendingBooking({
      booking: pendingBooking,
      calendarBlock: {
        ...persistence.calendarBlock,
        expiresAt: new Date("2026-06-01T10:30:00.000Z"),
        source: "BOOKING_HOLD",
      },
      extraLineIds: new Map(),
      notificationPreferences: {
        toSnapshot: () => ({
          consentCapturedAt: "2026-06-01T10:00:00.000Z",
          consentNotes: "test",
          consentSource: "CHECKOUT" as const,
          email: {
            consentStatus: "GRANTED" as const,
            destination: "sailor@example.com",
            enabled: true,
          },
          preferredLocale: "en" as const,
          whatsapp: {
            consentStatus: "NOT_ASKED" as const,
            destination: null,
            enabled: false,
          },
        }),
      } as never,
      paymentRecord,
    });

    const expiredHolds = await repository.findExpiredPaymentHolds({
      limit: 10,
      now: new Date("2026-06-01T10:31:00.000Z"),
    });

    expect(expiredHolds).toHaveLength(1);

    await expect(
      repository.savePaymentHoldReleased({
        booking: expiredHolds[0].booking.expirePaymentHold({
          expiredAt: new Date("2026-06-01T10:31:00.000Z"),
        }),
        calendarBlockId: "block-booking-1",
        paymentRecord: expiredHolds[0].paymentRecord.markCancelled({
          failureReason: "expired",
        }),
        releasedAt: new Date("2026-06-01T10:31:00.000Z"),
      }),
    ).resolves.toBe("RELEASED");

    await expect(repository.findById("booking-1")).resolves.toMatchObject({
      status: "EXPIRED",
    });
    expect(client.calendarBlocks[0]).toMatchObject({
      status: "RELEASED",
    });
    expect(client.paymentRecords[0]).toMatchObject({
      status: "CANCELLED",
    });
  });

  it("skips payment hold release when a payment race already changed status", async () => {
    const client = new InMemoryBookingClient();
    const repository = new PrismaBookingRepository(client);
    const persistence = createPersistence();
    const pendingBooking = bookingFromPrismaRecord(
      bookingRecord({
        confirmedAt: null,
        holdExpiresAt: new Date("2026-06-01T10:30:00.000Z"),
        source: "PUBLIC_CHECKOUT",
        status: "PENDING_PAYMENT",
      }),
    );
    const paymentRecord = PaymentRecord.createStripePendingDeposit({
      amount: Money.create({ amountMinor: 10_000, currency: "EUR" }),
      bookingId: "booking-1",
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      id: "payment-1",
    });

    await repository.savePublicPendingBooking({
      booking: pendingBooking,
      calendarBlock: {
        ...persistence.calendarBlock,
        expiresAt: new Date("2026-06-01T10:30:00.000Z"),
        source: "BOOKING_HOLD",
      },
      extraLineIds: new Map(),
      notificationPreferences: {
        toSnapshot: () => ({
          consentCapturedAt: "2026-06-01T10:00:00.000Z",
          consentNotes: "test",
          consentSource: "CHECKOUT" as const,
          email: {
            consentStatus: "GRANTED" as const,
            destination: "sailor@example.com",
            enabled: true,
          },
          preferredLocale: "en" as const,
          whatsapp: {
            consentStatus: "NOT_ASKED" as const,
            destination: null,
            enabled: false,
          },
        }),
      } as never,
      paymentRecord,
    });

    const expiredHolds = await repository.findExpiredPaymentHolds({
      limit: 10,
      now: new Date("2026-06-01T10:31:00.000Z"),
    });
    await client.booking.update({
      data: {
        confirmedAt: new Date("2026-06-01T10:30:30.000Z"),
        holdExpiresAt: null,
        status: "CONFIRMED",
      },
      where: {
        id: "booking-1",
      },
    });

    await expect(
      repository.savePaymentHoldReleased({
        booking: expiredHolds[0].booking.expirePaymentHold({
          expiredAt: new Date("2026-06-01T10:31:00.000Z"),
        }),
        calendarBlockId: "block-booking-1",
        paymentRecord: expiredHolds[0].paymentRecord.markCancelled({
          failureReason: "expired",
        }),
        releasedAt: new Date("2026-06-01T10:31:00.000Z"),
      }),
    ).resolves.toBe("SKIPPED");

    await expect(repository.findById("booking-1")).resolves.toMatchObject({
      status: "CONFIRMED",
    });
    expect(client.calendarBlocks[0]).toMatchObject({
      status: "ACTIVE",
    });
    expect(client.paymentRecords[0]).toMatchObject({
      status: "PENDING",
    });
  });
});

class InMemoryBookingClient implements PrismaBookingRepositoryClient {
  private readonly records = new Map<string, PrismaBookingRecord>();
  readonly auditEntries: Array<
    Parameters<
      PrismaBookingRepositoryClient["backpanelAuditEntry"]["createMany"]
    >[0]["data"][number] & { id: string }
  > = [];
  readonly bookingExtras: Array<
    PrismaBookingRecord["extras"][number] & { bookingId: string }
  > = [];
  private readonly experiences = [experienceRecord()];
  private readonly extras: PrismaBookingExtraOptionRecord[] = [
    {
      id: "champagne",
      name: "Premium champagne",
      priceAmountMinor: 9_000,
      priceCurrency: "EUR",
      status: "ACTIVE",
    },
  ];

  readonly calendarBlocks: Array<{
    bookingId?: string;
    id: string;
    protectedEndAt: Date;
    protectedStartAt: Date;
    source?: string;
    status: string;
    visibleStartMinutes?: number;
  }>;
  readonly outboxMessages: Array<
    Parameters<PrismaBookingRepositoryClient["outboxMessage"]["createMany"]>[0]["data"][number]
  > = [];
  readonly notificationPreferences: Array<
    Parameters<
      PrismaBookingRepositoryClient["bookingNotificationPreference"]["create"]
    >[0]["data"]
  > = [];
  readonly paymentProviderEvents: Array<
    Parameters<
      PrismaBookingRepositoryClient["paymentProviderEvent"]["create"]
    >[0]["data"]
  > = [];
  readonly paymentRecords: PrismaPaymentRecordRecord[] = [];
  readonly couponRedemptions: Array<
    Parameters<PrismaBookingRepositoryClient["couponRedemption"]["create"]>[0]["data"]
  > = [];
  readonly couponEvents: Array<
    Parameters<PrismaBookingRepositoryClient["couponEvent"]["create"]>[0]["data"]
  > = [];

  constructor(input: {
    calendarBlocks?: Array<{
      id: string;
      protectedEndAt: Date;
      protectedStartAt: Date;
      status: string;
    }>;
  } = {}) {
    this.calendarBlocks = input.calendarBlocks ?? [];
  }

  readonly backpanelAuditEntry = {
    createMany: async (
      args: Parameters<
        PrismaBookingRepositoryClient["backpanelAuditEntry"]["createMany"]
      >[0],
    ) => {
      this.auditEntries.push(
        ...args.data.map((entry, index) => ({
          id: `audit-${this.auditEntries.length + index + 1}`,
          ...entry,
        })),
      );
    },
    findMany: async (
      args: Parameters<
        PrismaBookingRepositoryClient["backpanelAuditEntry"]["findMany"]
      >[0],
    ) => {
      const ids = readStringArrayFilter(args.where, "resourceId");
      const resourceType = readStringProperty(args.where, "resourceType");

      return this.auditEntries.filter((entry) => {
        if (ids.length > 0 && !ids.includes(entry.resourceId)) {
          return false;
        }

        if (resourceType && entry.resourceType !== resourceType) {
          return false;
        }

        return true;
      });
    },
  };

  readonly booking = {
    create: async (
      args: Parameters<PrismaBookingRepositoryClient["booking"]["create"]>[0],
    ) => {
      this.records.set(args.data.id, {
        ...args.data,
        externalCalendarEventId: null,
        externalCalendarSyncError: null,
        externalCalendarSyncedAt: null,
        extras: [],
      });
    },
    findMany: async () => {
      return [...this.records.values()].map((record) => this.hydrate(record.id)!);
    },
    findUnique: async (
      args: Parameters<PrismaBookingRepositoryClient["booking"]["findUnique"]>[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return id ? this.hydrate(id) : null;
    },
    update: async (
      args: Parameters<PrismaBookingRepositoryClient["booking"]["update"]>[0],
    ) => {
      const record = this.records.get(args.where.id);

      if (!record) {
        throw new Error("Booking not found.");
      }

      this.records.set(args.where.id, {
        ...record,
        ...args.data,
      });
    },
    updateMany: async (
      args: Parameters<
        PrismaBookingRepositoryClient["booking"]["updateMany"]
      >[0],
    ) => {
      const record = this.records.get(args.where.id);

      if (!record) {
        return { count: 0 };
      }

      if (args.where.status && record.status !== args.where.status) {
        return { count: 0 };
      }

      this.records.set(args.where.id, {
        ...record,
        ...args.data,
      });

      return { count: 1 };
    },
  };

  readonly bookingExtra = {
    createMany: async (
      args: Parameters<
        PrismaBookingRepositoryClient["bookingExtra"]["createMany"]
      >[0],
    ) => {
      this.bookingExtras.push(...args.data);
    },
    deleteMany: async (
      args: Parameters<
        PrismaBookingRepositoryClient["bookingExtra"]["deleteMany"]
      >[0],
    ) => {
      const remaining = this.bookingExtras.filter(
        (extra) => extra.bookingId !== args.where.bookingId,
      );
      this.bookingExtras.length = 0;
      this.bookingExtras.push(...remaining);
    },
  };

  readonly paymentRecord = {
    create: async (
      args: Parameters<
        PrismaBookingRepositoryClient["paymentRecord"]["create"]
      >[0],
    ) => {
      this.paymentRecords.push(args.data);
    },
    findFirst: async (
      args: Parameters<
        PrismaBookingRepositoryClient["paymentRecord"]["findFirst"]
      >[0],
    ) => {
      const providerSessionId = readStringProperty(
        args.where,
        "providerSessionId",
      );
      const id = readStringProperty(args.where, "id");

      if (id) {
        return (
          this.paymentRecords.find((paymentRecord) => paymentRecord.id === id) ??
          null
        );
      }

      return (
        this.paymentRecords.find(
          (paymentRecord) =>
            paymentRecord.providerSessionId === providerSessionId,
        ) ?? null
      );
    },
    update: async (
      args: Parameters<
        PrismaBookingRepositoryClient["paymentRecord"]["update"]
      >[0],
    ) => {
      const paymentRecord = this.paymentRecords.find(
        (candidate) => candidate.id === args.where.id,
      );

      if (!paymentRecord) {
        throw new Error("Payment record not found.");
      }

      Object.assign(paymentRecord, args.data);
    },
  };

  readonly bookingNotificationPreference = {
    create: async (
      args: Parameters<
        PrismaBookingRepositoryClient["bookingNotificationPreference"]["create"]
      >[0],
    ) => {
      this.notificationPreferences.push(args.data);
    },
  };

  readonly paymentProviderEvent = {
    create: async (
      args: Parameters<
        PrismaBookingRepositoryClient["paymentProviderEvent"]["create"]
      >[0],
    ) => {
      this.paymentProviderEvents.push(args.data);
    },
  };

  readonly couponRedemption = {
    create: async (
      args: Parameters<
        PrismaBookingRepositoryClient["couponRedemption"]["create"]
      >[0],
    ) => {
      this.couponRedemptions.push(args.data);
    },
  };

  readonly couponEvent = {
    create: async (
      args: Parameters<PrismaBookingRepositoryClient["couponEvent"]["create"]>[0],
    ) => {
      this.couponEvents.push(args.data);
    },
  };

  readonly outboxMessage = {
    createMany: async (
      args: Parameters<
        PrismaBookingRepositoryClient["outboxMessage"]["createMany"]
      >[0],
    ) => {
      this.outboxMessages.push(...args.data);
    },
  };

  readonly calendarBlock = {
    create: async (
      args: Parameters<
        PrismaBookingRepositoryClient["calendarBlock"]["create"]
      >[0],
    ) => {
      this.calendarBlocks.push({
        bookingId: args.data.bookingId,
        id: args.data.id,
        protectedEndAt: args.data.protectedEndAt,
        protectedStartAt: args.data.protectedStartAt,
        source: args.data.source,
        status: args.data.status,
        visibleStartMinutes: args.data.visibleStartMinutes,
      });
    },
    findMany: async (
      args: Parameters<
        PrismaBookingRepositoryClient["calendarBlock"]["findMany"]
      >[0],
    ) => {
      const criteria = readObject(args.where);
      const protectedStartFilter = readObject(criteria.protectedStartAt);
      const protectedEndFilter = readObject(criteria.protectedEndAt);

      return this.calendarBlocks.filter((block) => {
        const idFilter = readObject(criteria.id);

        if (typeof idFilter.not === "string" && block.id === idFilter.not) {
          return false;
        }

        if (criteria.status && criteria.status !== block.status) {
          return false;
        }

        if (
          protectedStartFilter.lt instanceof Date &&
          block.protectedStartAt >= protectedStartFilter.lt
        ) {
          return false;
        }

        if (
          protectedEndFilter.gt instanceof Date &&
          block.protectedEndAt <= protectedEndFilter.gt
        ) {
          return false;
        }

        return true;
      });
    },
    update: async (
      args: Parameters<
        PrismaBookingRepositoryClient["calendarBlock"]["update"]
      >[0],
    ) => {
      const block = this.calendarBlocks.find(
        (candidate) => candidate.id === args.where.id,
      );

      if (!block) {
        throw new Error("Calendar block not found.");
      }

      Object.assign(block, args.data);
    },
  };

  readonly experience = {
    findMany: async () => this.experiences,
    findUnique: async (
      args: Parameters<
        PrismaBookingRepositoryClient["experience"]["findUnique"]
      >[0],
    ) => {
      const id = readStringProperty(args.where, "id");

      return this.experiences.find((experience) => experience.id === id) ?? null;
    },
  };

  readonly extra = {
    findMany: async (
      args: Parameters<PrismaBookingRepositoryClient["extra"]["findMany"]>[0],
    ) => {
      const ids = readStringArrayFilter(args.where, "id");

      if (ids.length > 0) {
        return this.extras.filter((extra) => ids.includes(extra.id));
      }

      const status = readStringProperty(args.where, "status");

      if (status) {
        return this.extras.filter((extra) => extra.status === status);
      }

      return this.extras;
    },
  };

  async $transaction<T>(
    operation: (transaction: PrismaBookingRepositoryTransaction) => Promise<T>,
  ) {
    return operation(this);
  }

  private hydrate(id: string) {
    const record = this.records.get(id);

    if (!record) {
      return null;
    }

    return {
      ...record,
      extras: this.bookingExtras.filter((extra) => extra.bookingId === id),
    };
  }
}

function createPersistence() {
  const booking = bookingFromPrismaRecord(bookingRecord());

  return {
    auditEntries: [
      {
        action: "BOOKING_CREATED" as const,
        actorUserId: "admin-user",
        createdAt: new Date("2026-06-01T10:00:00.000Z"),
        diff: {
          after: {
            id: "booking-1",
          },
        },
        reason: null,
        resourceId: "booking-1",
        resourceType: "BOOKING" as const,
      },
    ],
    booking,
    calendarBlock: {
      bookingId: "booking-1",
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      createdByUserId: "admin-user",
      experienceId: "sunset-cruise",
      expiresAt: null,
      id: "block-booking-1",
      localDate: "2026-06-10",
      protectedEndAt: new Date("2026-06-10T12:30:00.000Z"),
      protectedStartAt: new Date("2026-06-10T07:30:00.000Z"),
      reason: "Booking JB-2026-0001",
      source: "BOOKING_CONFIRMED" as const,
      status: "ACTIVE" as const,
      timeZone: "Europe/Madrid",
      updatedAt: new Date("2026-06-01T10:00:00.000Z"),
      visibleEndMinutes: 14 * 60,
      visibleStartMinutes: 10 * 60,
    },
    extraLineIds: new Map([["champagne", "line-champagne"]]),
    outboxEvents: [
      {
        aggregateId: "booking-1",
        aggregateType: "BOOKING" as const,
        eventType: "BookingCreated" as const,
        eventVersion: 1 as const,
        occurredAt: new Date("2026-06-01T10:00:00.000Z"),
        payload: {
          bookingId: "booking-1",
        },
      },
    ],
    paymentRecord: PaymentRecord.createManualDeposit({
      amount: Money.create({ amountMinor: 10_000, currency: "EUR" }),
      bookingId: "booking-1",
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      id: "payment-1",
      paidAt: new Date("2026-06-01T10:00:00.000Z"),
    }),
  };
}

function readStringProperty(input: unknown, property: string) {
  const record = readObject(input);
  const value = record[property];

  return typeof value === "string" ? value : null;
}

function readStringArrayFilter(input: unknown, property: string) {
  const record = readObject(input);
  const nested = readObject(record[property]);
  const value = nested.in;

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readObject(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object") {
    return input as Record<string, unknown>;
  }

  return {};
}
