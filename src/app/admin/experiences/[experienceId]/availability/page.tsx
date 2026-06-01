import { AdminExperiencesWorkspace } from "@/components/sections/admin-experiences/AdminExperiencesWorkspace";
import type { AdminExperienceActions } from "@/components/sections/admin-experiences/AdminExperienceTypes";
import {
  archiveAdminExperienceAction,
  createAdminExperienceAction,
  duplicateAdminExperienceAction,
  saveAdminExperienceAction,
} from "@/interface/next/actions/adminExperienceActions";
import { getAdminExperiencesPage } from "@/interface/next/presenters/adminExperiencesPresenter";

export const dynamic = "force-dynamic";

const actions = {
  archiveExperience: archiveAdminExperienceAction,
  createExperience: createAdminExperienceAction,
  duplicateExperience: duplicateAdminExperienceAction,
  saveExperience: saveAdminExperienceAction,
} satisfies AdminExperienceActions;

type AdminExperienceAvailabilityPageProps = {
  params: Promise<{
    experienceId: string;
  }>;
};

export default async function AdminExperienceAvailabilityPage({
  params,
}: AdminExperienceAvailabilityPageProps) {
  const { experienceId } = await params;
  const pageData = await getAdminExperiencesPage();

  return (
    <AdminExperiencesWorkspace
      actions={actions}
      experienceId={experienceId}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="availability"
    />
  );
}
