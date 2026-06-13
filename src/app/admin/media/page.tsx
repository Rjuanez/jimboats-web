import { AdminMediaWorkspace } from "@/components/sections/admin-media/AdminMediaWorkspace";
import type { AdminMediaActions } from "@/components/sections/admin-media/AdminMediaTypes";
import {
  requestAdminMediaReprocessAction,
  rotateAdminHomeGalleryAction,
  updateAdminMediaAssetMetadataAction,
  uploadAdminMediaAssetAction,
} from "@/interface/next/actions/adminMediaActions";
import { getAdminMediaPage } from "@/interface/next/presenters/adminMediaPresenter";

export const dynamic = "force-dynamic";

const actions = {
  requestReprocess: requestAdminMediaReprocessAction,
  rotateHomeGallery: rotateAdminHomeGalleryAction,
  updateMetadata: updateAdminMediaAssetMetadataAction,
  uploadAsset: uploadAdminMediaAssetAction,
} satisfies AdminMediaActions;

export default async function AdminMediaPage() {
  const pageData = await getAdminMediaPage();

  return (
    <AdminMediaWorkspace actions={actions} pageData={pageData} view="library" />
  );
}
