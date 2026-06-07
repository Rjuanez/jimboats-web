import type { AdminNavItem } from "@/components/layout/AdminNavigation";

export type AdminNotificationChannel = "EMAIL" | "WHATSAPP";
export type AdminNotificationRuleStatus = "ACTIVE" | "ARCHIVED";
export type AdminNotificationSendMode = "AUTOMATIC" | "MANUAL_REVIEW";
export type AdminNotificationTemplateStatus =
  | "ACTIVE"
  | "ARCHIVED"
  | "DRAFT"
  | "READY";
export type AdminNotificationTranslationStatus =
  | "ARCHIVED"
  | "DRAFT"
  | "PUBLISHED"
  | "READY";
export type AdminNotificationDeliveryStatus =
  | "CANCELLED"
  | "DELIVERED"
  | "FAILED"
  | "MANUAL_REVIEW"
  | "PENDING"
  | "SENT";
export type AdminNotificationLocale = "ca" | "en" | "es";

export type AdminNotificationEventOption = {
  eventType: string;
  label: string;
  notificationType: string;
};

export type AdminNotificationTemplateOption = {
  channel: AdminNotificationChannel;
  eventType: string;
  id: string;
  label: string;
  missingPublishedLocales: AdminNotificationLocale[];
  status: AdminNotificationTemplateStatus;
};

export type AdminNotificationRule = {
  channel: AdminNotificationChannel;
  channelLabel: string;
  enabled: boolean;
  eventLabel: string;
  eventType: string;
  id: string;
  notificationType: string;
  readinessWarnings: string[];
  requiresConsent: boolean;
  sendMode: AdminNotificationSendMode;
  sendModeLabel: string;
  status: AdminNotificationRuleStatus;
  statusLabel: string;
  templateId: string | null;
  templateLabel: string;
  updatedAtLabel: string;
};

export type AdminNotificationTemplateTranslation = {
  body: string;
  htmlBody: string;
  locale: AdminNotificationLocale;
  localeLabel: string;
  previewText: string;
  status: AdminNotificationTranslationStatus;
  statusLabel: string;
  subject: string;
  updatedAtLabel: string;
  variablesUsed: string[];
};

export type AdminNotificationTemplate = {
  allowedVariablesText: string;
  channel: AdminNotificationChannel;
  channelLabel: string;
  eventLabel: string;
  eventType: string;
  id: string;
  missingPublishedLocales: AdminNotificationLocale[];
  notificationType: string;
  providerTemplateId: string;
  requiredVariablesText: string;
  status: AdminNotificationTemplateStatus;
  statusLabel: string;
  translations: AdminNotificationTemplateTranslation[];
  updatedAtLabel: string;
  version: number;
};

export type AdminNotificationDelivery = {
  bookingId: string | null;
  canSend: boolean;
  channel: AdminNotificationChannel;
  channelLabel: string;
  createdAtLabel: string;
  eventLabel: string;
  eventType: string;
  failureReason: string | null;
  id: string;
  locale: AdminNotificationLocale;
  notificationType: string;
  recipientLabel: string;
  renderedBody: string;
  renderedHtmlBody: string | null;
  renderedSubject: string | null;
  sentAtLabel: string | null;
  status: AdminNotificationDeliveryStatus;
  statusLabel: string;
  tone: "amber" | "emerald" | "neutral" | "rose" | "sky";
};

export type AdminNotificationsSummary = {
  activeRules: number;
  failedDeliveries: number;
  manualReviewDeliveries: number;
  templateWarnings: number;
};

export type AdminNotificationsState = {
  deliveries: AdminNotificationDelivery[];
  eventOptions: AdminNotificationEventOption[];
  rules: AdminNotificationRule[];
  summary: AdminNotificationsSummary;
  templateOptions: AdminNotificationTemplateOption[];
  templates: AdminNotificationTemplate[];
};

export type AdminNotificationsPageData = {
  navItems: AdminNavItem[];
  state: AdminNotificationsState;
};

export type AdminNotificationsView = "logs" | "rules" | "template-detail" | "templates";

export type AdminNotificationRuleInput = {
  channel: AdminNotificationChannel;
  enabled: boolean;
  eventType: string;
  notificationType: string;
  requiresConsent: boolean;
  ruleId?: string;
  sendMode: AdminNotificationSendMode;
  status: AdminNotificationRuleStatus;
  templateId: string | null;
};

export type AdminNotificationTemplateTranslationInput = {
  body: string;
  htmlBody: string;
  locale: AdminNotificationLocale;
  previewText: string;
  status: AdminNotificationTranslationStatus;
  subject: string;
};

export type AdminNotificationTemplateInput = {
  allowedVariablesText: string;
  channel: AdminNotificationChannel;
  eventType: string;
  notificationType: string;
  providerTemplateId: string;
  requiredVariablesText: string;
  status: AdminNotificationTemplateStatus;
  templateId: string;
  translations: AdminNotificationTemplateTranslationInput[];
};

export type AdminNotificationPreviewInput = {
  bookingId: string;
  draftBody: string;
  draftHtmlBody: string;
  draftPreviewText: string;
  draftSubject: string;
  fixtureKey: string;
  locale: AdminNotificationLocale;
  templateId: string;
};

export type AdminNotificationSendDeliveryInput = {
  notificationDeliveryId: string;
};

export type AdminNotificationPreview = {
  missingVariables: string[];
  renderedBody: string;
  renderedHtmlBody: string | null;
  renderedPreviewText: string | null;
  renderedSubject: string | null;
  variables: string[];
  warnings: string[];
};

export type AdminNotificationActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminNotificationActions = {
  previewTemplate: (
    input: AdminNotificationPreviewInput,
  ) => Promise<AdminNotificationActionResult<AdminNotificationPreview>>;
  saveRule: (
    input: AdminNotificationRuleInput,
  ) => Promise<AdminNotificationActionResult<{ state: AdminNotificationsState }>>;
  saveTemplate: (
    input: AdminNotificationTemplateInput,
  ) => Promise<AdminNotificationActionResult<{ state: AdminNotificationsState }>>;
  sendDelivery: (
    input: AdminNotificationSendDeliveryInput,
  ) => Promise<AdminNotificationActionResult<{ state: AdminNotificationsState }>>;
};
