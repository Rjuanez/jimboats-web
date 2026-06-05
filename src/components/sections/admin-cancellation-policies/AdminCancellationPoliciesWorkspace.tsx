"use client";

import { Plus, Save } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminCancellationPoliciesPageData,
  AdminCancellationPolicy,
  AdminCancellationPolicyActions,
} from "./AdminCancellationPolicyTypes";

type AdminCancellationPoliciesWorkspaceProps = {
  actions: AdminCancellationPolicyActions;
  initialState: AdminCancellationPoliciesPageData["state"];
  navItems: AdminCancellationPoliciesPageData["navItems"];
};

export function AdminCancellationPoliciesWorkspace({
  actions,
  initialState,
  navItems,
}: AdminCancellationPoliciesWorkspaceProps) {
  const [state, setState] = useState(initialState);
  const [draft, setDraft] = useState<AdminCancellationPolicy>(
    state.policies[0] ?? createEmptyPolicy(),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveDraft() {
    setSaving(true);
    setMessage(null);
    const result = await actions.savePolicy(draft);
    setSaving(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setState(result.data.state);
    const saved =
      result.data.state.policies.find((policy) => policy.id === draft.id) ??
      result.data.state.policies[0] ??
      draft;
    setDraft(saved);
    setMessage("Cancellation policy saved as a new active version.");
  }

  return (
    <AdminShell activeItemId="cancellation-policies" navItems={navItems}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-slate-950">
              Cancellation policies
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Create reusable global policies, then assign them to experiences.
              Every save creates a new active version for future bookings.
            </p>
          </div>
          <Button
            onClick={() => {
              setDraft(createEmptyPolicy());
              setMessage(null);
            }}
            variant="secondary"
          >
            <Plus className="size-4" aria-hidden="true" />
            New policy
          </Button>
        </div>

        {message ? (
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Surface title="Policies" bodyClassName="p-0">
            <div className="divide-y divide-slate-200">
              {state.policies.length === 0 ? (
                <p className="px-4 py-4 text-sm text-slate-600">
                  No policies yet.
                </p>
              ) : null}
              {state.policies.map((policy) => (
                <button
                  className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition hover:bg-slate-50"
                  key={policy.id}
                  onClick={() => {
                    setDraft(policy);
                    setMessage(null);
                  }}
                  type="button"
                >
                  <span className="font-semibold text-slate-950">
                    {policy.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    v{policy.activeVersion ?? "-"}
                    {policy.isDefault ? " · default" : ""}
                  </span>
                </button>
              ))}
            </div>
          </Surface>

          <Surface
            action={
              <Button loading={saving} onClick={saveDraft} variant="primary">
                <Save className="size-4" aria-hidden="true" />
                Save version
              </Button>
            }
            title="Policy editor"
          >
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  <span>Name</span>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft({ ...draft, name: event.target.value })
                    }
                  />
                </label>
                <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    checked={draft.isDefault}
                    onChange={(event) =>
                      setDraft({ ...draft, isDefault: event.target.checked })
                    }
                    type="checkbox"
                  />
                  Default for experiences without a selected policy
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {(["en", "es", "ca"] as const).map((locale) => (
                  <label
                    className="space-y-1 text-sm font-semibold text-slate-700"
                    key={locale}
                  >
                    <span>Summary {locale.toUpperCase()}</span>
                    <textarea
                      className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950"
                      value={draft.summaries[locale]}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          summaries: {
                            ...draft.summaries,
                            [locale]: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-950">
                    Tiers
                  </h2>
                  <Button
                    onClick={() =>
                      setDraft({
                        ...draft,
                        tiers: [...draft.tiers, createEmptyTier(draft.tiers.length)],
                      })
                    }
                    variant="secondary"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add tier
                  </Button>
                </div>

                <div className="space-y-3">
                  {draft.tiers.map((tier, index) => (
                    <div
                      className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-6"
                      key={tier.id}
                    >
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                        value={tier.label}
                        onChange={(event) =>
                          updateTier(index, { label: event.target.value })
                        }
                      />
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder="From h"
                        type="number"
                        value={tier.fromHoursBeforeDeparture ?? ""}
                        onChange={(event) =>
                          updateTier(index, {
                            fromHoursBeforeDeparture: numberOrNull(
                              event.target.value,
                            ),
                          })
                        }
                      />
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder="To h"
                        type="number"
                        value={tier.toHoursBeforeDeparture ?? ""}
                        onChange={(event) =>
                          updateTier(index, {
                            toHoursBeforeDeparture: numberOrNull(
                              event.target.value,
                            ),
                          })
                        }
                      />
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={tier.depositOutcome}
                        onChange={(event) =>
                          updateTier(index, {
                            depositOutcome: event.target
                              .value as AdminCancellationPolicy["tiers"][number]["depositOutcome"],
                          })
                        }
                      >
                        <option value="FULL_REFUND">Full refund</option>
                        <option value="PARTIAL_REFUND">Partial refund</option>
                        <option value="NO_REFUND">No refund</option>
                        <option value="MANUAL_REVIEW">Manual review</option>
                      </select>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Refund EUR"
                        type="number"
                        value={tier.refundAmount ?? ""}
                        onChange={(event) =>
                          updateTier(index, {
                            refundAmount: numberOrNull(event.target.value),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </AdminShell>
  );

  function updateTier(
    index: number,
    patch: Partial<AdminCancellationPolicy["tiers"][number]>,
  ) {
    setDraft({
      ...draft,
      tiers: draft.tiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, ...patch } : tier,
      ),
    });
  }
}

function createEmptyPolicy(): AdminCancellationPolicy {
  return {
    activeVersion: null,
    id: `policy-${Date.now()}`,
    isDefault: false,
    name: "Standard cancellation policy",
    summaries: {
      ca: "",
      en: "",
      es: "",
    },
    tiers: [createEmptyTier(0)],
  };
}

function createEmptyTier(position: number) {
  return {
    depositOutcome: "NO_REFUND" as const,
    fromHoursBeforeDeparture: null,
    id: `tier-${Date.now()}-${position}`,
    label: "Less than 24 hours before departure",
    position,
    refundAmount: null,
    toHoursBeforeDeparture: 24,
  };
}

function numberOrNull(value: string) {
  if (value.trim() === "") {
    return null;
  }

  return Number(value);
}
