import { adminEs, adminEventLabels } from "@/i18n/admin/es";
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
      channelLabel: adminEs["Email"],
      createdAtLabel: "01 jun 2026, 12:00",
      eventLabel: adminEs["Booking created"],
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
      sentAtLabel: "01 jun 2026, 12:02",
      status: "SENT",
      statusLabel: adminEs["Sent"],
      tone: "emerald",
    },
    {
      bookingId: "booking-preview-2",
      canSend: true,
      channel: "WHATSAPP",
      channelLabel: adminEs["WhatsApp"],
      createdAtLabel: "01 jun 2026, 12:20",
      eventLabel: adminEs["Booking reminder"],
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
      statusLabel: adminEs["Manual review"],
      tone: "amber",
    },
  ],
  eventOptions: [
    {
      eventType: "BookingCreated",
      label: adminEs["Booking created"],
      notificationType: "BOOKING_CREATED",
    },
    {
      eventType: "BookingReminderDue",
      label: adminEs["Booking reminder"],
      notificationType: "BOOKING_REMINDER",
    },
  ],
  rules: [
    {
      channel: "EMAIL",
      channelLabel: adminEs["Email"],
      enabled: true,
      eventLabel: adminEs["Booking created"],
      eventType: "BookingCreated",
      id: "rule-preview-email-created",
      notificationType: "BOOKING_CREATED",
      readinessWarnings: [],
      requiresConsent: true,
      sendMode: "AUTOMATIC",
      sendModeLabel: adminEs["Automatic"],
      status: "ACTIVE",
      statusLabel: adminEs["Active"],
      templateId: "template-preview-email-created",
      templateLabel: "template-preview-email-created - v1",
      updatedAtLabel: "01 jun 2026, 12:00",
    },
    {
      channel: "WHATSAPP",
      channelLabel: adminEs["WhatsApp"],
      enabled: true,
      eventLabel: adminEs["Booking reminder"],
      eventType: "BookingReminderDue",
      id: "rule-preview-whatsapp-reminder",
      notificationType: "BOOKING_REMINDER",
      readinessWarnings: [adminEs["Missing published translations: ca."]],
      requiresConsent: true,
      sendMode: "MANUAL_REVIEW",
      sendModeLabel: adminEs["Manual review"],
      status: "ACTIVE",
      statusLabel: adminEs["Active"],
      templateId: "template-preview-whatsapp-reminder",
      templateLabel: "template-preview-whatsapp-reminder - v1",
      updatedAtLabel: "01 jun 2026, 12:10",
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
      channelLabel: adminEs["Email"],
      eventLabel: adminEs["Booking created"],
      eventType: "BookingCreated",
      id: "template-preview-email-created",
      missingPublishedLocales: [],
      notificationType: "BOOKING_CREATED",
      providerTemplateId: "",
      requiredVariablesText: "booking.reference",
      status: "ACTIVE",
      statusLabel: adminEs["Active"],
      translations: adminNotificationLocales.map((locale) => ({
        body: "Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.",
        htmlBody:
          "<p>Hello {{ customer.name }}, booking <strong>{{ booking.reference }}</strong> is confirmed.</p>",
        locale,
        localeLabel: localeLabel(locale),
        previewText: "Booking {{ booking.reference }} confirmed",
        status: "PUBLISHED",
        statusLabel: adminEs["Published"],
        subject: "Booking {{ booking.reference }} confirmed",
        updatedAtLabel: "01 jun 2026, 12:00",
        variablesUsed: ["booking.reference", "customer.name"],
      })),
      updatedAtLabel: "01 jun 2026, 12:00",
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
    label: adminEventLabels[option.eventType] ?? option.label,
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
  const template = templateOptions.find(
    (option) => option.id === rule.templateId,
  );

  return {
    channel: rule.channel,
    channelLabel: channelLabel(rule.channel),
    enabled: rule.enabled,
    eventLabel: eventLabel(rule.eventType, eventOptions),
    eventType: rule.eventType,
    id: rule.id,
    notificationType: rule.notificationType,
    readinessWarnings: rule.readinessWarnings.map(presentReadinessWarning),
    requiresConsent: rule.requiresConsent,
    sendMode: rule.sendMode,
    sendModeLabel: sendModeLabel(rule.sendMode),
    status: rule.status,
    statusLabel: ruleStatusLabel(rule.status),
    templateId: rule.templateId,
    templateLabel: template?.label ?? adminEs["No template"],
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
        : adminEs["Not saved"],
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
  return (
    eventOptions.find((option) => option.eventType === eventType)?.label ??
    eventType
  );
}

function channelLabel(channel: AdminNotificationChannel) {
  return channel === "EMAIL" ? adminEs["Email"] : adminEs["WhatsApp"];
}

function sendModeLabel(sendMode: NotificationRuleDto["sendMode"]) {
  return sendMode === "AUTOMATIC"
    ? adminEs["Automatic"]
    : adminEs["Manual review"];
}

function ruleStatusLabel(status: NotificationRuleDto["status"]) {
  return status === "ACTIVE" ? adminEs["Active"] : adminEs["Archived"];
}

function templateStatusLabel(status: NotificationTemplateDto["status"]) {
  const labels = {
    ACTIVE: adminEs["Active"],
    ARCHIVED: adminEs["Archived"],
    DRAFT: adminEs["Draft"],
    READY: adminEs["Ready"],
  } satisfies Record<NotificationTemplateDto["status"], string>;

  return labels[status];
}

function translationStatusLabel(
  status: AdminNotificationTemplateTranslation["status"],
) {
  const labels = {
    ARCHIVED: adminEs["Archived"],
    DRAFT: adminEs["Draft"],
    PUBLISHED: adminEs["Published"],
    READY: adminEs["Ready"],
  } satisfies Record<AdminNotificationTemplateTranslation["status"], string>;

  return labels[status];
}

function deliveryStatusLabel(status: NotificationDeliveryDto["status"]) {
  const labels = {
    CANCELLED: adminEs["Cancelled"],
    DELIVERED: adminEs["Delivered"],
    FAILED: adminEs["Failed"],
    MANUAL_REVIEW: adminEs["Manual review"],
    PENDING: adminEs["Pending"],
    SENT: adminEs["Sent"],
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
    ca: adminEs["Catalan"],
    en: adminEs["English"],
    es: adminEs["Spanish"],
  } satisfies Record<AdminNotificationLocale, string>;

  return labels[locale];
}

function recipientLabel(delivery: NotificationDeliveryDto) {
  if (delivery.channel === "EMAIL") {
    return (
      delivery.recipient.email ?? delivery.recipient.name ?? adminEs["No email"]
    );
  }

  return (
    delivery.recipient.phone ?? delivery.recipient.name ?? adminEs["No phone"]
  );
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function presentReadinessWarning(message: string): string {
  if (message === "No template assigned.") return adminEs["No template"];
  if (message === "Assigned template does not exist.")
    return adminEs.assignedTemplateMissing;
  if (message === "Assigned template is not active.")
    return adminEs.assignedTemplateInactive;
  if (message.startsWith("Missing published translations: ")) {
    const locales = message
      .slice("Missing published translations: ".length)
      .replace(/\.$/, "");
    return adminEs.missingTranslations(
      locales
        .split(", ")
        .map(
          (locale) =>
            ({ es: "español", en: "inglés", ca: "catalán" })[locale] ?? locale,
        )
        .join(", "),
    );
  }
  return message;
}
