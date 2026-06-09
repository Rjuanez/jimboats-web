"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  AdminMediaActionResult,
  AdminMediaMetadataInput,
  AdminMediaPageData,
} from "@/components/sections/admin-media/AdminMediaTypes";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

import { revalidatePublicBookingCatalogCache } from "../cache/publicBookingCatalogCache";
import { presentAdminMediaList } from "../presenters/adminMediaPresenter";
import {
  parseAdminMediaAssetId,
  parseAdminMediaMetadata,
  parseAdminMediaUploadFormData,
} from "../validators/adminMediaValidators";

export async function uploadAdminMediaAssetAction(input: FormData): Promise<
  AdminMediaActionResult<{
    assetId: string;
    state: AdminMediaPageData;
  }>
> {
  try {
    const command = await parseAdminMediaUploadFormData(input);
    const container = getContainer();
    const result = await container.adminMedia.uploadAsset(command);
    revalidatePublicBookingCatalogCache();

    return ok({
      assetId: result.asset.id,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function updateAdminMediaAssetMetadataAction(
  input: AdminMediaMetadataInput,
): Promise<
  AdminMediaActionResult<{
    state: AdminMediaPageData;
  }>
> {
  try {
    const command = parseAdminMediaMetadata(input);
    const container = getContainer();

    await container.adminMedia.updateMetadata(command);
    revalidatePublicBookingCatalogCache();

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function requestAdminMediaReprocessAction(input: {
  assetId: string;
}): Promise<
  AdminMediaActionResult<{
    state: AdminMediaPageData;
  }>
> {
  try {
    const command = parseAdminMediaAssetId(input);
    const container = getContainer();

    await container.adminMedia.requestReprocess(command);
    revalidatePublicBookingCatalogCache();

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

async function loadState(container: ReturnType<typeof getContainer>) {
  const [mediaList, experiencesWorkspace, extrasWorkspace] = await Promise.all([
    container.adminMedia.listAssets(),
    container.adminExperiences.getWorkspace(),
    container.adminExtras.getWorkspace(),
  ]);

  return presentAdminMediaList(
    mediaList,
    experiencesWorkspace,
    extrasWorkspace,
  );
}

function ok<TData>(data: TData): AdminMediaActionResult<TData> {
  return {
    data,
    ok: true,
  };
}

function failure<TData = never>(error: unknown): AdminMediaActionResult<TData> {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid media input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while saving media.",
    ok: false,
  };
}
