"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  AdminCancellationPoliciesState,
  AdminCancellationPolicy,
  AdminCancellationPolicyActionResult,
} from "@/components/sections/admin-cancellation-policies/AdminCancellationPolicyTypes";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

import { presentAdminCancellationPoliciesWorkspace } from "../presenters/adminCancellationPoliciesPresenter";

export async function saveAdminCancellationPolicyAction(
  policy: AdminCancellationPolicy,
): Promise<
  AdminCancellationPolicyActionResult<{
    state: AdminCancellationPoliciesState;
  }>
> {
  try {
    const container = getContainer();

    await container.adminCancellationPolicies.savePolicy({
      id: policy.id,
      isDefault: policy.isDefault,
      name: policy.name,
      summaries: policy.summaries,
      tiers: policy.tiers.map((tier) => ({
        depositOutcome: tier.depositOutcome,
        fromHoursBeforeDeparture: tier.fromHoursBeforeDeparture,
        id: tier.id,
        label: tier.label,
        position: tier.position,
        refundAmount:
          tier.refundAmount === null
            ? null
            : {
                amountMinor: Math.round(tier.refundAmount * 100),
                currency: "EUR" as const,
              },
        toHoursBeforeDeparture: tier.toHoursBeforeDeparture,
      })),
    });

    return {
      data: {
        state: presentAdminCancellationPoliciesWorkspace(
          await container.adminCancellationPolicies.getWorkspace(),
        ),
      },
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

function failure<TData = never>(
  error: unknown,
): AdminCancellationPolicyActionResult<TData> {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid cancellation policy input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while saving the cancellation policy.",
    ok: false,
  };
}
