import { AdminCancellationPoliciesWorkspace } from "@/components/sections/admin-cancellation-policies/AdminCancellationPoliciesWorkspace";
import type { AdminCancellationPolicyActions } from "@/components/sections/admin-cancellation-policies/AdminCancellationPolicyTypes";
import { saveAdminCancellationPolicyAction } from "@/interface/next/actions/adminCancellationPolicyActions";
import { getAdminCancellationPoliciesPage } from "@/interface/next/presenters/adminCancellationPoliciesPresenter";

export const dynamic = "force-dynamic";

const actions = {
  savePolicy: saveAdminCancellationPolicyAction,
} satisfies AdminCancellationPolicyActions;

export default async function AdminCancellationPoliciesPage() {
  const pageData = await getAdminCancellationPoliciesPage();

  return (
    <AdminCancellationPoliciesWorkspace
      actions={actions}
      initialState={pageData.state}
      navItems={pageData.navItems}
    />
  );
}
