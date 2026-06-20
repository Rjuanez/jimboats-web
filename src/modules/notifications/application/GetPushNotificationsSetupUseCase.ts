import { pushSubscriptionToDto } from "./PushNotificationApplicationMappers";
import type { PushNotificationsSetupDto } from "./PushNotificationDtos";
import type { PushSubscriptionRepository } from "./ports/PushSubscriptionRepository";

export class GetPushNotificationsSetupUseCase {
  constructor(
    private readonly subscriptions: PushSubscriptionRepository,
    private readonly vapidPublicKey: string | null,
    private readonly activationCodeConfigured: boolean,
  ) {}

  async execute(): Promise<PushNotificationsSetupDto> {
    const subscriptions = await this.subscriptions.listAll();

    return {
      activationRequired: this.activationCodeConfigured,
      subscriptions: subscriptions.map(pushSubscriptionToDto),
      vapidPublicKey: this.vapidPublicKey,
    };
  }
}
