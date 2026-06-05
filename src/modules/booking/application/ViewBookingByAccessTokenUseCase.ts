import { applicationError } from "@/shared/application/ApplicationError";

import type {
  BuyerBookingDto,
  ViewBookingByAccessTokenQuery,
} from "./BookingAccessDtos";
import type { BookingAccessRepository } from "./ports/BookingAccessRepository";
import type { BookingAccessTokenHasher } from "./ports/BookingAccessTokenHasher";
import type { BookingClock } from "./ports/BookingClock";

export class ViewBookingByAccessTokenUseCase {
  constructor(
    private readonly accessTokens: BookingAccessRepository,
    private readonly hasher: BookingAccessTokenHasher,
    private readonly clock: BookingClock,
  ) {}

  async execute(query: ViewBookingByAccessTokenQuery): Promise<BuyerBookingDto> {
    const rawToken = query.accessToken.trim();
    const reference = query.reference.trim().toUpperCase();

    if (!rawToken || !reference) {
      throw applicationError(
        "BOOKING_ACCESS_INVALID",
        "Booking access link is invalid.",
      );
    }

    const record = await this.accessTokens.findByReferenceAndTokenHash({
      reference,
      tokenHash: this.hasher.hash(rawToken),
    });

    if (!record || record.accessToken.status !== "ACTIVE") {
      throw applicationError(
        "BOOKING_ACCESS_INVALID",
        "Booking access link is invalid.",
      );
    }

    const now = this.clock.now();

    if (record.accessToken.expiresAt && record.accessToken.expiresAt <= now) {
      throw applicationError(
        "BOOKING_ACCESS_EXPIRED",
        "Booking access link has expired.",
      );
    }

    await this.accessTokens.markAccessed({
      accessTokenId: record.accessToken.id,
      accessedAt: now,
    });

    return {
      cancellationPolicy: record.booking.cancellationPolicySnapshot,
      customer: {
        email: record.booking.customerEmail,
        fullName: record.booking.customerName,
        phone: record.booking.customerPhone,
      },
      experienceTitle: record.booking.experienceName,
      extras: record.extras.map((extra) => ({
        name: extra.name,
        quantity: extra.quantity,
        totalAmount: fromMinor(extra.totalAmountMinor),
      })),
      guestCount: record.booking.guestCount,
      payment: {
        depositAmount: fromMinor(record.booking.depositAmountMinor),
        remainingAmount: fromMinor(record.booking.cashRemainingAmountMinor),
        totalAmount: fromMinor(record.booking.totalAmountMinor),
      },
      reference: record.booking.reference,
      selectedSlot: {
        date: record.booking.selectedLocalDate,
        endTime: formatMinutes(record.booking.selectedEndMinutes),
        startTime: formatMinutes(record.booking.selectedStartMinutes),
        timeZone: record.booking.timeZone,
      },
      status: record.booking.status,
    };
  }
}

function fromMinor(amountMinor: number) {
  return amountMinor / 100;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}
