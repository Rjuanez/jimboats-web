"use client";

import { AlertCircle, Bell, FileText, ListChecks, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/design/variants";

import { AdminNotificationLogsSection } from "./AdminNotificationLogsSection";
import { AdminNotificationRulesSection } from "./AdminNotificationRulesSection";
import { AdminNotificationTemplateDetailSection } from "./AdminNotificationTemplateDetailSection";
import { AdminNotificationTemplatesSection } from "./AdminNotificationTemplatesSection";
import type {
  AdminNotificationActions,
  AdminNotificationPreview,
  AdminNotificationPreviewInput,
  AdminNotificationRuleInput,
  AdminNotificationsPageData,
  AdminNotificationsState,
  AdminNotificationsView,
  AdminNotificationSendDeliveryInput,
  AdminNotificationTemplateInput,
} from "./AdminNotificationTypes";

type AdminNotificationsWorkspaceProps = {
  actions: AdminNotificationActions;
  initialState: AdminNotificationsPageData["state"];
  navItems: AdminNotificationsPageData["navItems"];
  templateId?: string;
  view: AdminNotificationsView;
};

export function AdminNotificationsWorkspace({
  actions,
  initialState,
  navItems,
  templateId,
  view,
}: AdminNotificationsWorkspaceProps) {
  const [state, setState] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminNotificationPreview | null>(null);

  async function saveRule(input: AdminNotificationRuleInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.saveRule(input);

    if (result.ok) {
      setState(result.data.state);
      setMessage("Notification rule saved.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  async function saveTemplate(input: AdminNotificationTemplateInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.saveTemplate(input);

    if (result.ok) {
      setState(result.data.state);
      setMessage("Notification template saved.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  async function previewTemplate(input: AdminNotificationPreviewInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.previewTemplate(input);

    if (result.ok) {
      setPreview(result.data);
      setMessage("Preview rendered.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  async function sendDelivery(input: AdminNotificationSendDeliveryInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.sendDelivery(input);

    if (result.ok) {
      setState(result.data.state);
      setMessage("Notification marked as sent.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  return (
    <AdminShell activeItemId="notifications" navItems={navItems}>
      <SaveStatus error={error} isSaving={isSaving} message={message} />
      <div className="space-y-5">
        <NotificationsHeader state={state} />
        <NotificationViewTabs activeView={view} />
        {renderView({
          isSaving,
          preview,
          previewTemplate,
          saveRule,
          saveTemplate,
          sendDelivery,
          state,
          templateId,
          view,
        })}
      </div>
    </AdminShell>
  );
}

function renderView({
  isSaving,
  preview,
  previewTemplate,
  saveRule,
  saveTemplate,
  sendDelivery,
  state,
  templateId,
  view,
}: {
  isSaving: boolean;
  preview: AdminNotificationPreview | null;
  previewTemplate: AdminNotificationActions["previewTemplate"];
  saveRule: AdminNotificationActions["saveRule"];
  saveTemplate: AdminNotificationActions["saveTemplate"];
  sendDelivery: AdminNotificationActions["sendDelivery"];
  state: AdminNotificationsState;
  templateId?: string;
  view: AdminNotificationsView;
}) {
  if (view === "rules") {
    return (
      <AdminNotificationRulesSection
        isSaving={isSaving}
        saveRule={saveRule}
        state={state}
      />
    );
  }

  if (view === "templates") {
    return (
      <AdminNotificationTemplatesSection
        isSaving={isSaving}
        saveTemplate={saveTemplate}
        state={state}
      />
    );
  }

  if (view === "logs") {
    return (
      <AdminNotificationLogsSection
        isSaving={isSaving}
        sendDelivery={sendDelivery}
        state={state}
      />
    );
  }

  const template = state.templates.find((item) => item.id === templateId);

  if (!template) {
    return <MissingTemplate />;
  }

  return (
    <AdminNotificationTemplateDetailSection
      isSaving={isSaving}
      preview={preview}
      previewTemplate={previewTemplate}
      saveTemplate={saveTemplate}
      state={state}
      template={template}
    />
  );
}

function NotificationsHeader({ state }: { state: AdminNotificationsState }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
          Communications
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Notifications
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Booking messages, consent-aware channels and editable multilingual
          templates.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[36rem] xl:grid-cols-4">
        <MetricTile label="Active rules" value={state.summary.activeRules} />
        <MetricTile
          label="Manual review"
          value={state.summary.manualReviewDeliveries}
        />
        <MetricTile
          label="Template warnings"
          value={state.summary.templateWarnings}
        />
        <MetricTile label="Failed sends" value={state.summary.failedDeliveries} />
      </div>
    </div>
  );
}

function NotificationViewTabs({
  activeView,
}: {
  activeView: AdminNotificationsView;
}) {
  const tabs = [
    {
      href: "/admin/notifications/rules",
      icon: ListChecks,
      id: "rules",
      label: "Rules",
    },
    {
      href: "/admin/notifications/templates",
      icon: FileText,
      id: "templates",
      label: "Templates",
    },
    {
      href: "/admin/notifications/logs",
      icon: MailCheck,
      id: "logs",
      label: "Logs",
    },
  ] as const;

  return (
    <nav
      aria-label="Notification views"
      className="overflow-x-auto border-b border-slate-200"
    >
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeView === tab.id ||
            (activeView === "template-detail" && tab.id === "templates");

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-t-md border border-b-0 px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
                isActive
                  ? "border-slate-200 bg-white text-slate-950"
                  : "border-transparent text-slate-600 hover:bg-white hover:text-slate-950",
              )}
              href={tab.href}
              key={tab.id}
            >
              <Icon className="size-4" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MissingTemplate() {
  return (
    <Surface title="Template not found">
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-3 text-slate-700">
          <AlertCircle className="size-5 text-amber-600" aria-hidden="true" />
          <p className="text-sm leading-6">
            This template does not exist or was changed from another session.
          </p>
        </div>
        <Button href="/admin/notifications/templates" variant="secondary">
          <Bell className="size-4" aria-hidden="true" />
          Back to templates
        </Button>
      </div>
    </Surface>
  );
}

function SaveStatus({
  error,
  isSaving,
  message,
}: {
  error: string | null;
  isSaving: boolean;
  message: string | null;
}) {
  if (!isSaving && !message && !error) {
    return null;
  }

  return (
    <div
      className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
      role={error || message ? "alert" : "status"}
    >
      {error ?? message ?? "Saving notifications..."}
    </div>
  );
}
