import type { BroadcastPushTestNotificationResultDto } from "./PushNotificationDtos";
import { recordPushSend } from "./SendPushTestNotificationUseCase";
import type { NotificationClock } from "./ports/NotificationClock";
import type { PushNotificationSender } from "./ports/PushNotificationSender";
import type { PushSubscriptionRepository } from "./ports/PushSubscriptionRepository";

export class SendBroadcastPushTestNotificationUseCase {
  constructor(
    private readonly subscriptions: PushSubscriptionRepository,
    private readonly sender: PushNotificationSender,
    private readonly clock: NotificationClock,
  ) {}

  async execute(): Promise<BroadcastPushTestNotificationResultDto> {
    const subscriptions = await this.subscriptions.listActive();
    const sentAt = this.clock.now();
    const message = {
      body: "Notificacion de prueba enviada desde el dashboard.",
      tag: `jimboats-push-broadcast-test-${sentAt.getTime()}`,
      title: "Prueba JimBoats",
      url: "/admin/device-notifications",
    };

    let failed = 0;
    let sent = 0;

    for (const subscription of subscriptions) {
      const result = await this.sender.send(subscription, message);

      await recordPushSend({
        bookingId: null,
        eventType: "PushBroadcastTest",
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
