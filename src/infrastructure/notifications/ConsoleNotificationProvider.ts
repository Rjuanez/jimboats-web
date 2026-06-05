import type {
  NotificationProvider,
  NotificationProviderSendResult,
} from "@/modules/notifications/application/ports/NotificationProvider";
import type { NotificationDeliverySnapshot } from "@/modules/notifications/domain/NotificationDelivery";

export class ConsoleNotificationProvider implements NotificationProvider {
  async send(
    delivery: NotificationDeliverySnapshot,
  ): Promise<NotificationProviderSendResult> {
    console.info("Console notification provider accepted delivery.", {
      channel: delivery.channel,
      id: delivery.id,
      recipient: delivery.recipient,
    });

    return {
      provider: `CONSOLE_${delivery.channel}`,
      providerMessageId: `console-${delivery.channel.toLowerCase()}-${delivery.id}-${delivery.attempts + 1}`,
    };
  }
}
