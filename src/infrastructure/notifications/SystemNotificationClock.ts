import type { NotificationClock } from "@/modules/notifications/application/ports/NotificationClock";

export class SystemNotificationClock implements NotificationClock {
  now() {
    return new Date();
  }
}
