import type { NotificationDelivery } from "../../domain/NotificationDelivery";

export type NotificationDeliveryRepository = {
  findById(id: string): Promise<NotificationDelivery | null>;
  findByOutboxMessageAndRule(input: {
    outboxMessageId: string;
    ruleId: string;
  }): Promise<NotificationDelivery | null>;
  findNextPendingToSend(now: Date): Promise<NotificationDelivery | null>;
  listRecent(input?: { limit?: number }): Promise<NotificationDelivery[]>;
  save(delivery: NotificationDelivery): Promise<void>;
};
