import type { AdminBookingsWorkspaceDto } from "./AdminBookingDtos";
import { bookingToAdminDto } from "./BookingApplicationMappers";
import type { BookingRepository } from "./ports/BookingRepository";

export class GetAdminBookingsWorkspaceUseCase {
  constructor(private readonly bookings: BookingRepository) {}

  async execute(): Promise<AdminBookingsWorkspaceDto> {
    const [bookings, experienceOptions, extraOptions] = await Promise.all([
      this.bookings.list(),
      this.bookings.listExperienceOptions(),
      this.bookings.listExtraOptions(),
    ]);
    const auditEntries = await this.bookings.listAuditEntriesForBookings(
      bookings.map((booking) => booking.toSnapshot().id),
    );
    const auditEntriesByBookingId = new Map<
      string,
      typeof auditEntries
    >();

    for (const entry of auditEntries) {
      const currentEntries = auditEntriesByBookingId.get(entry.resourceId) ?? [];
      currentEntries.push(entry);
      auditEntriesByBookingId.set(entry.resourceId, currentEntries);
    }

    const bookingDtos = bookings
      .map((booking) => {
        const dto = bookingToAdminDto(booking);

        return {
          ...dto,
          auditEntries: auditEntriesByBookingId.get(dto.id) ?? [],
        };
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return {
      bookings: bookingDtos,
      experienceOptions: experienceOptions.filter(
        (experience) => experience.status !== "ARCHIVED",
      ),
      extraOptions: extraOptions.filter((extra) => extra.status === "ACTIVE"),
      summary: {
        cancelledBookings: bookingDtos.filter(
          (booking) => booking.status === "CANCELLED",
        ).length,
        confirmedBookings: bookingDtos.filter(
          (booking) => booking.status === "CONFIRMED",
        ).length,
        pendingPaymentBookings: bookingDtos.filter(
          (booking) => booking.status === "PENDING_PAYMENT",
        ).length,
        totalBookings: bookingDtos.length,
      },
    };
  }
}
