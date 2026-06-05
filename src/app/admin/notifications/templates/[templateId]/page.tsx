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

type AdminNotificationTemplateDetailPageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

export default async function AdminNotificationTemplateDetailPage({
  params,
}: AdminNotificationTemplateDetailPageProps) {
  const [{ templateId }, pageData] = await Promise.all([
    params,
    getAdminNotificationsPage(),
  ]);

  return (
    <AdminNotificationsWorkspace
      actions={actions}
      initialState={pageData.state}
      navItems={pageData.navItems}
      templateId={templateId}
      view="template-detail"
    />
  );
}
