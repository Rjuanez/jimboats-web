import { ArrowLeft } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import { AdminMediaDetailSection } from "./AdminMediaDetailSection";
import { AdminMediaLibrarySection } from "./AdminMediaLibrarySection";
import type { AdminMediaPageData } from "./AdminMediaTypes";

type AdminMediaWorkspaceProps = {
  assetId?: string;
  pageData: AdminMediaPageData;
  view: "detail" | "library";
};

export function AdminMediaWorkspace({
  assetId,
  pageData,
  view,
}: AdminMediaWorkspaceProps) {
  const selectedAsset = assetId
    ? pageData.assets.find((asset) => asset.id === assetId)
    : undefined;

  return (
    <AdminShell activeItemId="media" navItems={pageData.navItems}>
      {view === "detail" ? (
        selectedAsset ? (
          <AdminMediaDetailSection asset={selectedAsset} />
        ) : (
          <MediaAssetNotFound />
        )
      ) : (
        <AdminMediaLibrarySection assets={pageData.assets} />
      )}
    </AdminShell>
  );
}

function MediaAssetNotFound() {
  return (
    <div className="space-y-5">
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
