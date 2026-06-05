import { AdminMediaWorkspace } from "@/components/sections/admin-media/AdminMediaWorkspace";
import type { AdminMediaActions } from "@/components/sections/admin-media/AdminMediaTypes";
import {
  requestAdminMediaReprocessAction,
  updateAdminMediaAssetMetadataAction,
  uploadAdminMediaAssetAction,
} from "@/interface/next/actions/adminMediaActions";
import { getAdminMediaPage } from "@/interface/next/presenters/adminMediaPresenter";

export const dynamic = "force-dynamic";

const actions = {
  requestReprocess: requestAdminMediaReprocessAction,
  updateMetadata: updateAdminMediaAssetMetadataAction,
  uploadAsset: uploadAdminMediaAssetAction,
} satisfies AdminMediaActions;

type AdminMediaAssetPageProps = {
  params: Promise<{
    assetId: string;
  }>;
};

export default async function AdminMediaAssetPage({
  params,
}: AdminMediaAssetPageProps) {
  const { assetId } = await params;
  const pageData = await getAdminMediaPage();

  return (
    <AdminMediaWorkspace
      actions={actions}
      assetId={assetId}
      pageData={pageData}
      view="detail"
    />
  );
}
