"use client";

import { AlertCircle } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import { AdminExtraCreateSection } from "./AdminExtraCreateSection";
import { AdminExtraDetailSection } from "./AdminExtraDetailSection";
import { useAdminExtrasStore } from "./AdminExtrasStore";
import { AdminExtrasListSection } from "./AdminExtrasListSection";
import type {
  AdminExtraActions,
  AdminExtrasPageData,
  AdminExtraView,
} from "./AdminExtraTypes";

type AdminExtrasWorkspaceProps = {
  actions: AdminExtraActions;
  extraId?: string;
  initialState: AdminExtrasPageData["state"];
  navItems: AdminExtrasPageData["navItems"];
  view: AdminExtraView;
};

export function AdminExtrasWorkspace({
  actions,
  extraId,
  initialState,
  navItems,
  view,
}: AdminExtrasWorkspaceProps) {
  const store = useAdminExtrasStore({
    actions,
    initialState,
  });

  return (
    <AdminShell activeItemId="extras" navItems={navItems}>
      <SaveStatus isSaving={store.isSaving} message={store.saveError} />
      {renderView({
        extraId,
        store,
        view,
      })}
    </AdminShell>
  );
}

function renderView({
  extraId,
  store,
  view,
}: {
  extraId?: string;
  store: ReturnType<typeof useAdminExtrasStore>;
  view: AdminExtraView;
}) {
  if (view === "list") {
    return (
      <AdminExtrasListSection
        archiveExtra={store.archiveExtra}
        state={store.state}
      />
    );
  }

  if (view === "create") {
    return <AdminExtraCreateSection createExtra={store.createExtra} />;
  }

  const extra = store.state.extras.find((currentExtra) => {
    return currentExtra.id === extraId;
  });

  if (!extra) {
    return <MissingExtra />;
  }

  return (
    <AdminExtraDetailSection
      archiveExtra={store.archiveExtra}
      extra={extra}
      mediaAssets={store.state.mediaAssets}
      updateExtra={(updater) => store.updateExtra(extra.id, updater)}
    />
  );
}

function MissingExtra() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">
        Extra not found
      </h1>
      <Surface title="Extra not found">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3 text-slate-700">
            <AlertCircle className="size-5 text-amber-600" aria-hidden="true" />
            <p className="text-sm leading-6">
              This extra does not exist or was archived from another session.
            </p>
          </div>
          <Button href="/admin/extras" variant="secondary">
            Back to extras
          </Button>
        </div>
      </Surface>
    </div>
  );
}
function SaveStatus({
  isSaving,
  message,
}: {
  isSaving: boolean;
  message: string | null;
}) {
  if (!isSaving && !message) {
    return null;
  }

  return (
    <div
      className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
      role={message ? "alert" : "status"}
    >
      {message ?? "Saving extra..."}
    </div>
  );
}
