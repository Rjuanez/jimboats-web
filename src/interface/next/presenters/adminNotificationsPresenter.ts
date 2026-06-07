import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminNotificationChannel,
  AdminNotificationDelivery,
  AdminNotificationEventOption,
  AdminNotificationLocale,
  AdminNotificationRule,
  AdminNotificationsPageData,
  AdminNotificationsState,
  AdminNotificationTemplate,
  AdminNotificationTemplateOption,
  AdminNotificationTemplateTranslation,
} from "@/components/sections/admin-notifications/AdminNotificationTypes";
import type { AdminNotificationsWorkspaceDto } from "@/modules/notifications/application/AdminNotificationDtos";
import type {
  NotificationDeliveryDto,
  NotificationRuleDto,
  NotificationTemplateDto,
} from "@/modules/notifications/application/NotificationDtos";

const adminNotificationLocales = ["en", "es", "ca"] as const;

const previewState: AdminNotificationsState = {
  deliveries: [
    {
      bookingId: "booking-preview-1",
      canSend: false,
      channel: "EMAIL",
      channelLabel: "Email",
      createdAtLabel: "01 Jun 2026, 12:00",
      eventLabel: "Booking created",
      eventType: "BookingCreated",
      failureReason: null,
      id: "delivery-preview-1",
      locale: "en",
      notificationType: "BOOKING_CREATED",
      recipientLabel: "sailor@example.com",
      renderedBody:
        "Hello Sailor Guest, booking JB-2026-0001 is confirmed for 10 Jun.",
      renderedHtmlBody:
        "<p>Hello Sailor Guest, booking <strong>JB-2026-0001</strong> is confirmed for 10 Jun.</p>",
      renderedSubject: "Booking JB-2026-0001 confirmed",
      sentAtLabel: "01 Jun 2026, 12:02",
      status: "SENT",
      statusLabel: "Sent",
      tone: "emerald",
    },
    {
      bookingId: "booking-preview-2",
      canSend: true,
      channel: "WHATSAPP",
      channelLabel: "WhatsApp",
      createdAtLabel: "01 Jun 2026, 12:20",
      eventLabel: "Booking reminder",
      eventType: "BookingReminderDue",
      failureReason: null,
      id: "delivery-preview-2",
      locale: "es",
      notificationType: "BOOKING_REMINDER",
      recipientLabel: "+34 600 000 000",
      renderedBody:
        "Hola Sailor Guest, te esperamos manana para tu salida JB-2026-0002.",
      renderedHtmlBody: null,
      renderedSubject: null,
      sentAtLabel: null,
      status: "MANUAL_REVIEW",
      statusLabel: "Manual review",
      tone: "amber",
    },
  ],
  eventOptions: [
    {
      eventType: "BookingCreated",
      label: "Booking created",
      notificationType: "BOOKING_CREATED",
    },
    {
      eventType: "BookingReminderDue",
      label: "Booking reminder",
      notificationType: "BOOKING_REMINDER",
    },
  ],
  rules: [
    {
      channel: "EMAIL",
      channelLabel: "Email",
      enabled: true,
      eventLabel: "Booking created",
      eventType: "BookingCreated",
      id: "rule-preview-email-created",
      notificationType: "BOOKING_CREATED",
      readinessWarnings: [],
      requiresConsent: true,
      sendMode: "AUTOMATIC",
      sendModeLabel: "Automatic",
      status: "ACTIVE",
      statusLabel: "Active",
      templateId: "template-preview-email-created",
      templateLabel: "template-preview-email-created - v1",
      updatedAtLabel: "01 Jun 2026, 12:00",
    },
    {
      channel: "WHATSAPP",
      channelLabel: "WhatsApp",
      enabled: true,
      eventLabel: "Booking reminder",
      eventType: "BookingReminderDue",
      id: "rule-preview-whatsapp-reminder",
      notificationType: "BOOKING_REMINDER",
      readinessWarnings: ["Missing published translations: ca."],
      requiresConsent: true,
      sendMode: "MANUAL_REVIEW",
      sendModeLabel: "Manual review",
      status: "ACTIVE",
      statusLabel: "Active",
      templateId: "template-preview-whatsapp-reminder",
      templateLabel: "template-preview-whatsapp-reminder - v1",
      updatedAtLabel: "01 Jun 2026, 12:10",
    },
  ],
  summary: {
    activeRules: 2,
    failedDeliveries: 0,
    manualReviewDeliveries: 1,
    templateWarnings: 1,
  },
  templateOptions: [
    {
      channel: "EMAIL",
      eventType: "BookingCreated",
      id: "template-preview-email-created",
      label: "template-preview-email-created - v1",
      missingPublishedLocales: [],
      status: "ACTIVE",
    },
    {
      channel: "WHATSAPP",
      eventType: "BookingReminderDue",
      id: "template-preview-whatsapp-reminder",
      label: "template-preview-whatsapp-reminder - v1",
      missingPublishedLocales: ["ca"],
      status: "ACTIVE",
    },
  ],
  templates: [
    {
      allowedVariablesText: "booking.reference\ncustomer.name",
      channel: "EMAIL",
      channelLabel: "Email",
      eventLabel: "Booking created",
      eventType: "BookingCreated",
      id: "template-preview-email-created",
      missingPublishedLocales: [],
      notificationType: "BOOKING_CREATED",
      providerTemplateId: "",
      requiredVariablesText: "booking.reference",
      status: "ACTIVE",
      statusLabel: "Active",
      translations: adminNotificationLocales.map((locale) => ({
        body:
          "Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.",
        htmlBody:
          '<p>Hello {{ customer.name }}, booking <strong>{{ booking.reference }}</strong> is confirmed.</p>',
        locale,
        localeLabel: localeLabel(locale),
        previewText: "Booking {{ booking.reference }} confirmed",
        status: "PUBLISHED",
        statusLabel: "Published",
        subject: "Booking {{ booking.reference }} confirmed",
        updatedAtLabel: "01 Jun 2026, 12:00",
        variablesUsed: ["booking.reference", "customer.name"],
      })),
      updatedAtLabel: "01 Jun 2026, 12:00",
      version: 1,
    },
  ],
};

export function getAdminNotificationsPreviewPage(): AdminNotificationsPageData {
  return {
    navItems: adminNavItems,
    state: previewState,
  };
}

export async function getAdminNotificationsPage(): Promise<AdminNotificationsPageData> {
  if (process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1") {
    return getAdminNotificationsPreviewPage();
  }

  const { getContainer } = await import("@/container");
  const container = getContainer();
  const workspace = await container.adminNotifications.getWorkspace();

  return {
    navItems: adminNavItems,
    state: presentAdminNotificationsWorkspace(workspace),
  };
}

export function presentAdminNotificationsWorkspace(
  workspace: AdminNotificationsWorkspaceDto,
): AdminNotificationsState {
  const eventOptions = workspace.eventOptions.map(presentEventOption);
  const templateOptions = workspace.templateOptions.map(presentTemplateOption);

  return {
    deliveries: workspace.deliveries.map((delivery) =>
      presentDelivery(delivery, eventOptions),
    ),
    eventOptions,
    rules: workspace.rules.map((rule) =>
      presentRule(rule, eventOptions, templateOptions),
    ),
    summary: workspace.summary,
    templateOptions,
    templates: workspace.templates.map((template) =>
      presentTemplate(template, eventOptions),
    ),
  };
}

function presentEventOption(
  option: AdminNotificationsWorkspaceDto["eventOptions"][number],
): AdminNotificationEventOption {
  return {
    eventType: option.eventType,
    label: option.label,
    notificationType: option.notificationType,
  };
}

function presentTemplateOption(
  option: AdminNotificationsWorkspaceDto["templateOptions"][number],
): AdminNotificationTemplateOption {
  return {
    channel: option.channel,
    eventType: option.eventType,
    id: option.id,
    label: option.label,
    missingPublishedLocales: [...option.missingPublishedLocales],
    status: option.status,
  };
}

function presentRule(
  rule: NotificationRuleDto,
  eventOptions: AdminNotificationEventOption[],
  templateOptions: AdminNotificationTemplateOption[],
): AdminNotificationRule {
  const template = templateOptions.find((option) => option.id === rule.templateId);

  return {
    channel: rule.channel,
    channelLabel: channelLabel(rule.channel),
    enabled: rule.enabled,
    eventLabel: eventLabel(rule.eventType, eventOptions),
    eventType: rule.eventType,
    id: rule.id,
    notificationType: rule.notificationType,
    readinessWarnings: rule.readinessWarnings,
    requiresConsent: rule.requiresConsent,
    sendMode: rule.sendMode,
    sendModeLabel: sendModeLabel(rule.sendMode),
    status: rule.status,
    statusLabel: ruleStatusLabel(rule.status),
    templateId: rule.templateId,
    templateLabel: template?.label ?? "No template",
    updatedAtLabel: formatDateLabel(rule.updatedAt),
  };
}

function presentTemplate(
  template: NotificationTemplateDto,
  eventOptions: AdminNotificationEventOption[],
): AdminNotificationTemplate {
  return {
    allowedVariablesText: template.allowedVariables.join("\n"),
    channel: template.channel,
    channelLabel: channelLabel(template.channel),
    eventLabel: eventLabel(template.eventType, eventOptions),
    eventType: template.eventType,
    id: template.id,
    missingPublishedLocales: [...template.missingPublishedLocales],
    notificationType: template.notificationType,
    providerTemplateId: template.providerTemplateId ?? "",
    requiredVariablesText: template.requiredVariables.join("\n"),
    status: template.status,
    statusLabel: templateStatusLabel(template.status),
    translations: presentTranslations(template),
    updatedAtLabel: formatDateLabel(template.updatedAt),
    version: template.version,
  };
}

function presentTranslations(
  template: NotificationTemplateDto,
): AdminNotificationTemplateTranslation[] {
  return adminNotificationLocales.map((locale) => {
    const translation = template.translations.find(
      (item) => item.locale === locale,
    );

    return {
      body: translation?.body ?? "",
      htmlBody: translation?.htmlBody ?? "",
      locale,
      localeLabel: localeLabel(locale),
      previewText: translation?.previewText ?? "",
      status: translation?.status ?? "DRAFT",
      statusLabel: translationStatusLabel(translation?.status ?? "DRAFT"),
      subject: translation?.subject ?? "",
      updatedAtLabel: translation
        ? formatDateLabel(translation.updatedAt)
        : "Not saved",
      variablesUsed: translation?.variablesUsed ?? [],
    };
  });
}

function presentDelivery(
  delivery: NotificationDeliveryDto,
  eventOptions: AdminNotificationEventOption[],
): AdminNotificationDelivery {
  return {
    bookingId: delivery.bookingId,
    canSend: ["FAILED", "MANUAL_REVIEW", "PENDING"].includes(delivery.status),
    channel: delivery.channel,
    channelLabel: channelLabel(delivery.channel),
    createdAtLabel: formatDateLabel(delivery.createdAt),
    eventLabel: eventLabel(delivery.eventType, eventOptions),
    eventType: delivery.eventType,
    failureReason: delivery.failureReason,
    id: delivery.id,
    locale: delivery.locale,
    notificationType: delivery.notificationType,
    recipientLabel: recipientLabel(delivery),
    renderedBody: delivery.renderedBody,
    renderedHtmlBody: delivery.renderedHtmlBody,
    renderedSubject: delivery.renderedSubject,
    sentAtLabel: delivery.sentAt ? formatDateLabel(delivery.sentAt) : null,
    status: delivery.status,
    statusLabel: deliveryStatusLabel(delivery.status),
    tone: deliveryTone(delivery.status),
  };
}

function eventLabel(
  eventType: string,
  eventOptions: AdminNotificationEventOption[],
) {
  return eventOptions.find((option) => option.eventType === eventType)?.label ?? eventType;
}

function channelLabel(channel: AdminNotificationChannel) {
  return channel === "EMAIL" ? "Email" : "WhatsApp";
}

function sendModeLabel(sendMode: NotificationRuleDto["sendMode"]) {
  return sendMode === "AUTOMATIC" ? "Automatic" : "Manual review";
}

function ruleStatusLabel(status: NotificationRuleDto["status"]) {
  return status === "ACTIVE" ? "Active" : "Archived";
}

function templateStatusLabel(status: NotificationTemplateDto["status"]) {
  const labels = {
    ACTIVE: "Active",
    ARCHIVED: "Archived",
    DRAFT: "Draft",
    READY: "Ready",
  } satisfies Record<NotificationTemplateDto["status"], string>;

  return labels[status];
}

function translationStatusLabel(
  status: AdminNotificationTemplateTranslation["status"],
) {
  const labels = {
    ARCHIVED: "Archived",
    DRAFT: "Draft",
    PUBLISHED: "Published",
    READY: "Ready",
  } satisfies Record<AdminNotificationTemplateTranslation["status"], string>;

  return labels[status];
}

function deliveryStatusLabel(status: NotificationDeliveryDto["status"]) {
  const labels = {
    CANCELLED: "Cancelled",
    DELIVERED: "Delivered",
    FAILED: "Failed",
    MANUAL_REVIEW: "Manual review",
    PENDING: "Pending",
    SENT: "Sent",
  } satisfies Record<NotificationDeliveryDto["status"], string>;

  return labels[status];
}

function deliveryTone(
  status: NotificationDeliveryDto["status"],
): AdminNotificationDelivery["tone"] {
  if (status === "FAILED" || status === "CANCELLED") {
    return "rose";
  }

  if (status === "MANUAL_REVIEW" || status === "PENDING") {
    return "amber";
  }

  if (status === "SENT" || status === "DELIVERED") {
    return "emerald";
  }

  return "neutral";
}

function localeLabel(locale: AdminNotificationLocale) {
  const labels = {
    ca: "Catalan",
    en: "English",
    es: "Spanish",
  } satisfies Record<AdminNotificationLocale, string>;

  return labels[locale];
}

function recipientLabel(delivery: NotificationDeliveryDto) {
  if (delivery.channel === "EMAIL") {
    return delivery.recipient.email ?? delivery.recipient.name ?? "No email";
  }

  return delivery.recipient.phone ?? delivery.recipient.name ?? "No phone";
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
