import { AdminMediaWorkspace } from "@/components/sections/admin-media/AdminMediaWorkspace";
import { getAdminMediaPreviewPage } from "@/interface/next/presenters/adminMediaPresenter";

type AdminMediaAssetPageProps = {
  params: Promise<{
    assetId: string;
  }>;
};

export default async function AdminMediaAssetPage({
  params,
}: AdminMediaAssetPageProps) {
  const { assetId } = await params;

  return (
    <AdminMediaWorkspace
      assetId={assetId}
      pageData={getAdminMediaPreviewPage()}
      view="detail"
    />
  );
}
