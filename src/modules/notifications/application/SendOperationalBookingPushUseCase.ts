import type { OperationalBookingPushCommand } from "./PushNotificationDtos";
import { recordPushSend } from "./SendPushTestNotificationUseCase";
import type { NotificationClock } from "./ports/NotificationClock";
import type { PushNotificationSender } from "./ports/PushNotificationSender";
import type { PushSubscriptionRepository } from "./ports/PushSubscriptionRepository";

export class SendOperationalBookingPushUseCase {
  constructor(
    private readonly subscriptions: PushSubscriptionRepository,
    private readonly sender: PushNotificationSender,
    private readonly clock: NotificationClock,
  ) {}

  async execute(command: OperationalBookingPushCommand) {
    const subscriptions = await this.subscriptions.listActive();
    const sentAt = this.clock.now();
    const message = {
      body: bookingPushBody(command),
      tag: `jimboats-booking-${command.bookingId}-${command.eventType}`,
      title: bookingPushTitle(command.eventType),
      url: `/admin/bookings/${command.bookingId}`,
    };

    let failed = 0;
    let sent = 0;

    for (const subscription of subscriptions) {
      const result = await this.sender.send(subscription, message);

      await recordPushSend({
        bookingId: command.bookingId,
        eventType: command.eventType,
        message,
        result,
        sentAt,
        subscription,
        subscriptions: this.subscriptions,
      });

      if (result.status === "SENT") {
        sent += 1;
      } else {
        failed += 1;
      }
    }

    return {
      failed,
      sent,
      total: subscriptions.length,
    };
  }
}

function bookingPushTitle(eventType: string) {
  if (eventType === "BookingCancelled") {
    return "Reserva cancelada";
  }

  if (eventType === "BookingRescheduled") {
    return "Reserva reprogramada";
  }

  return "Nueva reserva confirmada";
}

function bookingPushBody(command: OperationalBookingPushCommand) {
  const parts = [
    command.bookingReference,
    command.customerName,
    command.experienceName,
    [command.localDate, command.startTime].filter(Boolean).join(" "),
  ].filter((value): value is string => Boolean(value && value.trim()));

  return parts.join(" · ");
}
