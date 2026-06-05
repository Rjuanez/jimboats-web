import type { NotificationChannelValue } from "../../domain/NotificationChannel";
import type {
  NotificationRule,
  NotificationRuleRecipientType,
} from "../../domain/NotificationRule";

export type NotificationRuleIdentity = {
  channel: NotificationChannelValue;
  eventType: string;
  recipientType: NotificationRuleRecipientType;
};

export type NotificationRuleRepository = {
  findActiveByIdentity(
    identity: NotificationRuleIdentity,
  ): Promise<NotificationRule | null>;
  findById(id: string): Promise<NotificationRule | null>;
  list(): Promise<NotificationRule[]>;
  listByEventType(eventType: string): Promise<NotificationRule[]>;
  save(rule: NotificationRule): Promise<void>;
};
