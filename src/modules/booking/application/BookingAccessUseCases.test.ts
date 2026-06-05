import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { IssueBookingAccessLinkUseCase } from "./IssueBookingAccessLinkUseCase";
import { ViewBookingByAccessTokenUseCase } from "./ViewBookingByAccessTokenUseCase";
import type {
  BookingAccessRepository,
  BookingAccessTokenWriteModel,
  BuyerBookingAccessReadModel,
} from "./ports/BookingAccessRepository";
import type { BookingAccessTokenGenerator } from "./ports/BookingAccessTokenGenerator";
import type { BookingAccessTokenHasher } from "./ports/BookingAccessTokenHasher";
import type { BookingAccessUrlBuilder } from "./ports/BookingAccessUrlBuilder";
import type { BookingClock } from "./ports/BookingClock";

describe("Booking access use cases", () => {
  it("issues a buyer access URL while storing only the hashed token", async () => {
    const dependencies = createDependencies();
    const result = await new IssueBookingAccessLinkUseCase(
      dependencies.repository,
      dependencies.ids,
      dependencies.hasher,
      dependencies.urlBuilder,
    ).execute({
      bookingId: "booking-1",
      issuedAt: dependencies.now,
      locale: "en",
      reference: "JB-2026-0001",
    });

    expect(result.url).toBe(
      "https://jimboats.test/en/bookings/JB-2026-0001?token=raw-token",
    );
    expect(dependencies.repository.savedToken).toMatchObject({
      accessPath: "/en/bookings/JB-2026-0001",
      algorithm: "SHA256",
      bookingId: "booking-1",
      id: "access-token-booking-1",
      tokenHash: "hash:raw-token",
    });
  });

  it("views a buyer-safe booking with a valid access token", async () => {
    const dependencies = createDependencies();
    const useCase = new ViewBookingByAccessTokenUseCase(
      dependencies.repository,
      dependencies.hasher,
      dependencies.clock,
    );

    const result = await useCase.execute({
      accessToken: "raw-token",
      reference: "JB-2026-0001",
    });

    expect(result).toMatchObject({
      customer: {
        email: "buyer@example.com",
        fullName: "Buyer Guest",
      },
      experienceTitle: "Morning Breeze Charter",
      payment: {
        depositAmount: 100,
        remainingAmount: 295,
        totalAmount: 395,
      },
      reference: "JB-2026-0001",
      selectedSlot: {
        date: "2026-06-26",
        startTime: "10:00",
      },
    });
    expect(dependencies.repository.accessedToken).toEqual({
      accessedAt: dependencies.now,
      accessTokenId: "access-token-booking-1",
    });
  });

  it("rejects expired buyer access tokens", async () => {
    const dependencies = createDependencies({
      accessToken: {
        expiresAt: new Date("2026-06-04T12:00:00.000Z"),
      },
    });
    const useCase = new ViewBookingByAccessTokenUseCase(
      dependencies.repository,
      dependencies.hasher,
      dependencies.clock,
    );

    await expect(
      useCase.execute({
        accessToken: "raw-token",
        reference: "JB-2026-0001",
      }),
    ).rejects.toMatchObject({
      code: "BOOKING_ACCESS_EXPIRED",
    } satisfies Partial<ApplicationError>);
  });
});

function createDependencies(input?: {
  accessToken?: Partial<BuyerBookingAccessReadModel["accessToken"]>;
}) {
  const now = new Date("2026-06-05T12:00:00.000Z");
  const repository = new FakeBookingAccessRepository(
    createBuyerBookingAccessReadModel(input),
  );
  const hasher: BookingAccessTokenHasher = {
    algorithm: "SHA256",
    hash: (rawToken) => `hash:${rawToken}`,
  };
  const ids: BookingAccessTokenGenerator = {
    newAccessToken: () => "raw-token",
    newAccessTokenId: (tokenInput) => `access-token-${tokenInput.bookingId}`,
  };
  const urlBuilder: BookingAccessUrlBuilder = {
    build: (buildInput) => ({
      path: `/${buildInput.locale}/bookings/${buildInput.reference}`,
      url: `https://jimboats.test/${buildInput.locale}/bookings/${buildInput.reference}?token=${buildInput.rawToken}`,
    }),
  };
  const clock: BookingClock = {
    now: () => now,
  };

  return {
    clock,
    hasher,
    ids,
    now,
    repository,
    urlBuilder,
  };
}

class FakeBookingAccessRepository implements BookingAccessRepository {
  accessedToken: { accessedAt: Date; accessTokenId: string } | null = null;
  savedToken: BookingAccessTokenWriteModel | null = null;

  constructor(private readonly record: BuyerBookingAccessReadModel) {}

  async findByReferenceAndTokenHash(input: {
    reference: string;
    tokenHash: string;
  }) {
    if (
      input.reference !== this.record.booking.reference ||
      input.tokenHash !== "hash:raw-token"
    ) {
      return null;
    }

    return this.record;
  }

  async markAccessed(input: {
    accessTokenId: string;
    accessedAt: Date;
  }): Promise<void> {
    this.accessedToken = input;
  }

  async saveAccessToken(token: BookingAccessTokenWriteModel): Promise<void> {
    this.savedToken = token;
  }
}

function createBuyerBookingAccessReadModel(input?: {
  accessToken?: Partial<BuyerBookingAccessReadModel["accessToken"]>;
}): BuyerBookingAccessReadModel {
  return {
    accessToken: {
      expiresAt: new Date("2027-06-05T12:00:00.000Z"),
      id: "access-token-booking-1",
      status: "ACTIVE",
      ...input?.accessToken,
    },
    booking: {
      cancellationPolicySnapshot: null,
      cashRemainingAmountMinor: 29_500,
      cashRemainingCurrency: "EUR",
      confirmedAt: new Date("2026-06-05T12:00:00.000Z"),
      customerEmail: "buyer@example.com",
      customerLocale: "en",
      customerName: "Buyer Guest",
      customerPhone: "+34 600 000 000",
      depositAmountMinor: 10_000,
      depositCurrency: "EUR",
      experienceName: "Morning Breeze Charter",
      guestCount: 5,
      reference: "JB-2026-0001",
      selectedEndMinutes: 14 * 60,
      selectedLocalDate: "2026-06-26",
      selectedStartMinutes: 10 * 60,
      status: "CONFIRMED",
      timeZone: "Europe/Madrid",
      totalAmountMinor: 39_500,
      totalCurrency: "EUR",
    },
    extras: [],
  };
}
