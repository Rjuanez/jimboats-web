import type { ProcessNextNotificationWorkResultDto } from "./NotificationDtos";
import { SendBookingNotificationUseCase } from "./SendBookingNotificationUseCase";
import type { NotificationClock } from "./ports/NotificationClock";
import type { NotificationDeliveryRepository } from "./ports/NotificationDeliveryRepository";
import type { NotificationProvider } from "./ports/NotificationProvider";
import type { OutboxRepository } from "./ports/OutboxRepository";
import { ProcessOutboxNotificationEventUseCase } from "./ProcessOutboxNotificationEventUseCase";

export class ProcessNextNotificationWorkUseCase {
  private readonly sendNotification: SendBookingNotificationUseCase;

  constructor(
    private readonly outbox: OutboxRepository,
    private readonly deliveries: NotificationDeliveryRepository,
    private readonly processOutboxEvent: ProcessOutboxNotificationEventUseCase,
    provider: NotificationProvider,
    private readonly clock: NotificationClock,
  ) {
    this.sendNotification = new SendBookingNotificationUseCase(
      deliveries,
      provider,
      clock,
    );
  }

  async execute(): Promise<ProcessNextNotificationWorkResultDto> {
    const outboxMessage = await this.outbox.findNextPending();

    if (outboxMessage) {
      const result = await this.processOutboxEvent.execute({
        outboxMessageId: outboxMessage.id,
      });

      return {
        createdDeliveryIds: result.createdDeliveryIds,
        outcome: "OUTBOX_PROCESSED",
        outboxMessageId: result.outboxMessageId,
      };
    }

    const delivery = await this.deliveries.findNextPendingToSend(
      this.clock.now(),
    );

    if (!delivery) {
      return {
        outcome: "IDLE",
      };
    }

    const result = await this.sendNotification.execute({
      notificationDeliveryId: delivery.toSnapshot().id,
    });

    return {
      notificationDeliveryId: result.notificationDeliveryId,
      outcome: "DELIVERY_SENT",
      status: result.status,
    };
  }
}
