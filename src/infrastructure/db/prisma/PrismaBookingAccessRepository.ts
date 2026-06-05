import type {
  BookingAccessRepository,
  BookingAccessTokenWriteModel,
  BuyerBookingAccessReadModel,
} from "@/modules/booking/application/ports/BookingAccessRepository";
import type { BookingCancellationPolicySnapshot } from "@/modules/booking/domain/CancellationPolicy";

import { utcDateToLocalDateString } from "@/modules/boat-calendar/application/CalendarDateTime";

type BookingAccessTokenCreateArgs = {
  data: BookingAccessTokenWriteModel;
};

type BookingAccessTokenFindUniqueArgs = {
  include?: unknown;
  where: {
    tokenHash: string;
  };
};

type BookingAccessTokenUpdateArgs = {
  data: {
    lastAccessAt: Date;
  };
  where: {
    id: string;
  };
};

type PrismaBookingAccessTokenRecord = {
  expiresAt: Date | null;
  id: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  booking: {
    cancellationPolicySnapshot: unknown;
    cashRemainingAmountMinor: number;
    cashRemainingCurrency: string;
    confirmedAt: Date | null;
    customerEmail: string;
    customerLocale: string;
    customerName: string;
    customerPhone: string | null;
    depositAmountMinor: number;
    depositCurrency: string;
    experienceNameSnapshot: string;
    extras: Array<{
      nameSnapshot: string;
      quantity: number;
      totalAmountMinor: number;
      totalCurrency: string;
    }>;
    guestCount: number;
    reference: string;
    selectedEndMinutes: number;
    selectedLocalDate: Date;
    selectedStartMinutes: number;
    status:
      | "CANCELLED"
      | "CONFIRMED"
      | "EXPIRED"
      | "PAYMENT_FAILED"
      | "PENDING_PAYMENT";
    timeZone: string;
    totalAmountMinor: number;
    totalCurrency: string;
  };
};

type BookingAccessTokenDelegate = {
  create(args: BookingAccessTokenCreateArgs): Promise<unknown>;
  findUnique(
    args: BookingAccessTokenFindUniqueArgs,
  ): Promise<PrismaBookingAccessTokenRecord | null>;
  update(args: BookingAccessTokenUpdateArgs): Promise<unknown>;
};

export type PrismaBookingAccessRepositoryClient = {
  bookingAccessToken: BookingAccessTokenDelegate;
};

const bookingAccessInclude = {
  booking: {
    include: {
      extras: {
        orderBy: {
          nameSnapshot: "asc",
        },
      },
    },
  },
};

export class PrismaBookingAccessRepository implements BookingAccessRepository {
  constructor(private readonly prisma: PrismaBookingAccessRepositoryClient) {}

  async findByReferenceAndTokenHash(input: {
    reference: string;
    tokenHash: string;
  }): Promise<BuyerBookingAccessReadModel | null> {
    const record = await this.prisma.bookingAccessToken.findUnique({
      include: bookingAccessInclude,
      where: {
        tokenHash: input.tokenHash,
      },
    });

    if (!record || record.booking.reference !== input.reference) {
      return null;
    }

    return {
      accessToken: {
        expiresAt: record.expiresAt,
        id: record.id,
        status: record.status,
      },
      booking: {
        cancellationPolicySnapshot:
          bookingCancellationPolicySnapshotFromJson(
            record.booking.cancellationPolicySnapshot,
          ),
        cashRemainingAmountMinor: record.booking.cashRemainingAmountMinor,
        cashRemainingCurrency: record.booking.cashRemainingCurrency,
        confirmedAt: record.booking.confirmedAt,
        customerEmail: record.booking.customerEmail,
        customerLocale: record.booking.customerLocale,
        customerName: record.booking.customerName,
        customerPhone: record.booking.customerPhone,
        depositAmountMinor: record.booking.depositAmountMinor,
        depositCurrency: record.booking.depositCurrency,
        experienceName: record.booking.experienceNameSnapshot,
        guestCount: record.booking.guestCount,
        reference: record.booking.reference,
        selectedEndMinutes: record.booking.selectedEndMinutes,
        selectedLocalDate: utcDateToLocalDateString(
          record.booking.selectedLocalDate,
        ),
        selectedStartMinutes: record.booking.selectedStartMinutes,
        status: record.booking.status,
        timeZone: record.booking.timeZone,
        totalAmountMinor: record.booking.totalAmountMinor,
        totalCurrency: record.booking.totalCurrency,
      },
      extras: record.booking.extras.map((extra) => ({
        name: extra.nameSnapshot,
        quantity: extra.quantity,
        totalAmountMinor: extra.totalAmountMinor,
        totalCurrency: extra.totalCurrency,
      })),
    };
  }

  async markAccessed(input: {
    accessTokenId: string;
    accessedAt: Date;
  }): Promise<void> {
    await this.prisma.bookingAccessToken.update({
      data: {
        lastAccessAt: input.accessedAt,
      },
      where: {
        id: input.accessTokenId,
      },
    });
  }

  async saveAccessToken(token: BookingAccessTokenWriteModel): Promise<void> {
    await this.prisma.bookingAccessToken.create({
      data: token,
    });
  }
}

function bookingCancellationPolicySnapshotFromJson(
  value: unknown,
): BookingCancellationPolicySnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as BookingCancellationPolicySnapshot;
}
