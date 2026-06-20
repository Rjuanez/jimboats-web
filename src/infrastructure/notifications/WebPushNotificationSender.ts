import webPush from "web-push";
import type { PushSubscription as WebPushSubscription } from "web-push";

import type {
  PushNotificationMessage,
  PushNotificationSender,
  PushNotificationSendResult,
} from "@/modules/notifications/application/ports/PushNotificationSender";
import type { PushSubscriptionRecord } from "@/modules/notifications/application/ports/PushSubscriptionRepository";

type WebPushNotificationSenderConfig = {
  privateKey: string;
  publicKey: string;
  subject: string;
};

export class WebPushNotificationSender implements PushNotificationSender {
  constructor(config: WebPushNotificationSenderConfig) {
    webPush.setVapidDetails(
      config.subject,
      config.publicKey,
      config.privateKey,
    );
  }

  async send(
    subscription: PushSubscriptionRecord,
    message: PushNotificationMessage,
  ): Promise<PushNotificationSendResult> {
    try {
      await webPush.sendNotification(
        toWebPushSubscription(subscription),
        JSON.stringify(message),
      );

      return {
        disableSubscription: false,
        failureReason: null,
        provider: "WEB_PUSH",
        status: "SENT",
      };
    } catch (error) {
      const statusCode = statusCodeFromError(error);

      return {
        disableSubscription: statusCode === 404 || statusCode === 410,
        failureReason:
          error instanceof Error
            ? error.message
            : "Web Push notification failed.",
        provider: "WEB_PUSH",
        status: "FAILED",
      };
    }
  }
}

export class DisabledPushNotificationSender implements PushNotificationSender {
  async send(): Promise<PushNotificationSendResult> {
    return {
      disableSubscription: false,
      failureReason: "Web Push is not configured.",
      provider: "WEB_PUSH_DISABLED",
      status: "FAILED",
    };
  }
}

export function createWebPushNotificationSenderFromEnv(): PushNotificationSender {
  const publicKey = optionalEnv("PUSH_VAPID_PUBLIC_KEY");
  const privateKey = optionalEnv("PUSH_VAPID_PRIVATE_KEY");

  if (!publicKey || !privateKey) {
    return new DisabledPushNotificationSender();
  }

  return new WebPushNotificationSender({
    privateKey,
    publicKey,
    subject:
      optionalEnv("PUSH_VAPID_SUBJECT") ??
      (process.env.APP_DOMAIN
        ? `mailto:admin@${process.env.APP_DOMAIN}`
        : "mailto:admin@example.com"),
  });
}

export function getPushVapidPublicKeyFromEnv() {
  return optionalEnv("PUSH_VAPID_PUBLIC_KEY");
}

function toWebPushSubscription(
  subscription: PushSubscriptionRecord,
): WebPushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      auth: subscription.auth,
      p256dh: subscription.p256dh,
    },
  };
}

function statusCodeFromError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return null;
}

function optionalEnv(name: string) {
  return process.env[name]?.trim() || null;
}
