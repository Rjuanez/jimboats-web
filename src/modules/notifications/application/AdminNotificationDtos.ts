import type {
  NotificationDeliveryDto,
  NotificationRuleDto,
  NotificationTemplateDto,
} from "./NotificationDtos";

export type AdminNotificationEventOptionDto = {
  eventType: string;
  label: string;
  notificationType: string;
};

export type AdminNotificationTemplateOptionDto = {
  channel: NotificationTemplateDto["channel"];
  eventType: string;
  id: string;
  label: string;
  missingPublishedLocales: NotificationTemplateDto["missingPublishedLocales"];
  status: NotificationTemplateDto["status"];
};

export type AdminNotificationsSummaryDto = {
  activeRules: number;
  failedDeliveries: number;
  manualReviewDeliveries: number;
  templateWarnings: number;
};

export type AdminNotificationsWorkspaceDto = {
  deliveries: NotificationDeliveryDto[];
  eventOptions: AdminNotificationEventOptionDto[];
  rules: NotificationRuleDto[];
  summary: AdminNotificationsSummaryDto;
  templateOptions: AdminNotificationTemplateOptionDto[];
  templates: NotificationTemplateDto[];
};
