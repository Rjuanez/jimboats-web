import { adminNavItems } from "@/components/layout/AdminNavigation";
import { AdminDashboardWorkspace } from "@/components/sections/admin-dashboard/AdminDashboardWorkspace";
import type { AdminDashboardState } from "@/components/sections/admin-dashboard/AdminDashboardTypes";
import { getContainer } from "@/container";
import { sendBroadcastPushTestNotificationAction } from "@/interface/next/actions/pushNotificationActions";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const state =
    process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1"
      ? previewDashboardState()
      : await getDashboardState();

  return (
    <AdminDashboardWorkspace
      actions={{
        sendBroadcastPushTest: sendBroadcastPushTestNotificationAction,
      }}
      navItems={adminNavItems}
      state={state}
    />
  );
}

async function getDashboardState(): Promise<AdminDashboardState> {
  const setup = await getContainer().adminPushNotifications.getSetup();

  return {
    activePushSubscriptions: setup.subscriptions.filter(
      (subscription) => subscription.status === "ACTIVE",
    ).length,
  };
}

function previewDashboardState(): AdminDashboardState {
  return {
    activePushSubscriptions: 2,
  };
}
