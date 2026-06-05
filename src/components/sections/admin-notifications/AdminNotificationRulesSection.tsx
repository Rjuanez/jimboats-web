"use client";

import { CheckCircle2, Pencil, Plus, Save, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  CheckboxField,
  FieldGrid,
  SelectField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminNotificationActions,
  AdminNotificationRule,
  AdminNotificationRuleInput,
  AdminNotificationsState,
} from "./AdminNotificationTypes";

type AdminNotificationRulesSectionProps = {
  isSaving: boolean;
  saveRule: AdminNotificationActions["saveRule"];
  state: AdminNotificationsState;
};

export function AdminNotificationRulesSection({
  isSaving,
  saveRule,
  state,
}: AdminNotificationRulesSectionProps) {
  const [form, setForm] = useState<AdminNotificationRuleInput>(() =>
    createEmptyRuleForm(state),
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveRule(form);
  }

  function setEvent(eventType: string) {
    const option = state.eventOptions.find((item) => item.eventType === eventType);

    setForm((current) => ({
      ...current,
      eventType,
      notificationType: option?.notificationType ?? current.notificationType,
      templateId: null,
    }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <Surface
        description="Each active rule decides which booking event sends a message and through which channel."
        title="Notification rules"
      >
        {state.rules.length === 0 ? (
          <EmptyRules />
        ) : (
          <div className="space-y-3">
            {state.rules.map((rule) => (
              <RuleRow
                isSaving={isSaving}
                key={rule.id}
                onEdit={() => setForm(createRuleFormFromRule(rule))}
                rule={rule}
              />
            ))}
          </div>
        )}
      </Surface>

      <Surface
        action={
          <Button
            onClick={() => setForm(createEmptyRuleForm(state))}
            size="sm"
            variant="secondary"
          >
            <Plus className="size-4" aria-hidden="true" />
            New
          </Button>
        }
        description="Rules always target the buyer and require consent stored on the booking."
        title={form.ruleId ? "Edit rule" : "Create rule"}
      >
        <form className="space-y-4" onSubmit={submit}>
          <SelectField
            label="Event"
            onChange={(event) => setEvent(event.target.value)}
            value={form.eventType}
          >
            {state.eventOptions.map((option) => (
              <option key={option.eventType} value={option.eventType}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <FieldGrid>
            <SelectField
              label="Channel"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  channel: event.target.value as AdminNotificationRuleInput["channel"],
                  templateId: null,
                }))
              }
              value={form.channel}
            >
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
            </SelectField>
            <SelectField
              label="Send mode"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sendMode: event.target
                    .value as AdminNotificationRuleInput["sendMode"],
                }))
              }
              value={form.sendMode}
            >
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL_REVIEW">Manual review</option>
            </SelectField>
          </FieldGrid>
          <SelectField
            label="Template"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                templateId: event.target.value || null,
              }))
            }
            value={form.templateId ?? ""}
          >
            <option value="">No template</option>
            {state.templateOptions
              .filter((template) => template.channel === form.channel)
              .map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
          </SelectField>
          <FieldGrid>
            <SelectField
              label="Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target
                    .value as AdminNotificationRuleInput["status"],
                }))
              }
              value={form.status}
            >
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </SelectField>
            <div className="space-y-3">
              <CheckboxField
                checked={form.enabled}
                label="Enabled"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }))
                }
              />
              <CheckboxField
                checked={form.requiresConsent}
                label="Requires consent"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    requiresConsent: event.target.checked,
                  }))
                }
              />
            </div>
          </FieldGrid>
          <Button disabled={isSaving} loading={isSaving} type="submit">
            <Save className="size-4" aria-hidden="true" />
            Save rule
          </Button>
        </form>
      </Surface>
    </div>
  );
}

function RuleRow({
  isSaving,
  onEdit,
  rule,
}: {
  isSaving: boolean;
  onEdit: () => void;
  rule: AdminNotificationRule;
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={rule.enabled ? "emerald" : "neutral"}>
              {rule.enabled ? "Enabled" : "Disabled"}
            </Badge>
            <Badge tone={rule.status === "ACTIVE" ? "sky" : "neutral"}>
              {rule.statusLabel}
            </Badge>
            <Badge tone="neutral">{rule.channelLabel}</Badge>
            <Badge tone="neutral">{rule.sendModeLabel}</Badge>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {rule.eventLabel}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {rule.templateLabel}
            </p>
          </div>
          {rule.readinessWarnings.length > 0 ? (
            <div className="space-y-1">
              {rule.readinessWarnings.map((warning) => (
                <p
                  className="flex items-start gap-2 text-sm leading-6 text-amber-700"
                  key={warning}
                >
                  <TriangleAlert
                    className="mt-1 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{warning}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Ready
            </p>
          )}
          <p className="text-xs font-medium text-slate-500">
            Updated {rule.updatedAtLabel}
          </p>
        </div>
        <Button disabled={isSaving} onClick={onEdit} variant="secondary">
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </Button>
      </div>
    </article>
  );
}

function EmptyRules() {
  return (
    <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-950">
        No notification rules yet.
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Create one rule for each event and channel combination.
      </p>
    </div>
  );
}

function createRuleFormFromRule(
  rule: AdminNotificationRule,
): AdminNotificationRuleInput {
  return {
    channel: rule.channel,
    enabled: rule.enabled,
    eventType: rule.eventType,
    notificationType: rule.notificationType,
    requiresConsent: rule.requiresConsent,
    ruleId: rule.id,
    sendMode: rule.sendMode,
    status: rule.status,
    templateId: rule.templateId,
  };
}

function createEmptyRuleForm(
  state: AdminNotificationsState,
): AdminNotificationRuleInput {
  const eventOption = state.eventOptions[0] ?? {
    eventType: "BookingCreated",
    notificationType: "BOOKING_CREATED",
  };

  return {
    channel: "EMAIL",
    enabled: false,
    eventType: eventOption.eventType,
    notificationType: eventOption.notificationType,
    requiresConsent: true,
    sendMode: "AUTOMATIC",
    status: "ACTIVE",
    templateId: null,
  };
}
