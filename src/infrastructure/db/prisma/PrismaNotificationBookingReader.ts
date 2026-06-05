import type { NotificationBookingReader } from "@/modules/notifications/application/ports/NotificationBookingReader";

import {
  notificationBookingReadModelFromPrismaRecord,
  type PrismaNotificationBookingRecord,
} from "./PrismaNotificationMappers";

type BookingFindArgs = {
  include?: unknown;
  where?: unknown;
};

type BookingDelegate = {
  findUnique(args: BookingFindArgs): Promise<PrismaNotificationBookingRecord | null>;
};

export type PrismaNotificationBookingReaderClient = {
  booking: BookingDelegate;
};

const notificationBookingInclude = {
  notificationPreference: true,
};

export class PrismaNotificationBookingReader implements NotificationBookingReader {
  constructor(private readonly prisma: PrismaNotificationBookingReaderClient) {}

  async findNotificationBookingById(bookingId: string) {
    const record = await this.prisma.booking.findUnique({
      include: notificationBookingInclude,
      where: {
        id: bookingId,
      },
    });

    return record ? notificationBookingReadModelFromPrismaRecord(record) : null;
  }
}

export type { PrismaNotificationBookingRecord };
