import { AdminExtrasWorkspace } from "@/components/sections/admin-extras/AdminExtrasWorkspace";
import type { AdminExtraActions } from "@/components/sections/admin-extras/AdminExtraTypes";
import {
  archiveAdminExtraAction,
  createAdminExtraAction,
  saveAdminExtraAction,
} from "@/interface/next/actions/adminExtraActions";
import { getAdminExtrasPage } from "@/interface/next/presenters/adminExtrasPresenter";

export const dynamic = "force-dynamic";

const actions = {
  archiveExtra: archiveAdminExtraAction,
  createExtra: createAdminExtraAction,
  saveExtra: saveAdminExtraAction,
} satisfies AdminExtraActions;

export default async function AdminExtrasPage() {
  const pageData = await getAdminExtrasPage();

  return (
    <AdminExtrasWorkspace
      actions={actions}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="list"
    />
  );
}
