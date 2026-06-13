"use client";

import { ArrowLeft } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import { AdminMediaDetailSection } from "./AdminMediaDetailSection";
import { AdminMediaLibrarySection } from "./AdminMediaLibrarySection";
import { useAdminMediaStore } from "./AdminMediaStore";
import type { AdminMediaActions, AdminMediaPageData } from "./AdminMediaTypes";

type AdminMediaWorkspaceProps = {
  actions: AdminMediaActions;
  assetId?: string;
  pageData: AdminMediaPageData;
  view: "detail" | "library";
};

export function AdminMediaWorkspace({
  actions,
  assetId,
  pageData,
  view,
}: AdminMediaWorkspaceProps) {
  const store = useAdminMediaStore({
    actions,
    initialData: pageData,
  });
  const selectedAsset = assetId
    ? store.pageData.assets.find((asset) => asset.id === assetId)
    : undefined;

  return (
    <AdminShell activeItemId="media" navItems={store.pageData.navItems}>
      <SaveStatus
        error={store.error}
        isSaving={store.isSaving}
        message={store.message}
      />
      {view === "detail" ? (
        selectedAsset ? (
          <AdminMediaDetailSection
            asset={selectedAsset}
            isSaving={store.isSaving}
            requestReprocess={store.requestReprocess}
            updateMetadata={store.updateMetadata}
          />
        ) : (
          <MediaAssetNotFound />
        )
      ) : (
        <AdminMediaLibrarySection
          assets={store.pageData.assets}
          isSaving={store.isSaving}
          rotateHomeGallery={store.rotateHomeGallery}
          uploadAsset={store.uploadAsset}
        />
      )}
    </AdminShell>
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
      role={error ? "alert" : "status"}
    >
      {error ?? message ?? "Saving media..."}
    </div>
  );
}

function MediaAssetNotFound() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">Asset not found</h1>
      <Button href="/admin/media" variant="secondary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Media library
      </Button>
      <Surface
        title="Asset not found"
        description="The selected media asset is not available in this workspace."
      >
        <p className="text-sm leading-6 text-slate-600">
          Open the media library to choose another asset.
        </p>
      </Surface>
    </div>
  );
}
