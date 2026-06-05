export type NotificationIdGenerator = {
  newNotificationDeliveryId(input: {
    outboxMessageId: string;
    ruleId: string;
  }): string;
  newNotificationRuleId(): string;
};
