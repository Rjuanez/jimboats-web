import { AdminShell } from "@/components/layout/AdminShell";
import { adminNavItems } from "@/components/layout/AdminNavigation";
import { AdminAvailabilityWorkspace } from "@/components/sections/admin-availability/AdminAvailabilityWorkspace";
import { getAdminAvailability } from "@/interface/next/presenters/adminAvailabilityPresenter";
import { saveAdminAvailability } from "@/interface/next/actions/adminAvailabilityActions";
export const dynamic = "force-dynamic";
export default async function AvailabilityPage() {
  const experiences = await getAdminAvailability();
  return (
    <AdminShell activeItemId="availability" navItems={adminNavItems}>
      <AdminAvailabilityWorkspace
        experiences={experiences}
        save={saveAdminAvailability}
      />
    </AdminShell>
  );
}
