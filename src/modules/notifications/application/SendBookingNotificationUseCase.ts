import { applicationError } from "@/shared/application/ApplicationError";

import { notificationDeliveryToDto } from "./NotificationApplicationMappers";
import type {
  SendBookingNotificationCommand,
  SendBookingNotificationResultDto,
} from "./NotificationDtos";
import type { NotificationClock } from "./ports/NotificationClock";
import type { NotificationDeliveryRepository } from "./ports/NotificationDeliveryRepository";
import type { NotificationProvider } from "./ports/NotificationProvider";

export class SendBookingNotificationUseCase {
  constructor(
    private readonly deliveries: NotificationDeliveryRepository,
    private readonly provider: NotificationProvider,
    private readonly clock: NotificationClock,
  ) {}

  async execute(
    command: SendBookingNotificationCommand,
  ): Promise<SendBookingNotificationResultDto> {
    const delivery = await this.deliveries.findById(
      command.notificationDeliveryId,
    );

    if (!delivery) {
      throw applicationError(
        "NOTIFICATION_DELIVERY_NOT_FOUND",
        "Notification delivery was not found.",
      );
    }

    const snapshot = delivery.toSnapshot();

    if (snapshot.status === "SENT" || snapshot.status === "DELIVERED") {
      return {
        delivery: notificationDeliveryToDto(delivery),
        notificationDeliveryId: snapshot.id,
        status: snapshot.status,
      };
    }

    if (snapshot.status === "CANCELLED") {
      throw applicationError(
        "NOTIFICATION_DELIVERY_ALREADY_FINALIZED",
        "Notification delivery is already finalized.",
      );
    }

    const now = this.clock.now();

    try {
      const sendResult =
        snapshot.status === "MANUAL_REVIEW"
          ? {
              provider: `MANUAL_${snapshot.channel}`,
              providerMessageId: command.sentByUserId ?? null,
            }
          : await this.provider.send(snapshot);
      const sentDelivery = delivery.markSent({
        provider: sendResult.provider,
        providerMessageId: sendResult.providerMessageId,
        sentAt: now,
      });

      await this.deliveries.save(sentDelivery);

      return {
        delivery: notificationDeliveryToDto(sentDelivery),
        notificationDeliveryId: sentDelivery.toSnapshot().id,
        status: sentDelivery.status,
      };
    } catch (error) {
      const failedDelivery = delivery.markFailed({
        failedAt: now,
        reason:
          error instanceof Error
            ? error.message
            : "Notification provider failed.",
      });

      await this.deliveries.save(failedDelivery);

      throw applicationError(
        "NOTIFICATION_PROVIDER_FAILED",
        "Notification provider failed.",
      );
    }
  }
}
