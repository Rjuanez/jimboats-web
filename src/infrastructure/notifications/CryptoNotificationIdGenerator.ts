import { randomUUID } from "node:crypto";

import type { NotificationIdGenerator } from "@/modules/notifications/application/ports/NotificationIdGenerator";

export class CryptoNotificationIdGenerator implements NotificationIdGenerator {
  newNotificationDeliveryId(input: { outboxMessageId: string; ruleId: string }) {
    return `notification-delivery-${input.outboxMessageId}-${input.ruleId}`;
  }

  newNotificationRuleId() {
    return `notification-rule-${randomUUID()}`;
  }
}
