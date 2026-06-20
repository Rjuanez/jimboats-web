import { ApplicationError } from "@/shared/application/ApplicationError";

import { assertActivationCode } from "./RegisterPushSubscriptionUseCase";
import type { SendPushTestNotificationCommand } from "./PushNotificationDtos";
import type { NotificationClock } from "./ports/NotificationClock";
import type { PushNotificationSender } from "./ports/PushNotificationSender";
import type {
  PushDeliveryAttemptWriteModel,
  PushSubscriptionRecord,
  PushSubscriptionRepository,
} from "./ports/PushSubscriptionRepository";

export class SendPushTestNotificationUseCase {
  constructor(
    private readonly subscriptions: PushSubscriptionRepository,
    private readonly sender: PushNotificationSender,
    private readonly clock: NotificationClock,
    private readonly expectedActivationCode: string | null,
  ) {}

  async execute(command: SendPushTestNotificationCommand) {
    assertActivationCode(command.activationCode, this.expectedActivationCode);

    const subscription = await this.subscriptions.findByEndpoint(
      command.endpoint,
    );

    if (!subscription || subscription.status !== "ACTIVE") {
      throw new ApplicationError(
        "PUSH_SUBSCRIPTION_NOT_FOUND",
        "Push subscription was not found.",
      );
    }

    const sentAt = this.clock.now();
    const message = {
      body: "Este dispositivo recibira avisos cuando se confirme una reserva.",
      tag: `jimboats-push-test-${subscription.id}`,
      title: "JimBoats avisos activados",
      url: "/admin/device-notifications",
    };
    const result = await this.sender.send(subscription, message);

    await recordPushSend({
      bookingId: null,
      eventType: "PushTest",
      message,
      result,
      sentAt,
      subscription,
      subscriptions: this.subscriptions,
    });
    await this.subscriptions.markTestSent({
      sentAt,
      subscriptionId: subscription.id,
    });

    return {
      status: result.status,
    };
  }
}

export async function recordPushSend(input: {
  bookingId: string | null;
  eventType: string;
  message: {
    body: string;
    title: string;
    url: string;
  };
  result: {
    disableSubscription: boolean;
    failureReason: string | null;
    provider: string;
    status: "FAILED" | "SENT";
  };
  sentAt: Date;
  subscription: PushSubscriptionRecord;
  subscriptions: PushSubscriptionRepository;
}) {
  const attempt: PushDeliveryAttemptWriteModel = {
    body: input.message.body,
    bookingId: input.bookingId,
    eventType: input.eventType,
    failureReason: input.result.failureReason,
    provider: input.result.provider,
    sentAt: input.sentAt,
    status: input.result.status,
    subscriptionId: input.subscription.id,
    title: input.message.title,
    url: input.message.url,
  };

  await input.subscriptions.recordAttempt(attempt);

  if (input.result.status === "SENT") {
    await input.subscriptions.markSuccess({
      sentAt: input.sentAt,
      subscriptionId: input.subscription.id,
    });
    return;
  }

  await input.subscriptions.markFailure({
    failedAt: input.sentAt,
    reason: input.result.failureReason ?? "Push notification failed.",
    subscriptionId: input.subscription.id,
  });

  if (input.result.disableSubscription) {
    await input.subscriptions.disable({
      disabledAt: input.sentAt,
      endpoint: input.subscription.endpoint,
      reason: input.result.failureReason ?? "Push subscription expired.",
    });
  }
}
