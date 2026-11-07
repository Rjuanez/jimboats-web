import { ApplicationError } from "@/shared/application/ApplicationError";
import { requireHourlyRate } from "../domain/HourlyRate";
import type {
  BookingRepository,
  BookingPaymentReadModel,
} from "./ports/BookingRepository";
import type { GetPublicBookingPageUseCase } from "./GetPublicBookingPageUseCase";
import type { CreatePublicBookingCheckoutUseCase } from "./CreatePublicBookingCheckoutUseCase";
import type { HandleDepositPaymentWebhookUseCase } from "./HandleDepositPaymentWebhookUseCase";
import type {
  CreatePublicBookingCheckoutCommand,
  HandleDepositPaymentWebhookCommand,
} from "./PublicCheckoutDtos";
import { minutesToClockTime } from "./BookingApplicationMappers";

export type HourlySelection = {
  experienceId: string;
  hours: number;
  localDate: string;
};
export type HourlyCheckoutCommand = HourlySelection &
  Omit<
    CreatePublicBookingCheckoutCommand,
    "endTime" | "slotKey" | "selectedExtras"
  >;
export type HourlyQuoteDto = {
  totalMinor: number;
  depositMinor: number;
  remainingMinor: number;
  capacity: number;
  slots: { startTime: string; endTime: string; slotKey: string | null }[];
};
export type LocalPaymentSimulator = {
  createSimulationEvent(
    payment: BookingPaymentReadModel,
  ): HandleDepositPaymentWebhookCommand;
};

export class HourlyBookingUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly availability: GetPublicBookingPageUseCase,
    private readonly checkout: CreatePublicBookingCheckoutUseCase,
    private readonly webhook: HandleDepositPaymentWebhookUseCase,
    private readonly simulator?: LocalPaymentSimulator,
  ) {}

  async quote(input: HourlySelection): Promise<HourlyQuoteDto> {
    const experience = await this.bookings.findExperienceOptionById(
      input.experienceId,
    );
    if (!experience || experience.status !== "PUBLISHED") {
      throw new ApplicationError(
        "BOOKING_EXPERIENCE_NOT_BOOKABLE",
        "Experience unavailable.",
      );
    }
    const rate = requireHourlyRate(experience.hourlyRates, input.hours);
    const availability = await this.availability.executeAvailability({
      experienceId: input.experienceId,
      hours: input.hours,
      localDate: input.localDate,
      locale: "en",
    });
    return {
      totalMinor: rate.total.amountMinor,
      depositMinor: rate.deposit.amountMinor,
      remainingMinor: rate.total.amountMinor - rate.deposit.amountMinor,
      capacity: experience.capacity,
      slots: (availability?.timeSlotsByDate[input.localDate] ?? [])
        .filter((slot) => slot.available)
        .map((slot) => ({
          startTime: minutesToClockTime(slot.startMinutes),
          endTime: minutesToClockTime(slot.endMinutes),
          slotKey: slot.slotKey,
        })),
    };
  }

  async create(input: HourlyCheckoutCommand) {
    const quote = await this.quote(input);
    const slot = quote.slots.find((item) => item.startTime === input.startTime);
    if (!slot)
      throw new ApplicationError(
        "CALENDAR_BLOCK_OVERLAP",
        "This departure time is no longer available.",
      );
    // Client supplies neither prices nor an end time. Recheck in the existing checkout engine.
    return this.checkout.execute({
      ...input,
      endTime: slot.endTime,
      slotKey: slot.slotKey,
      selectedExtras: [],
    });
  }

  async simulatePayment(providerSessionId: string) {
    if (!this.simulator)
      throw new ApplicationError(
        "SIMULATION_DISABLED",
        "Payment simulation is disabled.",
      );
    const payment =
      await this.bookings.findByPaymentProviderSessionId(providerSessionId);
    if (!payment)
      throw new ApplicationError("BOOKING_NOT_FOUND", "Booking not found.");
    return this.webhook.execute(this.simulator.createSimulationEvent(payment));
  }
}
