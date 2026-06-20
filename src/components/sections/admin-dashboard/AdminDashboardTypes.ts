import type { PushNotificationActionResult } from "@/components/sections/admin-push-notifications/AdminPushNotificationTypes";
import type { BroadcastPushTestNotificationResultDto } from "@/modules/notifications/application/PushNotificationDtos";

export type AdminDashboardActions = {
  sendBroadcastPushTest(): Promise<
    PushNotificationActionResult<BroadcastPushTestNotificationResultDto>
  >;
};

export type AdminDashboardState = {
  activePushSubscriptions: number;
};
