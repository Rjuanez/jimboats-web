"use client";

import { AlertCircle } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import { AdminExperienceAvailabilitySection } from "./AdminExperienceAvailabilitySection";
import { AdminExperienceContentSection } from "./AdminExperienceContentSection";
import { AdminExperienceCreateSection } from "./AdminExperienceCreateSection";
import { AdminExperienceEditorShell } from "./AdminExperienceEditorShell";
import { AdminExperienceExtrasSection } from "./AdminExperienceExtrasSection";
import { AdminExperienceMediaSection } from "./AdminExperienceMediaSection";
import { AdminExperienceOverviewSection } from "./AdminExperienceOverviewSection";
import { AdminExperiencePublishSection } from "./AdminExperiencePublishSection";
import { getExperienceReadiness } from "./AdminExperienceReadiness";
import { useAdminExperienceStore } from "./AdminExperienceStore";
import { AdminExperiencesListSection } from "./AdminExperiencesListSection";
import type {
  AdminExperienceActions,
  AdminExperiencesPageData,
  AdminExperienceView,
} from "./AdminExperienceTypes";

type AdminExperiencesWorkspaceProps = {
  actions: AdminExperienceActions;
  experienceId?: string;
  initialState: AdminExperiencesPageData["state"];
  navItems: AdminExperiencesPageData["navItems"];
  view: AdminExperienceView;
};

export function AdminExperiencesWorkspace({
  actions,
  experienceId,
  initialState,
  navItems,
  view,
}: AdminExperiencesWorkspaceProps) {
  const store = useAdminExperienceStore({
    actions,
    initialState,
  });

  return (
    <AdminShell activeItemId="experiences" navItems={navItems}>
      <SaveStatus isSaving={store.isSaving} message={store.saveError} />
      {renderView({
        experienceId,
        store,
        view,
      })}
    </AdminShell>
  );
}

function renderView({
  experienceId,
  store,
  view,
}: {
  experienceId?: string;
  store: ReturnType<typeof useAdminExperienceStore>;
  view: AdminExperienceView;
}) {
  if (view === "list") {
    return (
      <AdminExperiencesListSection
        archiveExperience={store.archiveExperience}
        duplicateExperience={store.duplicateExperience}
        state={store.state}
      />
    );
  }

  if (view === "create") {
    return (
      <AdminExperienceCreateSection createExperience={store.createExperience} />
    );
  }

  const experience = store.state.experiences.find((currentExperience) => {
    return currentExperience.id === experienceId;
  });

  if (!experience) {
    return <MissingExperience />;
  }

  const readiness = getExperienceReadiness(experience);
  const updateExperience = (
    updater: Parameters<typeof store.updateExperience>[1],
  ) => {
    store.updateExperience(experience.id, updater);
  };

  return (
    <AdminExperienceEditorShell
      activeView={view}
      experience={experience}
      readiness={readiness}
    >
      {view === "overview" ? (
        <AdminExperienceOverviewSection
          experience={experience}
          updateExperience={updateExperience}
        />
      ) : null}
      {view === "content" ? (
        <AdminExperienceContentSection
          experience={experience}
          locales={store.state.locales}
          updateExperience={updateExperience}
        />
      ) : null}
      {view === "availability" ? (
        <AdminExperienceAvailabilitySection
          experience={experience}
          updateExperience={updateExperience}
        />
      ) : null}
      {view === "extras" ? (
        <AdminExperienceExtrasSection
          experience={experience}
          extras={store.state.extras}
          updateExperience={updateExperience}
        />
      ) : null}
      {view === "media" ? (
        <AdminExperienceMediaSection
          experience={experience}
          locales={store.state.locales}
          updateExperience={updateExperience}
        />
      ) : null}
      {view === "publish" ? (
        <AdminExperiencePublishSection
          experience={experience}
          locales={store.state.locales}
          readiness={readiness}
          updateExperience={updateExperience}
        />
      ) : null}
    </AdminExperienceEditorShell>
  );
}

function MissingExperience() {
  return (
    <Surface title="Experience not found">
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-3 text-slate-700">
          <AlertCircle className="size-5 text-amber-600" aria-hidden="true" />
          <p className="text-sm leading-6">
            This experience does not exist or was archived from another session.
          </p>
        </div>
        <Button href="/admin/experiences" variant="secondary">
          Back to experiences
        </Button>
      </div>
    </Surface>
  );
}

function SaveStatus({
  isSaving,
  message,
}: {
  isSaving: boolean;
  message: string | null;
}) {
  if (!isSaving && !message) {
    return null;
  }

  return (
    <div
      className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
      role={message ? "alert" : "status"}
    >
      {message ?? "Saving changes..."}
    </div>
  );
}
