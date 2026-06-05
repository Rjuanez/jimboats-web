import {
  archiveAdminExperienceAction,
  createAdminExperienceAction,
  duplicateAdminExperienceAction,
  saveAdminExperienceAction,
} from "@/interface/next/actions/adminExperienceActions";
import { getAdminExperiencesPage } from "@/interface/next/presenters/adminExperiencesPresenter";
import { AdminExperiencesWorkspace } from "@/components/sections/admin-experiences/AdminExperiencesWorkspace";
import type { AdminExperienceActions } from "@/components/sections/admin-experiences/AdminExperienceTypes";

export const dynamic = "force-dynamic";

const actions = {
  archiveExperience: archiveAdminExperienceAction,
  createExperience: createAdminExperienceAction,
  duplicateExperience: duplicateAdminExperienceAction,
  saveExperience: saveAdminExperienceAction,
} satisfies AdminExperienceActions;

export default async function AdminExperienceCancellationPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const [{ experienceId }, pageData] = await Promise.all([
    params,
    getAdminExperiencesPage(),
  ]);

  return (
    <AdminExperiencesWorkspace
      actions={actions}
      experienceId={experienceId}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="cancellation"
    />
  );
}
