import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminCancellationPoliciesPageData,
  AdminCancellationPolicy,
} from "@/components/sections/admin-cancellation-policies/AdminCancellationPolicyTypes";
import type { AdminCancellationPoliciesWorkspaceDto } from "@/modules/booking/application/AdminCancellationPolicyDtos";

export async function getAdminCancellationPoliciesPage(): Promise<AdminCancellationPoliciesPageData> {
  const { getContainer } = await import("@/container");
  const workspace = await getContainer().adminCancellationPolicies.getWorkspace();

  return {
    navItems: adminNavItems,
    state: presentAdminCancellationPoliciesWorkspace(workspace),
  };
}

export function presentAdminCancellationPoliciesWorkspace(
  workspace: AdminCancellationPoliciesWorkspaceDto,
) {
  return {
    policies: workspace.policies.map((policy): AdminCancellationPolicy => {
      const activeVersion = policy.activeVersion;

      return {
        activeVersion: activeVersion?.version ?? null,
        id: policy.id,
        isDefault: policy.isDefault,
        name: policy.name,
        summaries: activeVersion?.summaries ?? {
          ca: "",
          en: "",
          es: "",
        },
        tiers:
          activeVersion?.tiers.map((tier) => ({
            depositOutcome: tier.depositOutcome,
            fromHoursBeforeDeparture:
              tier.fromMinutesBeforeDeparture === null
                ? null
                : tier.fromMinutesBeforeDeparture / 60,
            id: tier.id,
            label: tier.label,
            position: tier.position,
            refundAmount: tier.refundAmount
              ? tier.refundAmount.amountMinor / 100
              : null,
            toHoursBeforeDeparture:
              tier.toMinutesBeforeDeparture === null
                ? null
                : tier.toMinutesBeforeDeparture / 60,
          })) ?? [],
      };
    }),
  };
}
