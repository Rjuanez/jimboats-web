import { AdminNotificationsWorkspace } from "@/components/sections/admin-notifications/AdminNotificationsWorkspace";
import type { AdminNotificationActions } from "@/components/sections/admin-notifications/AdminNotificationTypes";
import {
  previewAdminNotificationTemplateAction,
  saveAdminNotificationRuleAction,
  saveAdminNotificationTemplateAction,
  sendAdminNotificationDeliveryAction,
} from "@/interface/next/actions/adminNotificationActions";
import { getAdminNotificationsPage } from "@/interface/next/presenters/adminNotificationsPresenter";

export const dynamic = "force-dynamic";

const actions = {
  previewTemplate: previewAdminNotificationTemplateAction,
  saveRule: saveAdminNotificationRuleAction,
  saveTemplate: saveAdminNotificationTemplateAction,
  sendDelivery: sendAdminNotificationDeliveryAction,
} satisfies AdminNotificationActions;

export default async function AdminNotificationTemplatesPage() {
  const pageData = await getAdminNotificationsPage();

  return (
    <AdminNotificationsWorkspace
      actions={actions}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="templates"
    />
  );
}
