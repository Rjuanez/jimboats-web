import type {
  AdminNotificationEventOptionDto,
  AdminNotificationTemplateOptionDto,
  AdminNotificationsWorkspaceDto,
} from "./AdminNotificationDtos";
import {
  notificationDeliveryToDto,
  notificationRuleToDto,
  notificationTemplateToDto,
} from "./NotificationApplicationMappers";
import type { NotificationDeliveryRepository } from "./ports/NotificationDeliveryRepository";
import type { NotificationRuleRepository } from "./ports/NotificationRuleRepository";
import type { NotificationTemplateRepository } from "./ports/NotificationTemplateRepository";

const notificationEvents: AdminNotificationEventOptionDto[] = [
  {
    eventType: "BookingCreated",
    label: "Booking created",
    notificationType: "BOOKING_CREATED",
  },
  {
    eventType: "BookingUpdated",
    label: "Booking updated",
    notificationType: "BOOKING_UPDATED",
  },
  {
    eventType: "BookingRescheduled",
    label: "Booking rescheduled",
    notificationType: "BOOKING_RESCHEDULED",
  },
  {
    eventType: "BookingCancelled",
    label: "Booking cancelled",
    notificationType: "BOOKING_CANCELLED",
  },
  {
    eventType: "BookingDepositPaid",
    label: "Deposit paid",
    notificationType: "BOOKING_CONFIRMED_DEPOSIT_PAID",
  },
  {
    eventType: "BookingPaymentFailed",
    label: "Payment failed",
    notificationType: "BOOKING_PAYMENT_FAILED",
  },
  {
    eventType: "BookingExpired",
    label: "Booking expired",
    notificationType: "BOOKING_EXPIRED",
  },
  {
    eventType: "BookingReminderDue",
    label: "Booking reminder",
    notificationType: "BOOKING_REMINDER",
  },
];

export class GetAdminNotificationsWorkspaceUseCase {
  constructor(
    private readonly rules: NotificationRuleRepository,
    private readonly templates: NotificationTemplateRepository,
    private readonly deliveries: NotificationDeliveryRepository,
  ) {}

  async execute(): Promise<AdminNotificationsWorkspaceDto> {
    const [rules, templates, deliveries] = await Promise.all([
      this.rules.list(),
      this.templates.list(),
      this.deliveries.listRecent({ limit: 25 }),
    ]);
    const templateDtos = templates.map(notificationTemplateToDto);
    const templateWarnings = templateDtos.filter(
      (template) =>
        template.status !== "ARCHIVED" &&
        template.missingPublishedLocales.length > 0,
    ).length;
    const deliveryDtos = deliveries.map(notificationDeliveryToDto);

    return {
      deliveries: deliveryDtos,
      eventOptions: notificationEvents,
      rules: rules.map((rule) =>
        notificationRuleToDto(rule, readinessWarningsForRule(rule.templateId, templateDtos)),
      ),
      summary: {
        activeRules: rules.filter((rule) => {
          const snapshot = rule.toSnapshot();

          return snapshot.status === "ACTIVE" && snapshot.enabled;
        }).length,
        failedDeliveries: deliveryDtos.filter(
          (delivery) => delivery.status === "FAILED",
        ).length,
        manualReviewDeliveries: deliveryDtos.filter(
          (delivery) => delivery.status === "MANUAL_REVIEW",
        ).length,
        templateWarnings,
      },
      templateOptions: templateDtos.map(toTemplateOption),
      templates: templateDtos,
    };
  }
}

function toTemplateOption(
  template: ReturnType<typeof notificationTemplateToDto>,
): AdminNotificationTemplateOptionDto {
  return {
    channel: template.channel,
    eventType: template.eventType,
    id: template.id,
    label: `${template.id} - v${template.version}`,
    missingPublishedLocales: template.missingPublishedLocales,
    status: template.status,
  };
}

function readinessWarningsForRule(
  templateId: string | null,
  templates: ReturnType<typeof notificationTemplateToDto>[],
) {
  if (!templateId) {
    return ["No template assigned."];
  }

  const template = templates.find((item) => item.id === templateId);

  if (!template) {
    return ["Assigned template does not exist."];
  }

  const warnings: string[] = [];

  if (template.status !== "ACTIVE") {
    warnings.push("Assigned template is not active.");
  }

  if (template.missingPublishedLocales.length > 0) {
    warnings.push(
      `Missing published translations: ${template.missingPublishedLocales.join(", ")}.`,
    );
  }

  return warnings;
}
