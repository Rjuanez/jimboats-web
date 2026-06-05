import type { NotificationDeliverySnapshot } from "../../domain/NotificationDelivery";

export type NotificationProviderSendResult = {
  provider: string;
  providerMessageId: string | null;
};

export type NotificationProvider = {
  send(
    delivery: NotificationDeliverySnapshot,
  ): Promise<NotificationProviderSendResult>;
};
