import type {
  CancellationDepositOutcome,
  CancellationPolicySnapshot,
} from "../domain/CancellationPolicy";

export type CancellationPolicyTierCommand = {
  depositOutcome: CancellationDepositOutcome;
  fromHoursBeforeDeparture: number | null;
  id: string;
  label: string;
  position: number;
  refundAmount?: {
    amountMinor: number;
    currency: "EUR";
  } | null;
  toHoursBeforeDeparture: number | null;
};

export type SaveCancellationPolicyCommand = {
  id: string;
  isDefault: boolean;
  name: string;
  summaries: Record<"ca" | "en" | "es", string>;
  tiers: CancellationPolicyTierCommand[];
};

export type AdminCancellationPoliciesWorkspaceDto = {
  policies: CancellationPolicySnapshot[];
};
