import { domainError } from "@/shared/domain/DomainError";

export type NotificationTypeValue =
  | "ADMIN_BOOKING_CREATED"
  | "BOOKING_CANCELLED"
  | "BOOKING_CONFIRMED_DEPOSIT_PAID"
  | "BOOKING_CREATED"
  | "BOOKING_EXPIRED"
  | "BOOKING_PAYMENT_FAILED"
  | "BOOKING_REMINDER"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_UPDATED";

export type BookingNotificationOutboxEventType =
  | "BookingCancelled"
  | "BookingCreated"
  | "BookingDepositPaid"
  | "BookingExpired"
  | "BookingPaymentFailed"
  | "BookingReminderDue"
  | "BookingRescheduled"
  | "BookingUpdated";

const supportedTypes = new Set<NotificationTypeValue>([
  "BOOKING_CREATED",
  "BOOKING_UPDATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
  "BOOKING_CONFIRMED_DEPOSIT_PAID",
  "BOOKING_PAYMENT_FAILED",
  "BOOKING_EXPIRED",
  "BOOKING_REMINDER",
  "ADMIN_BOOKING_CREATED",
]);

const outboxEventTypeMap = new Map<
  BookingNotificationOutboxEventType,
  NotificationTypeValue
>([
  ["BookingCreated", "BOOKING_CREATED"],
  ["BookingUpdated", "BOOKING_UPDATED"],
  ["BookingRescheduled", "BOOKING_RESCHEDULED"],
  ["BookingCancelled", "BOOKING_CANCELLED"],
  ["BookingDepositPaid", "BOOKING_CONFIRMED_DEPOSIT_PAID"],
  ["BookingPaymentFailed", "BOOKING_PAYMENT_FAILED"],
  ["BookingExpired", "BOOKING_EXPIRED"],
  ["BookingReminderDue", "BOOKING_REMINDER"],
]);

export class NotificationType {
  private constructor(readonly value: NotificationTypeValue) {}

  static create(rawValue: string) {
    const value = rawValue.trim().toUpperCase();

    if (!supportedTypes.has(value as NotificationTypeValue)) {
      throw domainError(
        "NOTIFICATION_TYPE_UNSUPPORTED",
        "Notification type is not supported.",
      );
    }

    return new NotificationType(value as NotificationTypeValue);
  }

  static fromOutboxEvent(eventType: BookingNotificationOutboxEventType) {
    const value = outboxEventTypeMap.get(eventType);

    if (!value) {
      throw domainError(
        "NOTIFICATION_TYPE_UNSUPPORTED",
        "Outbox event cannot create a notification type.",
      );
    }

    return new NotificationType(value);
  }

  requiresBooking() {
    return this.value.startsWith("BOOKING_");
  }

  requiresSchedule() {
    return this.value === "BOOKING_REMINDER";
  }

  equals(other: NotificationType) {
    return this.value === other.value;
  }

  toString() {
    return this.value;
  }
}
