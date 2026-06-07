"use client";

import { FileText, Plus, Save, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  FieldGrid,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminNotificationActions,
  AdminNotificationTemplate,
  AdminNotificationTemplateInput,
  AdminNotificationsState,
} from "./AdminNotificationTypes";

type AdminNotificationTemplatesSectionProps = {
  isSaving: boolean;
  saveTemplate: AdminNotificationActions["saveTemplate"];
  state: AdminNotificationsState;
};

export function AdminNotificationTemplatesSection({
  isSaving,
  saveTemplate,
  state,
}: AdminNotificationTemplatesSectionProps) {
  const [form, setForm] = useState<AdminNotificationTemplateInput>(() =>
    createEmptyTemplateForm(state),
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveTemplate(form);
  }

  function setEvent(eventType: string) {
    const option = state.eventOptions.find((item) => item.eventType === eventType);

    setForm((current) => ({
      ...current,
      eventType,
      notificationType: option?.notificationType ?? current.notificationType,
    }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <Surface
        description="Templates store the content used by rules. Public language fallback is never silent."
        title="Notification templates"
      >
        {state.templates.length === 0 ? (
          <EmptyTemplates />
        ) : (
          <div className="space-y-3">
            {state.templates.map((template) => (
              <TemplateRow key={template.id} template={template} />
            ))}
          </div>
        )}
      </Surface>

      <Surface
        action={
          <Button
            onClick={() => setForm(createEmptyTemplateForm(state))}
            size="sm"
            variant="secondary"
          >
            <Plus className="size-4" aria-hidden="true" />
            Reset
          </Button>
        }
        description="Create the base template, then open its detail to write translations."
        title="Create template"
      >
        <form className="space-y-4" onSubmit={submit}>
          <TextField
            label="Template id"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                templateId: event.target.value,
              }))
            }
            placeholder="booking-created-email"
            value={form.templateId}
          />
          <FieldGrid>
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
            <SelectField
              label="Channel"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  channel: event
                    .target.value as AdminNotificationTemplateInput["channel"],
                }))
              }
              value={form.channel}
            >
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
            </SelectField>
          </FieldGrid>
          <SelectField
            label="Status"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event
                  .target.value as AdminNotificationTemplateInput["status"],
              }))
            }
            value={form.status}
          >
            <option value="DRAFT">Draft</option>
            <option value="READY">Ready</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </SelectField>
          <TextField
            description="Only required for automatic WhatsApp sends through Prelude."
            disabled={form.channel !== "WHATSAPP"}
            label="Provider template ID"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                providerTemplateId: event.target.value,
              }))
            }
            placeholder="template_..."
            value={form.channel === "WHATSAPP" ? form.providerTemplateId : ""}
          />
          <TextAreaField
            description="One variable per line or comma separated."
            label="Allowed variables"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                allowedVariablesText: event.target.value,
              }))
            }
            value={form.allowedVariablesText}
          />
          <TextAreaField
            description="Published translations must use every required variable."
            label="Required variables"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                requiredVariablesText: event.target.value,
              }))
            }
            value={form.requiredVariablesText}
          />
          <Button disabled={isSaving} loading={isSaving} type="submit">
            <Save className="size-4" aria-hidden="true" />
            Save template
          </Button>
        </form>
      </Surface>
    </div>
  );
}

function TemplateRow({ template }: { template: AdminNotificationTemplate }) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={template.status === "ACTIVE" ? "emerald" : "neutral"}>
              {template.statusLabel}
            </Badge>
            <Badge tone="sky">{template.channelLabel}</Badge>
            <Badge tone="neutral">v{template.version}</Badge>
          </div>
          <div>
            <h2 className="break-words text-base font-semibold text-slate-950">
              {template.id}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {template.eventLabel}
            </p>
          </div>
          {template.missingPublishedLocales.length > 0 ? (
            <p className="flex items-start gap-2 text-sm leading-6 text-amber-700">
              <TriangleAlert
                className="mt-1 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                Missing: {template.missingPublishedLocales.join(", ")}
              </span>
            </p>
          ) : null}
          <p className="text-xs font-medium text-slate-500">
            Updated {template.updatedAtLabel}
          </p>
        </div>
        <Button
          href={`/admin/notifications/templates/${template.id}`}
          variant="secondary"
        >
          <FileText className="size-4" aria-hidden="true" />
          Open
        </Button>
      </div>
    </article>
  );
}

function EmptyTemplates() {
  return (
    <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-950">
        No notification templates yet.
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Create a draft template and then add the language content.
      </p>
    </div>
  );
}

function createEmptyTemplateForm(
  state: AdminNotificationsState,
): AdminNotificationTemplateInput {
  const eventOption = state.eventOptions[0] ?? {
    eventType: "BookingCreated",
    notificationType: "BOOKING_CREATED",
  };

  return {
    allowedVariablesText: "booking.reference\ncustomer.name",
    channel: "EMAIL",
    eventType: eventOption.eventType,
    notificationType: eventOption.notificationType,
    providerTemplateId: "",
    requiredVariablesText: "booking.reference",
    status: "DRAFT",
    templateId: "",
    translations: ["en", "es", "ca"].map((locale) => ({
      body: "",
      htmlBody: "",
      locale: locale as AdminNotificationTemplateInput["translations"][number]["locale"],
      previewText: "",
      status: "DRAFT",
      subject: "",
    })),
  };
}
