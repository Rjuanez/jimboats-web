import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { RegisterPushSubscriptionUseCase } from "./RegisterPushSubscriptionUseCase";
import { SendBroadcastPushTestNotificationUseCase } from "./SendBroadcastPushTestNotificationUseCase";
import { SendOperationalBookingPushUseCase } from "./SendOperationalBookingPushUseCase";
import type { NotificationClock } from "./ports/NotificationClock";
import type {
  PushNotificationMessage,
  PushNotificationSender,
  PushNotificationSendResult,
} from "./ports/PushNotificationSender";
import type {
  PushDeliveryAttemptWriteModel,
  PushSubscriptionRecord,
  PushSubscriptionRepository,
  PushSubscriptionUpsert,
} from "./ports/PushSubscriptionRepository";

describe("push notification use cases", () => {
  it("registers a granted subscription when the activation code matches", async () => {
    const repository = new FakePushSubscriptionRepository();
    const useCase = new RegisterPushSubscriptionUseCase(
      repository,
      "crew-code",
    );

    const result = await useCase.execute({
      activationCode: "crew-code",
      auth: "auth-key",
      displayMode: "standalone",
      endpoint: "https://push.example/subscription-1",
      label: "iPhone Pedro",
      p256dh: "p256dh-key",
      permission: "GRANTED",
      platform: "IOS",
      userAgent: "Mobile Safari",
    });

    expect(result).toMatchObject({
      endpoint: "https://push.example/subscription-1",
      label: "iPhone Pedro",
      platform: "IOS",
      status: "ACTIVE",
    });
    expect(repository.subscriptions).toHaveLength(1);
  });

  it("rejects registration when the activation code does not match", async () => {
    const useCase = new RegisterPushSubscriptionUseCase(
      new FakePushSubscriptionRepository(),
      "crew-code",
    );

    await expect(
      useCase.execute({
        activationCode: "wrong",
        auth: "auth-key",
        displayMode: "standalone",
        endpoint: "https://push.example/subscription-1",
        label: "iPhone Pedro",
        p256dh: "p256dh-key",
        permission: "GRANTED",
        platform: "IOS",
        userAgent: "Mobile Safari",
      }),
    ).rejects.toBeInstanceOf(ApplicationError);
  });

  it("sends operational booking pushes to every active subscription", async () => {
    const repository = new FakePushSubscriptionRepository([
      subscriptionRecord({
        endpoint: "https://push.example/a",
        id: "subscription-a",
        label: "iPhone A",
      }),
      subscriptionRecord({
        endpoint: "https://push.example/b",
        id: "subscription-b",
        label: "Android B",
      }),
    ]);
    const sender = new FakePushNotificationSender();
    const useCase = new SendOperationalBookingPushUseCase(
      repository,
      sender,
      new FixedClock(),
    );

    const result = await useCase.execute({
      bookingId: "booking-1",
      bookingReference: "JB-100",
      customerName: "Laura",
      eventType: "BookingCreated",
      experienceName: "Sunset",
      localDate: "2026-06-21",
      startTime: "10:30",
    });

    expect(result).toEqual({
      failed: 0,
      sent: 2,
      total: 2,
    });
    expect(sender.messages).toHaveLength(2);
    expect(sender.messages[0]?.message).toMatchObject({
      body: "JB-100 · Laura · Sunset · 2026-06-21 10:30",
      title: "Nueva reserva confirmada",
      url: "/admin/bookings/booking-1",
    });
    expect(repository.attempts).toHaveLength(2);
    expect(repository.subscriptions.every((item) => item.lastSuccessAt)).toBe(
      true,
    );
  });

  it("broadcasts a fixed test push to every active subscription", async () => {
    const repository = new FakePushSubscriptionRepository([
      subscriptionRecord({
        endpoint: "https://push.example/a",
        id: "subscription-a",
      }),
      subscriptionRecord({
        endpoint: "https://push.example/b",
        id: "subscription-b",
      }),
    ]);
    const sender = new FakePushNotificationSender();
    const useCase = new SendBroadcastPushTestNotificationUseCase(
      repository,
      sender,
      new FixedClock(),
    );

    const result = await useCase.execute();

    expect(result).toEqual({
      failed: 0,
      sent: 2,
      total: 2,
    });
    expect(sender.messages[0]?.message).toMatchObject({
      body: "Notificacion de prueba enviada desde el dashboard.",
      title: "Prueba JimBoats",
      url: "/admin/device-notifications",
    });
    expect(repository.attempts).toHaveLength(2);
    expect(repository.attempts[0]).toMatchObject({
      bookingId: null,
      eventType: "PushBroadcastTest",
      status: "SENT",
    });
  });
});

class FakePushSubscriptionRepository implements PushSubscriptionRepository {
  readonly attempts: PushDeliveryAttemptWriteModel[] = [];
  readonly subscriptions: PushSubscriptionRecord[];

  constructor(initial: PushSubscriptionRecord[] = []) {
    this.subscriptions = [...initial];
  }

  async disable(input: {
    disabledAt: Date;
    endpoint: string;
    reason: string;
  }): Promise<void> {
    const subscription = this.subscriptions.find(
      (item) => item.endpoint === input.endpoint,
    );

    if (subscription) {
      subscription.disabledAt = input.disabledAt;
      subscription.lastFailureReason = input.reason;
      subscription.status = "DISABLED";
    }
  }

  async findByEndpoint(endpoint: string) {
    return this.subscriptions.find((item) => item.endpoint === endpoint) ?? null;
  }

  async listActive() {
    return this.subscriptions.filter((item) => item.status === "ACTIVE");
  }

  async listAll() {
    return [...this.subscriptions];
  }

  async markFailure(input: {
    failedAt: Date;
    reason: string;
    subscriptionId: string;
  }): Promise<void> {
    const subscription = this.subscriptions.find(
      (item) => item.id === input.subscriptionId,
    );

    if (subscription) {
      subscription.lastFailureAt = input.failedAt;
      subscription.lastFailureReason = input.reason;
    }
  }

  async markSuccess(input: {
    sentAt: Date;
    subscriptionId: string;
  }): Promise<void> {
    const subscription = this.subscriptions.find(
      (item) => item.id === input.subscriptionId,
    );

    if (subscription) {
      subscription.lastSuccessAt = input.sentAt;
    }
  }

  async markTestSent(): Promise<void> {}

  async recordAttempt(input: PushDeliveryAttemptWriteModel): Promise<void> {
    this.attempts.push(input);
  }

  async upsert(input: PushSubscriptionUpsert) {
    const existing = this.subscriptions.find(
      (item) => item.endpoint === input.endpoint,
    );

    if (existing) {
      Object.assign(existing, {
        ...input,
        disabledAt: null,
        status: "ACTIVE",
      });
      return existing;
    }

    const subscription = subscriptionRecord({
      ...input,
      id: `subscription-${this.subscriptions.length + 1}`,
    });

    this.subscriptions.push(subscription);
    return subscription;
  }
}

class FakePushNotificationSender implements PushNotificationSender {
  readonly messages: Array<{
    message: PushNotificationMessage;
    subscription: PushSubscriptionRecord;
  }> = [];

  async send(
    subscription: PushSubscriptionRecord,
    message: PushNotificationMessage,
  ): Promise<PushNotificationSendResult> {
    this.messages.push({
      message,
      subscription,
    });

    return {
      disableSubscription: false,
      failureReason: null,
      provider: "FAKE_PUSH",
      status: "SENT",
    };
  }
}

class FixedClock implements NotificationClock {
  now() {
    return new Date("2026-06-20T10:00:00.000Z");
  }
}

function subscriptionRecord(
  patch: Partial<PushSubscriptionRecord> = {},
): PushSubscriptionRecord {
  return {
    auth: "auth-key",
    createdAt: new Date("2026-06-20T09:00:00.000Z"),
    disabledAt: null,
    displayMode: "standalone",
    endpoint: "https://push.example/default",
    id: "subscription-1",
    label: "JimBoats device",
    lastFailureAt: null,
    lastFailureReason: null,
    lastSuccessAt: null,
    lastTestSentAt: null,
    p256dh: "p256dh-key",
    permission: "GRANTED",
    platform: "IOS",
    status: "ACTIVE",
    updatedAt: new Date("2026-06-20T09:00:00.000Z"),
    userAgent: "Mobile Safari",
    ...patch,
  };
}
