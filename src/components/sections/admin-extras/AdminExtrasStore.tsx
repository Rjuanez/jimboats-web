"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AdminExtra,
  AdminExtraActions,
  AdminExtraCreateInput,
  AdminExtrasState,
} from "./AdminExtraTypes";

export function useAdminExtrasStore({
  actions,
  initialState,
}: {
  actions: AdminExtraActions;
  initialState: AdminExtrasState;
}) {
  const [state, setState] = useState(initialState);
  const [pendingSave, setPendingSave] = useState<AdminExtra | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingSave) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSaving(true);
      actions
        .saveExtra(pendingSave)
        .then((result) => {
          if (!result.ok) {
            setSaveError(result.message);
            return;
          }

          setSaveError(null);
          setState(result.data.state);
        })
        .catch(() => {
          setSaveError("Unexpected error while saving the extra.");
        })
        .finally(() => {
          setIsSaving(false);
        });
    }, 650);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [actions, pendingSave]);

  const updateExtra = useCallback(
    (extraId: string, updater: (extra: AdminExtra) => AdminExtra) => {
      const currentExtra = state.extras.find((extra) => {
        return extra.id === extraId;
      });

      if (!currentExtra) {
        return;
      }

      const nextExtra = updater(currentExtra);

      setPendingSave(nextExtra);
      setState((currentState) => ({
        ...currentState,
        extras: currentState.extras.map((extra) => {
          if (extra.id !== extraId) {
            return extra;
          }

          return nextExtra;
        }),
      }));
    },
    [state.extras],
  );

  const createExtra = useCallback(
    async (input: AdminExtraCreateInput) => {
      const result = await actions.createExtra(input);

      if (!result.ok) {
        setSaveError(result.message);
        throw new Error(result.message);
      }

      setSaveError(null);
      setState(result.data.state);

      return result.data.extraId;
    },
    [actions],
  );

  const archiveExtra = useCallback(
    async (extraId: string) => {
      setPendingSave(null);
      setState((currentState) => ({
        ...currentState,
        extras: currentState.extras.map((extra) => {
          if (extra.id !== extraId) {
            return extra;
          }

          return {
            ...extra,
            status: "archived",
          };
        }),
      }));

      const result = await actions.archiveExtra({
        extraId,
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
      archiveExtra,
      createExtra,
      isSaving,
      saveError,
      state,
      updateExtra,
    }),
    [archiveExtra, createExtra, isSaving, saveError, state, updateExtra],
  );
}
