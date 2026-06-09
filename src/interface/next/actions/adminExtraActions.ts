"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  AdminExtra,
  AdminExtraActionResult,
  AdminExtraCreateInput,
  AdminExtrasState,
} from "@/components/sections/admin-extras/AdminExtraTypes";
import type { AdminMediaListDto } from "@/modules/media-library/application/AdminMediaDtos";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

import { revalidatePublicBookingCatalogCache } from "../cache/publicBookingCatalogCache";
import { presentAdminExtrasWorkspace } from "../presenters/adminExtrasPresenter";
import {
  parseAdminCreateExtra,
  parseAdminExtra,
  parseAdminExtraId,
} from "../validators/adminExtraValidators";

export async function createAdminExtraAction(
  input: AdminExtraCreateInput,
): Promise<
  AdminExtraActionResult<{
    extraId: string;
    state: AdminExtrasState;
  }>
> {
  try {
    const commandInput = parseAdminCreateExtra(input);
    const container = getContainer();
    const workspace = await container.adminExtras.getWorkspace();
    const extraId = makeUniqueSlug(
      slugify(commandInput.name) || "extra",
      workspace.extras.map((extra) => extra.id),
    );

    await container.adminExtras.createExtra({
      defaultNoticeMinutes: commandInput.defaultNoticeHours * 60,
      id: extraId,
      name: commandInput.name,
      price: toMoney(commandInput.price),
      status: "DRAFT",
    });
    revalidatePublicBookingCatalogCache();

    return ok({
      extraId,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function saveAdminExtraAction(input: AdminExtra): Promise<
  AdminExtraActionResult<{
    state: AdminExtrasState;
  }>
> {
  try {
    const extra = parseAdminExtra(input);
    const container = getContainer();
    const mediaList = await container.adminMedia.listAssets();

    await container.adminExtras.updateExtra({
      defaultNoticeMinutes: extra.defaultNoticeHours * 60,
      extraId: extra.id,
      name: extra.name,
      price: toMoney(extra.price),
      primaryMediaAssetId: mediaAssetIdFromExtra(extra, mediaList),
      status: extraStatusToApplication(extra.status),
    });
    revalidatePublicBookingCatalogCache();

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function archiveAdminExtraAction(input: {
  extraId: string;
}): Promise<
  AdminExtraActionResult<{
    state: AdminExtrasState;
  }>
> {
  try {
    const { extraId } = parseAdminExtraId(input);
    const container = getContainer();

    await container.adminExtras.archiveExtra({
      extraId,
    });
    revalidatePublicBookingCatalogCache();

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

async function loadState(container: ReturnType<typeof getContainer>) {
  const [workspace, mediaList] = await Promise.all([
    container.adminExtras.getWorkspace(),
    container.adminMedia.listAssets(),
  ]);

  return presentAdminExtrasWorkspace(workspace, mediaList);
}

function mediaAssetIdFromExtra(
  extra: AdminExtra,
  mediaList: AdminMediaListDto,
) {
  const assetId = extra.media.assetId?.trim() || null;

  if (!assetId) {
    return null;
  }

  const asset = mediaList.assets.find((candidate) => {
    return candidate.id === assetId;
  });

  if (!asset) {
    throw new ApplicationError(
      "MEDIA_ASSET_NOT_FOUND",
      "Selected media asset was not found.",
    );
  }

  if (asset.collection !== "EXTRAS") {
    throw new DomainError(
      "MEDIA_ASSET_COLLECTION_INVALID",
      "Extra images must come from the Extras media collection.",
    );
  }

  return asset.id;
}

function toMoney(amount: number) {
  return {
    amountMinor: Math.round(amount * 100),
    currency: "EUR" as const,
  };
}

function extraStatusToApplication(status: AdminExtra["status"]) {
  if (status === "archived") {
    return "ARCHIVED" as const;
  }

  if (status === "active") {
    return "ACTIVE" as const;
  }

  return "DRAFT" as const;
}

function ok<TData>(data: TData): AdminExtraActionResult<TData> {
  return {
    data,
    ok: true,
  };
}

function failure<TData = never>(error: unknown): AdminExtraActionResult<TData> {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid admin extra input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while saving the extra.",
    ok: false,
  };
}

function makeUniqueSlug(baseSlug: string, existingIds: string[]) {
  const usedIds = new Set(existingIds);

  if (!usedIds.has(baseSlug)) {
    return baseSlug;
  }

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${baseSlug}-${index}`;

    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }

  return `${baseSlug}-new`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
