import { ShieldCheck } from "lucide-react";

import { Surface } from "@/components/ui/Surface";

import type {
  AdminCancellationPolicyOption,
  AdminExperience,
  AdminExperienceMutation,
} from "./AdminExperienceTypes";

type AdminExperienceCancellationSectionProps = {
  cancellationPolicies: AdminCancellationPolicyOption[];
  experience: AdminExperience;
  updateExperience: AdminExperienceMutation;
};

export function AdminExperienceCancellationSection({
  cancellationPolicies,
  experience,
  updateExperience,
}: AdminExperienceCancellationSectionProps) {
  const selectedPolicy =
    cancellationPolicies.find((policy) => {
      return policy.id === experience.cancellationPolicyId;
    }) ??
    cancellationPolicies.find((policy) => policy.isDefault) ??
    null;

  return (
    <Surface
      description="Choose which global versioned policy applies to new bookings for this experience."
      title="Cancellation policy"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <label className="space-y-1 text-sm font-semibold text-slate-700">
          <span>Applied policy</span>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950"
            value={experience.cancellationPolicyId ?? ""}
            onChange={(event) =>
              updateExperience((current) => ({
                ...current,
                cancellationPolicyId: event.target.value || null,
              }))
            }
          >
            <option value="">Use default policy</option>
            {cancellationPolicies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.name}
                {policy.isDefault ? " (default)" : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <ShieldCheck className="size-4 text-sky-700" aria-hidden="true" />
            {selectedPolicy?.name ?? "No policy configured"}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {selectedPolicy?.summary ||
              "Create a global cancellation policy before publishing booking terms."}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-normal text-slate-500">
            Version {selectedPolicy?.activeVersion ?? "-"}
          </p>
        </div>
      </div>
    </Surface>
  );
}
