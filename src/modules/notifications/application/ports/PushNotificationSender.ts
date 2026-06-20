import type { PushSubscriptionRecord } from "./PushSubscriptionRepository";

export type PushNotificationMessage = {
  body: string;
  tag: string;
  title: string;
  url: string;
};

export type PushNotificationSendResult = {
  disableSubscription: boolean;
  failureReason: string | null;
  provider: string;
  status: "FAILED" | "SENT";
};

export type PushNotificationSender = {
  send(
    subscription: PushSubscriptionRecord,
    message: PushNotificationMessage,
  ): Promise<PushNotificationSendResult>;
};
