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

type AdminExtraPageProps = {
  params: Promise<{
    extraId: string;
  }>;
};

export default async function AdminExtraPage({ params }: AdminExtraPageProps) {
  const [{ extraId }, pageData] = await Promise.all([
    params,
    getAdminExtrasPage(),
  ]);

  return (
    <AdminExtrasWorkspace
      actions={actions}
      extraId={extraId}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="detail"
    />
  );
}
