import { AdminMediaWorkspace } from "@/components/sections/admin-media/AdminMediaWorkspace";
import { getAdminMediaPreviewPage } from "@/interface/next/presenters/adminMediaPresenter";

export default function AdminMediaPage() {
  return (
    <AdminMediaWorkspace pageData={getAdminMediaPreviewPage()} view="library" />
  );
}
