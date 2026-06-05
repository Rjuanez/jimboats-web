"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  AdminMediaActions,
  AdminMediaMetadataInput,
  AdminMediaPageData,
} from "./AdminMediaTypes";

export function useAdminMediaStore({
  actions,
  initialData,
}: {
  actions: AdminMediaActions;
  initialData: AdminMediaPageData;
}) {
  const [pageData, setPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadAsset = useCallback(
    async (input: FormData) => {
      setIsSaving(true);
      setMessage(null);
      setError(null);

      try {
        const result = await actions.uploadAsset(input);

        if (!result.ok) {
          setError(result.message);
          return null;
        }

        setPageData(result.data.state);
        setMessage("Media upload queued for processing.");

        return result.data.assetId;
      } catch {
        setError("Unexpected error while uploading media.");

        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [actions],
  );

  const updateMetadata = useCallback(
    async (input: AdminMediaMetadataInput) => {
      setIsSaving(true);
      setMessage(null);
      setError(null);

      try {
        const result = await actions.updateMetadata(input);

        if (!result.ok) {
          setError(result.message);
          return false;
        }

        setPageData(result.data.state);
        setMessage("Media metadata saved.");

        return true;
      } catch {
        setError("Unexpected error while saving media metadata.");

        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [actions],
  );

  const requestReprocess = useCallback(
    async (assetId: string) => {
      setIsSaving(true);
      setMessage(null);
      setError(null);

      try {
        const result = await actions.requestReprocess({ assetId });

        if (!result.ok) {
          setError(result.message);
          return false;
        }

        setPageData(result.data.state);
        setMessage("Media reprocess job queued.");

        return true;
      } catch {
        setError("Unexpected error while queuing media processing.");

        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [actions],
  );

  return useMemo(
    () => ({
      error,
      isSaving,
      message,
      pageData,
      requestReprocess,
      updateMetadata,
      uploadAsset,
    }),
    [
      error,
      isSaving,
      message,
      pageData,
      requestReprocess,
      updateMetadata,
      uploadAsset,
    ],
  );
}
