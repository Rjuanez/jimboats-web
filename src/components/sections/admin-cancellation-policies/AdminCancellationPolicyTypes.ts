import type { AdminNavItem } from "@/components/layout/AdminNavigation";
import type { CancellationDepositOutcome } from "@/modules/booking/domain/CancellationPolicy";

export type AdminCancellationPolicyTier = {
  depositOutcome: CancellationDepositOutcome;
  fromHoursBeforeDeparture: number | null;
  id: string;
  label: string;
  position: number;
  refundAmount: number | null;
  toHoursBeforeDeparture: number | null;
};

export type AdminCancellationPolicy = {
  activeVersion: number | null;
  id: string;
  isDefault: boolean;
  name: string;
  summaries: Record<"ca" | "en" | "es", string>;
  tiers: AdminCancellationPolicyTier[];
};

export type AdminCancellationPoliciesState = {
  policies: AdminCancellationPolicy[];
};

export type AdminCancellationPoliciesPageData = {
  navItems: AdminNavItem[];
  state: AdminCancellationPoliciesState;
};

export type AdminCancellationPolicyActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminCancellationPolicyActions = {
  savePolicy: (policy: AdminCancellationPolicy) => Promise<
    AdminCancellationPolicyActionResult<{
      state: AdminCancellationPoliciesState;
    }>
  >;
};
