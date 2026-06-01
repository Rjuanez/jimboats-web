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

export default async function AdminNewExperiencePage() {
  const pageData = await getAdminExperiencesPage();

  return (
    <AdminExperiencesWorkspace
      actions={actions}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="create"
    />
  );
}
