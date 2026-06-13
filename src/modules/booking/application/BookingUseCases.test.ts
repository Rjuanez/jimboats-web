import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { BackpanelCancelBookingUseCase } from "./BackpanelCancelBookingUseCase";
import { BackpanelCreateBookingUseCase } from "./BackpanelCreateBookingUseCase";
import { BackpanelUpdateBookingUseCase } from "./BackpanelUpdateBookingUseCase";
import type { BookingCalendarSynchronizer } from "./BookingCalendarSyncService";
import { CreatePublicBookingCheckoutUseCase } from "./CreatePublicBookingCheckoutUseCase";
import { GetAdminBookingsWorkspaceUseCase } from "./GetAdminBookingsWorkspaceUseCase";
import { HandleDepositPaymentWebhookUseCase } from "./HandleDepositPaymentWebhookUseCase";
import type { BookingIdGenerator } from "./ports/BookingIdGenerator";
import type {
  AdminCancelledBookingPersistence,
  AdminCreatedBookingPersistence,
  AdminUpdatedBookingPersistence,
  BookingPaymentReadModel,
  BookingAuditEntryReadModel,
  BookingCalendarOverlapReadModel,
  BookingCalendarSyncState,
  BookingExperienceOptionReadModel,
  BookingExtraOptionReadModel,
  BookingRepository,
  DepositPaymentFailedPersistence,
  DepositPaymentSucceededPersistence,
  PublicPendingBookingPersistence,
} from "./ports/BookingRepository";
import type {
  DepositPaymentProvider,
  DepositPaymentWebhookEvent,
} from "./ports/DepositPaymentProvider";
import type { Booking } from "../domain/Booking";
import type { PaymentRecord } from "../domain/PaymentRecord";

describe("Booking use cases", () => {
  it("creates a confirmed backpanel booking with payment and calendar block", async () => {
    const dependencies = createDependencies();
    const calendarSync = new FakeBookingCalendarSynchronizer();
    const result = await new BackpanelCreateBookingUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
      undefined,
      calendarSync,
    ).execute(createCommand());

    expect(result).toMatchObject({
      calendarBlockId: "calendar-booking-1",
      experienceId: "sunset-cruise",
      paymentRecordId: "payment-booking-1",
      priceSnapshot: {
        depositAmount: moneyDto(10_000),
        remainingAmount: moneyDto(1_190_00),
        totalAmount: moneyDto(1_290_00),
      },
      reference: "JB-2026-0001",
      status: "CONFIRMED",
    });
    expect(dependencies.bookings.saved?.calendarBlock).toMatchObject({
      bookingId: "booking-1",
      source: "BOOKING_CONFIRMED",
      status: "ACTIVE",
      visibleStartMinutes: 10 * 60,
    });
    expect(dependencies.bookings.saved?.auditEntries).toMatchObject([
      {
        action: "BOOKING_CREATED",
        actorUserId: "admin-user",
        resourceId: "booking-1",
      },
    ]);
    expect(dependencies.bookings.saved?.outboxEvents).toMatchObject([
      {
        aggregateId: "booking-1",
        eventType: "BookingCreated",
        eventVersion: 1,
      },
    ]);
    expect(calendarSync.confirmedBookingIds).toEqual(["booking-1"]);
  });

  it("lists bookings for the admin workspace", async () => {
    const dependencies = createDependencies();
    await new BackpanelCreateBookingUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
    ).execute(createCommand());

    const workspace = await new GetAdminBookingsWorkspaceUseCase(
      dependencies.bookings,
    ).execute();

    expect(workspace.summary.confirmedBookings).toBe(1);
    expect(workspace.bookings[0]).toMatchObject({
      auditEntries: [
        {
          action: "BOOKING_CREATED",
          resourceId: "booking-1",
        },
      ],
      reference: "JB-2026-0001",
      status: "CONFIRMED",
    });
    expect(workspace.experienceOptions).toHaveLength(1);
  });

  it("updates a confirmed booking and its calendar block", async () => {
    const dependencies = createDependencies();
    const calendarSync = new FakeBookingCalendarSynchronizer();
    await new BackpanelCreateBookingUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
    ).execute(createCommand());

    const updated = await new BackpanelUpdateBookingUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
      calendarSync,
    ).execute(
      createUpdateCommand({
        customer: {
          email: "updated@example.com",
          fullName: "Updated Guest",
          notes: "Needs invoice.",
          phone: null,
          preferredLocale: "es",
        },
        endTime: "16:00",
        guestCount: 2,
        internalNotes: "Moved by staff.",
        localDate: "2026-06-12",
        selectedExtras: [],
        slotKey: "afternoon",
        startTime: "12:00",
      }),
    );

    expect(updated).toMatchObject({
      customer: {
        email: "updated@example.com",
        preferredLocale: "es",
      },
      guestCount: 2,
      priceSnapshot: {
        totalAmount: moneyDto(1_200_00),
      },
      selectedSlot: {
        localDate: "2026-06-12",
        slotKey: "afternoon",
      },
      status: "CONFIRMED",
    });
    expect(dependencies.bookings.updated?.calendarBlock).toMatchObject({
      id: "calendar-booking-1",
      visibleEndMinutes: 16 * 60,
      visibleStartMinutes: 12 * 60,
    });
    expect(dependencies.bookings.updated?.auditEntries).toMatchObject([
      {
        action: "BOOKING_UPDATED",
        actorUserId: "admin-user",
        resourceId: "booking-1",
      },
      {
        action: "BOOKING_RESCHEDULED",
        actorUserId: "admin-user",
        resourceId: "booking-1",
      },
    ]);
    expect(dependencies.bookings.updated?.outboxEvents).toMatchObject([
      {
        aggregateId: "booking-1",
        eventType: "BookingUpdated",
      },
      {
        aggregateId: "booking-1",
        eventType: "BookingRescheduled",
      },
    ]);
    expect(calendarSync.confirmedBookingIds).toEqual(["booking-1"]);
  });

  it("ignores the current booking calendar block when rescheduling", async () => {
    const dependencies = createDependencies();
    await new BackpanelCreateBookingUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
    ).execute(createCommand());
    dependencies.bookings.setOverlaps([
      {
        id: "calendar-booking-1",
        protectedEndAt: new Date("2026-06-10T12:30:00.000Z"),
        protectedStartAt: new Date("2026-06-10T07:30:00.000Z"),
      },
    ]);

    await expect(
      new BackpanelUpdateBookingUseCase(
        dependencies.bookings,
        dependencies.ids,
        dependencies.clock,
      ).execute(createUpdateCommand()),
    ).resolves.toMatchObject({
      id: "booking-1",
    });
  });

  it("rejects reschedules that overlap another active block", async () => {
    const dependencies = createDependencies();
    await new BackpanelCreateBookingUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
    ).execute(createCommand());
    dependencies.bookings.setOverlaps([
      {
        id: "manual-block",
        protectedEndAt: new Date("2026-06-10T12:30:00.000Z"),
        protectedStartAt: new Date("2026-06-10T07:30:00.000Z"),
      },
    ]);

    await expect(
      new BackpanelUpdateBookingUseCase(
        dependencies.bookings,
        dependencies.ids,
        dependencies.clock,
      ).execute(createUpdateCommand()),
    ).rejects.toMatchObject({
      code: "CALENDAR_BLOCK_OVERLAP",
    } satisfies Partial<ApplicationError>);
  });

  it("cancels a confirmed booking and releases its calendar block", async () => {
    const dependencies = createDependencies();
    const calendarSync = new FakeBookingCalendarSynchronizer();
    await new BackpanelCreateBookingUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
    ).execute(createCommand());

    const cancelled = await new BackpanelCancelBookingUseCase(
      dependencies.bookings,
      dependencies.clock,
      calendarSync,
    ).execute({
      bookingId: "booking-1",
      cancelledByUserId: "admin-user",
    });

    expect(cancelled).toMatchObject({
      id: "booking-1",
      status: "CANCELLED",
    });
    expect(dependencies.bookings.cancelled).toMatchObject({
      calendarBlockId: "calendar-booking-1",
    });
    expect(dependencies.bookings.cancelled?.auditEntries).toMatchObject([
      {
        action: "BOOKING_CANCELLED",
        actorUserId: "admin-user",
        resourceId: "booking-1",
      },
    ]);
    expect(dependencies.bookings.cancelled?.outboxEvents).toMatchObject([
      {
        aggregateId: "booking-1",
        eventType: "BookingCancelled",
      },
    ]);
    expect(calendarSync.cancelledBookingIds).toEqual(["booking-1"]);
  });

  it("rejects overlapping bookings", async () => {
    const dependencies = createDependencies({
      overlaps: [
        {
          id: "manual-block",
          protectedEndAt: new Date("2026-06-10T13:00:00.000Z"),
          protectedStartAt: new Date("2026-06-10T07:00:00.000Z"),
        },
      ],
    });

    await expect(
      new BackpanelCreateBookingUseCase(
        dependencies.bookings,
        dependencies.ids,
        dependencies.clock,
      ).execute(createCommand()),
    ).rejects.toMatchObject({
      code: "CALENDAR_BLOCK_OVERLAP",
    } satisfies Partial<ApplicationError>);
  });

  it("creates a booking next to existing buffered blocks without double counting buffer", async () => {
    const dependencies = createDependencies({
      overlaps: [
        {
          id: "previous-booking",
          protectedEndAt: new Date("2026-06-10T08:00:00.000Z"),
          protectedStartAt: new Date("2026-06-10T03:00:00.000Z"),
        },
        {
          id: "next-booking",
          protectedEndAt: new Date("2026-06-10T17:00:00.000Z"),
          protectedStartAt: new Date("2026-06-10T12:00:00.000Z"),
        },
      ],
    });

    await expect(
      new BackpanelCreateBookingUseCase(
        dependencies.bookings,
        dependencies.ids,
        dependencies.clock,
      ).execute(createCommand()),
    ).resolves.toMatchObject({
      id: "booking-1",
    });
  });

  it("rejects extras that exceed configured quantity", async () => {
    const dependencies = createDependencies();

    await expect(
      new BackpanelCreateBookingUseCase(
        dependencies.bookings,
        dependencies.ids,
        dependencies.clock,
      ).execute(
        createCommand({
          selectedExtras: [{ extraId: "champagne", quantity: 2 }],
        }),
      ),
    ).rejects.toMatchObject({
      code: "BOOKING_EXTRA_QUANTITY_NOT_ALLOWED",
    } satisfies Partial<ApplicationError>);
  });

  it("rejects guest count above effective capacity", async () => {
    const dependencies = createDependencies();

    await expect(
      new BackpanelCreateBookingUseCase(
        dependencies.bookings,
        dependencies.ids,
        dependencies.clock,
      ).execute(createCommand({ guestCount: 11 })),
    ).rejects.toMatchObject({
      code: "BOOKING_GUEST_CAPACITY_EXCEEDED",
    } satisfies Partial<ApplicationError>);
  });

  it("creates a public checkout hold with Stripe payment session", async () => {
    const dependencies = createDependencies();
    const result = await new CreatePublicBookingCheckoutUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
      dependencies.paymentProvider,
    ).execute(createPublicCheckoutCommand());

    expect(result).toMatchObject({
      bookingId: "booking-1",
      checkoutClientSecret: "cs_test_embedded_secret",
      paymentProviderSessionId: "cs_test_123",
      reference: "JB-2026-0001",
    });
    expect(dependencies.bookings.publicPending?.booking.toSnapshot()).toMatchObject({
      holdExpiresAt: "2026-06-01T10:30:00.000Z",
      source: "PUBLIC_CHECKOUT",
      status: "PENDING_PAYMENT",
    });
    expect(
      dependencies.bookings.publicPending?.calendarBlock,
    ).toMatchObject({
      expiresAt: new Date("2026-06-01T10:30:00.000Z"),
      source: "BOOKING_HOLD",
      status: "ACTIVE",
    });
    expect(
      dependencies.bookings.publicPending?.notificationPreferences.toSnapshot(),
    ).toMatchObject({
      consentSource: "CHECKOUT",
      email: {
        consentStatus: "GRANTED",
        destination: "sailor@example.com",
      },
      whatsapp: {
        consentStatus: "GRANTED",
        destination: "+34 600 000 000",
      },
    });
  });

  it("creates a public checkout hold next to existing buffered blocks", async () => {
    const dependencies = createDependencies({
      overlaps: [
        {
          id: "previous-booking",
          protectedEndAt: new Date("2026-06-10T08:00:00.000Z"),
          protectedStartAt: new Date("2026-06-10T03:00:00.000Z"),
        },
        {
          id: "next-booking",
          protectedEndAt: new Date("2026-06-10T17:00:00.000Z"),
          protectedStartAt: new Date("2026-06-10T12:00:00.000Z"),
        },
      ],
    });

    await expect(
      new CreatePublicBookingCheckoutUseCase(
        dependencies.bookings,
        dependencies.ids,
        dependencies.clock,
        dependencies.paymentProvider,
      ).execute(createPublicCheckoutCommand()),
    ).resolves.toMatchObject({
      bookingId: "booking-1",
    });
  });

  it("confirms a public booking from a paid Stripe checkout webhook", async () => {
    const dependencies = createDependencies();
    const calendarSync = new FakeBookingCalendarSynchronizer();
    await new CreatePublicBookingCheckoutUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
      dependencies.paymentProvider,
    ).execute(createPublicCheckoutCommand());

    const result = await new HandleDepositPaymentWebhookUseCase(
      dependencies.bookings,
      dependencies.clock,
      dependencies.paymentProvider,
      calendarSync,
    ).execute({
      rawBody: "paid",
      signature: "stripe-signature",
    });

    expect(result).toMatchObject({
      action: "PROCESSED",
      bookingId: "booking-1",
      eventType: "checkout.session.completed",
    });
    expect(dependencies.bookings.depositSucceeded?.booking.toSnapshot()).toMatchObject({
      confirmedAt: "2026-06-01T10:02:00.000Z",
      status: "CONFIRMED",
    });
    expect(
      dependencies.bookings.depositSucceeded?.paymentRecord.toSnapshot(),
    ).toMatchObject({
      paidAt: "2026-06-01T10:02:00.000Z",
      providerPaymentIntentId: "pi_test_123",
      status: "SUCCEEDED",
    });
    expect(dependencies.bookings.depositSucceeded?.outboxEvents).toMatchObject([
      {
        aggregateId: "booking-1",
        eventType: "BookingCreated",
      },
    ]);
    expect(calendarSync.confirmedBookingIds).toEqual(["booking-1"]);
  });

  it("does not confirm a public booking when Stripe reports a wrong amount", async () => {
    const dependencies = createDependencies();
    dependencies.paymentProvider.nextEvent = stripeCompletedEvent({
      amountTotalMinor: 9_999,
      eventId: "evt_wrong_amount",
    });
    await new CreatePublicBookingCheckoutUseCase(
      dependencies.bookings,
      dependencies.ids,
      dependencies.clock,
      dependencies.paymentProvider,
    ).execute(createPublicCheckoutCommand());

    const result = await new HandleDepositPaymentWebhookUseCase(
      dependencies.bookings,
      dependencies.clock,
      dependencies.paymentProvider,
    ).execute({
      rawBody: "paid-wrong-amount",
      signature: "stripe-signature",
    });

    expect(result).toMatchObject({
      action: "PROCESSED",
      bookingId: "booking-1",
    });
    expect(dependencies.bookings.depositFailed?.booking.toSnapshot()).toMatchObject({
      status: "PAYMENT_FAILED",
    });
    expect(
      dependencies.bookings.depositFailed?.paymentRecord.toSnapshot(),
    ).toMatchObject({
      failureReason:
        "Stripe checkout completed with an unexpected deposit amount.",
      status: "FAILED",
    });
  });
});

function createDependencies(input: {
  overlaps?: BookingCalendarOverlapReadModel[];
} = {}) {
  return {
    bookings: new InMemoryBookingRepository(input.overlaps ?? []),
    clock: {
      now: () => new Date("2026-06-01T10:00:00.000Z"),
    },
    ids: {
      newBookingExtraLineId: ({ extraId }) => `line-${extraId}`,
      newBookingId: () => "booking-1",
      newBookingReference: () => "JB-2026-0001",
      newCalendarBlockId: () => "calendar-booking-1",
      newPaymentRecordId: () => "payment-booking-1",
    } satisfies BookingIdGenerator,
    paymentProvider: new FakeDepositPaymentProvider(),
  };
}

function createCommand(
  patch: Partial<Parameters<BackpanelCreateBookingUseCase["execute"]>[0]> = {},
) {
  return {
    createdByUserId: "admin-user",
    customer: {
      email: "sailor@example.com",
      fullName: "Sailor Guest",
      notes: "",
      phone: "+34 600 000 000",
      preferredLocale: "en",
    },
    endTime: "14:00",
    experienceId: "sunset-cruise",
    guestCount: 4,
    internalNotes: "WhatsApp booking",
    localDate: "2026-06-10",
    selectedExtras: [{ extraId: "champagne", quantity: 1 }],
    slotKey: "morning",
    startTime: "10:00",
    ...patch,
  };
}

function createUpdateCommand(
  patch: Partial<Parameters<BackpanelUpdateBookingUseCase["execute"]>[0]> = {},
) {
  return {
    bookingId: "booking-1",
    customer: {
      email: "sailor@example.com",
      fullName: "Sailor Guest",
      notes: "",
      phone: "+34 600 000 000",
      preferredLocale: "en",
    },
    endTime: "14:00",
    guestCount: 4,
    internalNotes: "WhatsApp booking",
    localDate: "2026-06-10",
    selectedExtras: [{ extraId: "champagne", quantity: 1 }],
    slotKey: "morning",
    startTime: "10:00",
    updatedByUserId: "admin-user",
    ...patch,
  };
}

function createPublicCheckoutCommand(
  patch: Partial<Parameters<CreatePublicBookingCheckoutUseCase["execute"]>[0]> = {},
) {
  return {
    consents: {
      marketing: true,
      ticketEmail: true,
      ticketWhatsapp: true,
    },
    customer: {
      email: "sailor@example.com",
      fullName: "Sailor Guest",
      phone: "+34 600 000 000",
      preferredLocale: "en",
    },
    endTime: "14:00",
    experienceId: "sunset-cruise",
    guestCount: 4,
    localDate: "2026-06-10",
    selectedExtras: [{ extraId: "champagne", quantity: 1 }],
    slotKey: "morning",
    startTime: "10:00",
    returnUrl: "http://localhost:3000/en/book/success?session_id={CHECKOUT_SESSION_ID}",
    ...patch,
  };
}

class InMemoryBookingRepository implements BookingRepository {
  private readonly auditEntries: BookingAuditEntryReadModel[] = [];
  private readonly bookings = new Map<string, Booking>();
  private readonly calendarSyncStates = new Map<string, BookingCalendarSyncState>();
  private readonly paymentRecords = new Map<string, PaymentRecord>();
  private readonly processedProviderEventIds = new Set<string>();
  cancelled: AdminCancelledBookingPersistence | null = null;
  depositFailed: DepositPaymentFailedPersistence | null = null;
  depositSucceeded: DepositPaymentSucceededPersistence | null = null;
  publicPending: PublicPendingBookingPersistence | null = null;
  saved: AdminCreatedBookingPersistence | null = null;
  updated: AdminUpdatedBookingPersistence | null = null;

  constructor(private overlaps: BookingCalendarOverlapReadModel[]) {}

  setOverlaps(overlaps: BookingCalendarOverlapReadModel[]) {
    this.overlaps = overlaps;
  }

  async findActiveCalendarOverlaps(
    startAt: Date,
    endAt: Date,
    input: { excludeBlockId?: string } = {},
  ) {
    return this.overlaps.filter(
      (block) =>
        block.id !== input.excludeBlockId &&
        block.protectedEndAt > startAt &&
        block.protectedStartAt < endAt,
    );
  }

  async findById(id: string) {
    return this.bookings.get(id) ?? null;
  }

  async findCalendarSyncState(id: string) {
    return this.calendarSyncStates.get(id) ?? defaultCalendarSyncState();
  }

  async findBookingsPendingCalendarSync(input: { limit: number }) {
    return [...this.bookings.values()]
      .filter((booking) => {
        const state =
          this.calendarSyncStates.get(booking.id) ?? defaultCalendarSyncState();

        return (
          booking.status === "CONFIRMED" &&
          (!state.externalEventId || state.syncError)
        );
      })
      .slice(0, input.limit);
  }

  async findByPaymentProviderSessionId(
    providerSessionId: string,
  ): Promise<BookingPaymentReadModel | null> {
    const paymentRecord = [...this.paymentRecords.values()].find(
      (record) => record.toSnapshot().providerSessionId === providerSessionId,
    );

    if (!paymentRecord) {
      return null;
    }

    const booking = this.bookings.get(paymentRecord.toSnapshot().bookingId);

    return booking ? { booking, paymentRecord } : null;
  }

  async findExperienceOptionById(id: string) {
    return this.experiences().find((experience) => experience.id === id) ?? null;
  }

  async findExtraOptionsByIds(ids: string[]) {
    const requestedIds = new Set(ids);

    return this.extras().filter((extra) => requestedIds.has(extra.id));
  }

  async list() {
    return [...this.bookings.values()];
  }

  async listAuditEntriesForBookings(bookingIds: string[]) {
    const requestedIds = new Set(bookingIds);

    return this.auditEntries.filter((entry) => requestedIds.has(entry.resourceId));
  }

  async listExperienceOptions() {
    return this.experiences();
  }

  async listExtraOptions() {
    return this.extras();
  }

  async saveAdminCreatedBooking(input: AdminCreatedBookingPersistence) {
    this.saved = input;
    this.auditEntries.push(...input.auditEntries.map(toAuditReadModel));
    this.bookings.set(input.booking.id, input.booking);
    this.calendarSyncStates.set(input.booking.id, defaultCalendarSyncState());
    this.paymentRecords.set(input.paymentRecord.id, input.paymentRecord);
  }

  async saveAdminUpdatedBooking(input: AdminUpdatedBookingPersistence) {
    this.updated = input;
    this.auditEntries.push(...input.auditEntries.map(toAuditReadModel));
    this.bookings.set(input.booking.id, input.booking);
    this.ensureCalendarSyncState(input.booking.id);
  }

  async saveAdminCancelledBooking(input: AdminCancelledBookingPersistence) {
    this.cancelled = input;
    this.auditEntries.push(...input.auditEntries.map(toAuditReadModel));
    this.bookings.set(input.booking.id, input.booking);
    this.ensureCalendarSyncState(input.booking.id);
  }

  async savePublicPendingBooking(input: PublicPendingBookingPersistence) {
    this.publicPending = input;
    this.bookings.set(input.booking.id, input.booking);
    this.calendarSyncStates.set(input.booking.id, defaultCalendarSyncState());
    this.paymentRecords.set(input.paymentRecord.id, input.paymentRecord);
  }

  async saveDepositPaymentSucceeded(
    input: DepositPaymentSucceededPersistence,
  ) {
    if (this.processedProviderEventIds.has(input.providerEvent.providerEventId)) {
      return "DUPLICATE" as const;
    }

    this.processedProviderEventIds.add(input.providerEvent.providerEventId);
    this.depositSucceeded = input;
    this.auditEntries.push(...input.auditEntries.map(toAuditReadModel));
    this.bookings.set(input.booking.id, input.booking);
    this.ensureCalendarSyncState(input.booking.id);
    this.paymentRecords.set(input.paymentRecord.id, input.paymentRecord);

    return "PROCESSED" as const;
  }

  async saveDepositPaymentFailed(input: DepositPaymentFailedPersistence) {
    if (this.processedProviderEventIds.has(input.providerEvent.providerEventId)) {
      return "DUPLICATE" as const;
    }

    this.processedProviderEventIds.add(input.providerEvent.providerEventId);
    this.depositFailed = input;
    this.bookings.set(input.booking.id, input.booking);
    this.ensureCalendarSyncState(input.booking.id);
    this.paymentRecords.set(input.paymentRecord.id, input.paymentRecord);

    return "PROCESSED" as const;
  }

  async markCalendarSyncFailed(input: {
    bookingId: string;
    syncError: string;
  }) {
    const current =
      this.calendarSyncStates.get(input.bookingId) ?? defaultCalendarSyncState();

    this.calendarSyncStates.set(input.bookingId, {
      ...current,
      syncError: input.syncError,
    });
  }

  async markCalendarSynced(input: {
    bookingId: string;
    externalEventId: string;
    syncedAt: Date;
  }) {
    this.calendarSyncStates.set(input.bookingId, {
      externalEventId: input.externalEventId,
      syncError: null,
      syncedAt: input.syncedAt,
    });
  }

  private ensureCalendarSyncState(bookingId: string) {
    if (!this.calendarSyncStates.has(bookingId)) {
      this.calendarSyncStates.set(bookingId, defaultCalendarSyncState());
    }
  }

  private experiences(): BookingExperienceOptionReadModel[] {
    return [
      {
        allowsManualScheduling: true,
        basePrice: moneyDto(1_200_00),
        bufferMinutes: 30,
        capacity: 10,
        depositAmount: moneyDto(10_000),
        durationMinutes: 4 * 60,
        extraSelectionRules: [
          {
            capacityReduction: 2,
            enabled: true,
            extraId: "champagne",
            limitPerBooking: 1,
            noticeMinutes: 24 * 60,
            priceOverride: null,
          },
        ],
        id: "sunset-cruise",
        internalName: "Sunset Cruise",
        maximumAdvanceMonths: 6,
        minimumAdvanceMinutes: 60,
        slotPolicy: {
          fixedSlots: [
            {
              enabled: true,
              endMinutes: 16 * 60,
              id: "afternoon",
              label: "Afternoon",
              startMinutes: 12 * 60,
            },
            {
              enabled: true,
              endMinutes: 14 * 60,
              id: "morning",
              label: "Morning",
              startMinutes: 10 * 60,
            },
          ],
          mode: "FIXED_SLOTS",
          timeZone: "Europe/Madrid",
        },
        status: "PUBLISHED",
      },
    ];
  }

  private extras(): BookingExtraOptionReadModel[] {
    return [
      {
        id: "champagne",
        name: "Premium champagne",
        price: moneyDto(9_000),
        status: "ACTIVE",
      },
    ];
  }
}

class FakeDepositPaymentProvider implements DepositPaymentProvider {
  nextEvent: DepositPaymentWebhookEvent = stripeCompletedEvent();

  async createCheckoutSession() {
    return {
      clientSecret: "cs_test_embedded_secret",
      providerSessionId: "cs_test_123",
    };
  }

  async parseWebhook() {
    return this.nextEvent;
  }
}

class FakeBookingCalendarSynchronizer implements BookingCalendarSynchronizer {
  cancelledBookingIds: string[] = [];
  confirmedBookingIds: string[] = [];

  async syncCancelledBooking(booking: Booking) {
    this.cancelledBookingIds.push(booking.id);
  }

  async syncConfirmedBooking(booking: Booking) {
    this.confirmedBookingIds.push(booking.id);
  }
}

function stripeCompletedEvent(
  patch: Partial<
    Extract<
      DepositPaymentWebhookEvent,
      { eventType: "checkout.session.completed" }
    >
  > = {},
): DepositPaymentWebhookEvent {
  return {
    amountTotalMinor: 10_000,
    bookingId: "booking-1",
    currency: "eur",
    eventId: "evt_paid",
    eventType: "checkout.session.completed",
    occurredAt: new Date("2026-06-01T10:02:00.000Z"),
    paymentRecordId: "payment-booking-1",
    provider: "STRIPE",
    providerPaymentIntentId: "pi_test_123",
    providerSessionId: "cs_test_123",
    rawPayload: {
      id: "evt_paid",
      type: "checkout.session.completed",
    },
    ...patch,
  };
}

function toAuditReadModel(
  entry: AdminCreatedBookingPersistence["auditEntries"][number],
): BookingAuditEntryReadModel {
  return {
    action: entry.action,
    actorUserId: entry.actorUserId,
    createdAt: entry.createdAt,
    diff: entry.diff,
    id: `audit-${entry.resourceId}-${entry.action}`,
    reason: entry.reason,
    resourceId: entry.resourceId,
    resourceType: entry.resourceType,
  };
}

function defaultCalendarSyncState(): BookingCalendarSyncState {
  return {
    externalEventId: null,
    syncError: null,
    syncedAt: null,
  };
}

function moneyDto(amountMinor: number) {
  return {
    amountMinor,
    currency: "EUR" as const,
  };
}
