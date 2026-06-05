import type { NotificationPayload } from "../../domain/NotificationDelivery";

export type NotificationAuditAction =
  | "NOTIFICATION_RULE_UPDATED"
  | "NOTIFICATION_TEMPLATE_UPDATED";

export type NotificationAuditEntryWriteModel = {
  action: NotificationAuditAction;
  actorUserId: string | null;
  createdAt: Date;
  diff: NotificationPayload;
  resourceId: string;
  resourceType: "NOTIFICATION_RULE" | "NOTIFICATION_TEMPLATE";
};

export type NotificationAuditRepository = {
  record(entry: NotificationAuditEntryWriteModel): Promise<void>;
};
