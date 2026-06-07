import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type { NotificationChannelValue } from "../domain/NotificationChannel";
import type {
  NotificationDeliverySnapshot,
  NotificationPayload,
} from "../domain/NotificationDelivery";
import type {
  NotificationRuleRecipientType,
  NotificationRuleSendMode,
  NotificationRuleSnapshot,
  NotificationRuleStatus,
} from "../domain/NotificationRule";
import type {
  NotificationTemplateSnapshot,
  NotificationTemplateStatus,
  NotificationTemplateTranslationStatus,
} from "../domain/NotificationTemplate";
import type { NotificationTypeValue } from "../domain/NotificationType";

export type NotificationRuleDto = NotificationRuleSnapshot & {
  readinessWarnings: string[];
};

export type NotificationTemplateDto = NotificationTemplateSnapshot & {
  missingPublishedLocales: SupportedLocaleCode[];
};

export type NotificationDeliveryDto = NotificationDeliverySnapshot;

export type UpdateNotificationRuleCommand = {
  channel: NotificationChannelValue;
  enabled: boolean;
  eventType: string;
  notificationType: NotificationTypeValue;
  recipientType: NotificationRuleRecipientType;
  requiresConsent: boolean;
  ruleId?: string;
  sendMode: NotificationRuleSendMode;
  status?: NotificationRuleStatus;
  templateId: string | null;
  updatedByUserId: string | null;
};

export type NotificationTemplateTranslationCommand = {
  body: string;
  htmlBody: string | null;
  locale: string;
  previewText: string | null;
  status: NotificationTemplateTranslationStatus;
  subject: string | null;
};

export type UpdateNotificationTemplateCommand = {
  allowedVariables: string[];
  channel: NotificationChannelValue;
  eventType: string;
  notificationType: NotificationTypeValue;
  providerTemplateId: string | null;
  requiredVariables: string[];
  status: NotificationTemplateStatus;
  templateId: string;
  translations: NotificationTemplateTranslationCommand[];
  updatedByUserId: string | null;
};

export type PreviewNotificationTemplateCommand = {
  bookingId?: string;
  draftBody?: string;
  draftHtmlBody?: string | null;
  draftPreviewText?: string | null;
  draftSubject?: string | null;
  fixtureKey?: string;
  locale: string;
  templateId: string;
};

export type PreviewNotificationTemplateResultDto = {
  missingVariables: string[];
  renderedBody: string;
  renderedHtmlBody: string | null;
  renderedPreviewText: string | null;
  renderedSubject: string | null;
  variables: string[];
  warnings: string[];
};

export type NotificationRuleSkipReason =
  | "ALREADY_PROCESSED"
  | "CONSENT_MISSING"
  | "PROVIDER_TEMPLATE_MISSING"
  | "RULE_DISABLED"
  | "TEMPLATE_MISSING"
  | "TRANSLATION_MISSING";

export type ProcessOutboxNotificationEventCommand = {
  outboxMessageId: string;
};

export type ProcessOutboxNotificationEventResultDto = {
  createdDeliveryIds: string[];
  outboxMessageId: string;
  skippedRules: Array<{
    reason: NotificationRuleSkipReason;
    ruleId: string;
  }>;
  status: "FAILED" | "PUBLISHED";
};

export type SendBookingNotificationCommand = {
  notificationDeliveryId: string;
  sentByUserId?: string | null;
};

export type SendBookingNotificationResultDto = {
  delivery: NotificationDeliveryDto;
  notificationDeliveryId: string;
  status: NotificationDeliveryDto["status"];
};

export type ProcessNextNotificationWorkResultDto =
  | {
      createdDeliveryIds: string[];
      outcome: "OUTBOX_PROCESSED";
      outboxMessageId: string;
    }
  | {
      notificationDeliveryId: string;
      outcome: "DELIVERY_SENT";
      status: NotificationDeliveryDto["status"];
    }
  | {
      outcome: "IDLE";
    };

export type NotificationRenderPayloadDto = NotificationPayload;
