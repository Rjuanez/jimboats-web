"use client";

import { Eye, Languages, Save } from "lucide-react";
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
import { cn } from "@/design/variants";

import type {
  AdminNotificationActions,
  AdminNotificationLocale,
  AdminNotificationPreview,
  AdminNotificationTemplate,
  AdminNotificationTemplateInput,
  AdminNotificationTemplateTranslationInput,
  AdminNotificationsState,
} from "./AdminNotificationTypes";

type AdminNotificationTemplateDetailSectionProps = {
  isSaving: boolean;
  preview: AdminNotificationPreview | null;
  previewTemplate: AdminNotificationActions["previewTemplate"];
  saveTemplate: AdminNotificationActions["saveTemplate"];
  state: AdminNotificationsState;
  template: AdminNotificationTemplate;
};

export function AdminNotificationTemplateDetailSection({
  isSaving,
  preview,
  previewTemplate,
  saveTemplate,
  state,
  template,
}: AdminNotificationTemplateDetailSectionProps) {
  const [form, setForm] = useState<AdminNotificationTemplateInput>(() =>
    createTemplateForm(template),
  );
  const [activeLocale, setActiveLocale] = useState<AdminNotificationLocale>("en");
  const activeTranslation = form.translations.find(
    (translation) => translation.locale === activeLocale,
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveTemplate(form);
  }

  async function renderPreview() {
    if (!activeTranslation) {
      return;
    }

    await previewTemplate({
      bookingId: "",
      draftBody: activeTranslation.body,
      draftPreviewText: activeTranslation.previewText,
      draftSubject: activeTranslation.subject,
      fixtureKey: fixtureKeyForEvent(form.eventType),
      locale: activeTranslation.locale,
      templateId: form.templateId,
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={template.status === "ACTIVE" ? "emerald" : "neutral"}>
              {template.statusLabel}
            </Badge>
            <Badge tone="sky">{template.channelLabel}</Badge>
            <Badge tone="neutral">v{template.version}</Badge>
          </div>
          <h2 className="mt-3 break-words text-2xl font-semibold text-slate-950">
            {template.id}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {template.eventLabel}
          </p>
        </div>
        <Button href="/admin/notifications/templates" variant="secondary">
          Back to templates
        </Button>
      </div>

      <form className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]" onSubmit={submit}>
        <div className="space-y-5">
          <Surface
            description="Template metadata controls which rules can use this content."
            title="Template settings"
          >
            <FieldGrid columns={3}>
              <SelectField
                label="Event"
                onChange={(event) => {
                  const eventOption = state.eventOptions.find(
                    (option) => option.eventType === event.target.value,
                  );

                  setForm((current) => ({
                    ...current,
                    eventType: event.target.value,
                    notificationType:
                      eventOption?.notificationType ?? current.notificationType,
                  }));
                }}
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
            </FieldGrid>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                description="Required for automatic WhatsApp sends through Prelude."
                disabled={form.channel !== "WHATSAPP"}
                label="Provider template ID"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    providerTemplateId: event.target.value,
                  }))
                }
                value={form.channel === "WHATSAPP" ? form.providerTemplateId : ""}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextAreaField
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
                label="Required variables"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    requiredVariablesText: event.target.value,
                  }))
                }
                value={form.requiredVariablesText}
              />
            </div>
          </Surface>

          <Surface
            action={
              <div className="flex flex-wrap gap-2">
                {form.translations.map((translation) => (
                  <button
                    aria-pressed={translation.locale === activeLocale}
                    className={cn(
                      "inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
                      translation.locale === activeLocale
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    )}
                    key={translation.locale}
                    onClick={() => setActiveLocale(translation.locale)}
                    type="button"
                  >
                    <Languages className="size-4" aria-hidden="true" />
                    {translation.locale.toUpperCase()}
                  </button>
                ))}
              </div>
            }
            description="Write each language explicitly. Missing published languages will be shown as warnings."
            title="Translations"
          >
            {activeTranslation ? (
              <TranslationEditor
                channel={form.channel}
                translation={activeTranslation}
                updateTranslation={(translation) =>
                  setForm((current) => ({
                    ...current,
                    translations: current.translations.map((item) =>
                      item.locale === translation.locale ? translation : item,
                    ),
                  }))
                }
              />
            ) : null}
          </Surface>
        </div>

        <div className="space-y-5">
          <Surface title="Preview">
            <div className="space-y-4">
              <Button
                disabled={isSaving || !activeTranslation}
                loading={isSaving}
                onClick={renderPreview}
                type="button"
                variant="secondary"
              >
                <Eye className="size-4" aria-hidden="true" />
                Render preview
              </Button>
              {preview ? (
                <PreviewPanel preview={preview} />
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  Preview will render with a local booking fixture.
                </p>
              )}
            </div>
          </Surface>

          <Surface title="Save">
            <div className="space-y-4">
              <p className="text-sm leading-6 text-slate-600">
                Saving increments the template version and refreshes rules that
                depend on it.
              </p>
              <Button disabled={isSaving} loading={isSaving} type="submit">
                <Save className="size-4" aria-hidden="true" />
                Save template
              </Button>
            </div>
          </Surface>
        </div>
      </form>
    </div>
  );
}

function TranslationEditor({
  channel,
  translation,
  updateTranslation,
}: {
  channel: AdminNotificationTemplateInput["channel"];
  translation: AdminNotificationTemplateTranslationInput;
  updateTranslation: (
    translation: AdminNotificationTemplateTranslationInput,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <FieldGrid>
        <SelectField
          label="Translation status"
          onChange={(event) =>
            updateTranslation({
              ...translation,
              status: event
                .target.value as AdminNotificationTemplateTranslationInput["status"],
            })
          }
          value={translation.status}
        >
          <option value="DRAFT">Draft</option>
          <option value="READY">Ready</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </SelectField>
        <TextAreaField
          disabled={channel !== "EMAIL"}
          label="Subject"
          onChange={(event) =>
            updateTranslation({
              ...translation,
              subject: event.target.value,
            })
          }
          value={channel === "EMAIL" ? translation.subject : ""}
        />
      </FieldGrid>
      <TextAreaField
        label="Preview text"
        onChange={(event) =>
          updateTranslation({
            ...translation,
            previewText: event.target.value,
          })
        }
        value={translation.previewText}
      />
      <TextAreaField
        className="min-h-64"
        label="Body"
        onChange={(event) =>
          updateTranslation({
            ...translation,
            body: event.target.value,
          })
        }
        value={translation.body}
      />
    </div>
  );
}

function PreviewPanel({ preview }: { preview: AdminNotificationPreview }) {
  return (
    <div className="space-y-4">
      {preview.renderedSubject ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Subject
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-950">
            {preview.renderedSubject}
          </p>
        </div>
      ) : null}
      {preview.renderedPreviewText ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Preview text
          </p>
          <p className="mt-1 break-words text-sm text-slate-700">
            {preview.renderedPreviewText}
          </p>
        </div>
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Body
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
          {preview.renderedBody}
        </p>
      </div>
      {preview.warnings.length > 0 || preview.missingVariables.length > 0 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-800">
          {[...preview.warnings, ...preview.missingVariables].join(" ")}
        </div>
      ) : null}
    </div>
  );
}

function createTemplateForm(
  template: AdminNotificationTemplate,
): AdminNotificationTemplateInput {
  return {
    allowedVariablesText: template.allowedVariablesText,
    channel: template.channel,
    eventType: template.eventType,
    notificationType: template.notificationType,
    providerTemplateId: template.providerTemplateId,
    requiredVariablesText: template.requiredVariablesText,
    status: template.status,
    templateId: template.id,
    translations: template.translations.map((translation) => ({
      body: translation.body,
      locale: translation.locale,
      previewText: translation.previewText,
      status: translation.status,
      subject: translation.subject,
    })),
  };
}

function fixtureKeyForEvent(eventType: string) {
  return eventType
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/due$/i, "due")
    .toLowerCase();
}
