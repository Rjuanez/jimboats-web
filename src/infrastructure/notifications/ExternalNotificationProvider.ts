import type {
  NotificationProvider,
  NotificationProviderSendResult,
} from "@/modules/notifications/application/ports/NotificationProvider";
import type { NotificationDeliverySnapshot } from "@/modules/notifications/domain/NotificationDelivery";

export class ExternalNotificationProvider implements NotificationProvider {
  constructor(
    private readonly emailProvider: NotificationProvider,
    private readonly whatsappProvider: NotificationProvider,
  ) {}

  async send(
    delivery: NotificationDeliverySnapshot,
  ): Promise<NotificationProviderSendResult> {
    if (delivery.channel === "EMAIL") {
      return this.emailProvider.send(delivery);
    }

    if (delivery.channel === "WHATSAPP") {
      return this.whatsappProvider.send(delivery);
    }

    throw new Error("Notification channel is not supported by provider.");
  }
}
