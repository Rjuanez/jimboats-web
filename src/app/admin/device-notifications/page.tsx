import { getContainer } from "@/container";
import { AdminShell } from "@/components/layout/AdminShell";
import { adminNavItems } from "@/components/layout/AdminNavigation";
import { AdminPushNotificationsWorkspace } from "@/components/sections/admin-push-notifications/AdminPushNotificationsWorkspace";
import {
  registerPushSubscriptionAction,
  sendPushTestNotificationAction,
} from "@/interface/next/actions/pushNotificationActions";

export const dynamic = "force-dynamic";

export default async function AdminDeviceNotificationsPage() {
  const setup =
    process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1"
      ? {
          activationRequired: true,
          subscriptions: [],
          vapidPublicKey: "preview-vapid-public-key",
        }
      : await getContainer().adminPushNotifications.getSetup();

  return (
    <AdminShell activeItemId="device-notifications" navItems={adminNavItems}>
      <AdminPushNotificationsWorkspace
        actions={{
          registerSubscription: registerPushSubscriptionAction,
          sendTest: sendPushTestNotificationAction,
        }}
        setup={setup}
      />
    </AdminShell>
  );
}
