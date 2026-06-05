import { domainError } from "@/shared/domain/DomainError";

export type NotificationChannelValue = "EMAIL" | "WHATSAPP";

const supportedChannels = new Set<NotificationChannelValue>([
  "EMAIL",
  "WHATSAPP",
]);

export class NotificationChannel {
  private constructor(readonly value: NotificationChannelValue) {}

  static create(rawValue: string) {
    const value = rawValue.trim().toUpperCase();

    if (!supportedChannels.has(value as NotificationChannelValue)) {
      throw domainError(
        "NOTIFICATION_CHANNEL_UNSUPPORTED",
        "Notification channel is not supported.",
      );
    }

    return new NotificationChannel(value as NotificationChannelValue);
  }

  equals(other: NotificationChannel) {
    return this.value === other.value;
  }

  toString() {
    return this.value;
  }
}
