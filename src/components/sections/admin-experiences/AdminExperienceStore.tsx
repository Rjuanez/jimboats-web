"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AdminExperience,
  AdminExperienceActions,
  AdminExperienceCreateInput,
  AdminExperiencesState,
} from "./AdminExperienceTypes";

export function useAdminExperienceStore({
  actions,
  initialState,
}: {
  actions: AdminExperienceActions;
  initialState: AdminExperiencesState;
}) {
  const [state, setState] = useState(initialState);
  const [pendingSave, setPendingSave] = useState<AdminExperience | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingSave) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSaving(true);
      actions
        .saveExperience(pendingSave)
        .then((result) => {
          if (!result.ok) {
            setSaveError(result.message);
            return;
          }

          setSaveError(null);
        })
        .catch(() => {
          setSaveError("Unexpected error while saving the experience.");
        })
        .finally(() => {
          setIsSaving(false);
        });
    }, 650);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [actions, pendingSave]);

  const updateExperience = useCallback(
    (
      experienceId: string,
      updater: (experience: AdminExperience) => AdminExperience,
    ) => {
      const currentExperience = state.experiences.find((experience) => {
        return experience.id === experienceId;
      });

      if (!currentExperience) {
        return;
      }

      const nextExperience = updater(currentExperience);

      setPendingSave(nextExperience);
      setState((currentState) => ({
        ...currentState,
        experiences: currentState.experiences.map((experience) => {
          if (experience.id !== experienceId) {
            return experience;
          }

          return nextExperience;
        }),
      }));
    },
    [state.experiences],
  );

  const createExperience = useCallback(
    async (input: AdminExperienceCreateInput) => {
      const result = await actions.createExperience(input);

      if (!result.ok) {
        setSaveError(result.message);
        throw new Error(result.message);
      }

      setSaveError(null);
      setState(result.data.state);

      return result.data.experienceId;
    },
    [actions],
  );

  const duplicateExperience = useCallback(
    async (experienceId: string) => {
      const result = await actions.duplicateExperience({
        experienceId,
      });

      if (!result.ok) {
        setSaveError(result.message);
        return experienceId;
      }

      setSaveError(null);
      setState(result.data.state);

      return result.data.experienceId;
    },
    [actions],
  );

  const archiveExperience = useCallback(
    async (experienceId: string) => {
      setPendingSave(null);
      setState((currentState) => ({
        ...currentState,
        experiences: currentState.experiences.map((experience) => {
          if (experience.id !== experienceId) {
            return experience;
          }

          return {
            ...experience,
            status: "archived",
          };
        }),
      }));

      const result = await actions.archiveExperience({
        experienceId,
      });

      if (!result.ok) {
        setSaveError(result.message);
        return;
      }

      setSaveError(null);
      setState(result.data.state);
    },
    [actions],
  );

  return useMemo(
    () => ({
      archiveExperience,
      createExperience,
      duplicateExperience,
      isSaving,
      saveError,
      state,
      updateExperience,
    }),
    [
      archiveExperience,
      createExperience,
      duplicateExperience,
      isSaving,
      saveError,
      state,
      updateExperience,
    ],
  );
}
