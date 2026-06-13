import { applicationError } from "@/shared/application/ApplicationError";

import type { RotateHomeGalleryResultDto } from "./HomeGalleryDtos";
import type { HomeGalleryClock } from "./ports/HomeGalleryClock";
import type { HomeGalleryIdGenerator } from "./ports/HomeGalleryIdGenerator";
import type { HomeGalleryMediaReader } from "./ports/HomeGalleryMediaReader";
import type { HomeGalleryRepository } from "./ports/HomeGalleryRepository";
import type { HomeGalleryRotationTrigger } from "../domain/HomeGalleryComposition";
import {
  HomeGalleryComposition,
  homeGallerySlotCount,
} from "../domain/HomeGalleryComposition";
import { selectHomeGalleryRotation } from "../domain/HomeGalleryRotationPolicy";

export type RotateHomeGalleryCommand = {
  force?: boolean;
  rotationMinutes?: number;
  trigger: HomeGalleryRotationTrigger;
};

const defaultRotationMinutes = 60;
const recentCompositionLimit = 6;

export class RotateHomeGalleryUseCase {
  constructor(
    private readonly gallery: HomeGalleryRepository,
    private readonly media: HomeGalleryMediaReader,
    private readonly ids: HomeGalleryIdGenerator,
    private readonly clock: HomeGalleryClock,
  ) {}

  async execute(
    command: RotateHomeGalleryCommand,
  ): Promise<RotateHomeGalleryResultDto> {
    const now = this.clock.now();
    const current = await this.gallery.findLatestPublished();
    const force = command.force ?? false;

    if (!force && current && !current.isExpiredAt(now)) {
      const snapshot = current.toSnapshot();

      return {
        compositionId: snapshot.id,
        expiresAt: snapshot.expiresAt,
        outcome: "SKIPPED",
        publishedAt: snapshot.publishedAt,
        trigger: command.trigger,
      };
    }

    const candidates = await this.media.listReadyGalleryCandidates();

    if (candidates.length < homeGallerySlotCount) {
      throw applicationError(
        "HOME_GALLERY_NOT_ENOUGH_READY_ASSETS",
        "Upload at least five ready Gallery images before rotating the home gallery.",
      );
    }

    const compositionId = this.ids.newHomeGalleryCompositionId();
    const seed = seedForRotation(command.trigger, now, compositionId);
    const recentMediaAssetIds = await this.gallery.listRecentMediaAssetIds({
      limit: recentCompositionLimit,
    });
    const selection = selectHomeGalleryRotation({
      candidates: candidates.map((candidate) => ({
        dimensions: candidate.original,
        id: candidate.id,
      })),
      recentMediaAssetIds,
      seed,
    });
    const rotationMinutes = normalizeRotationMinutes(command.rotationMinutes);
    const expiresAt = new Date(now.getTime() + rotationMinutes * 60_000);
    const composition = HomeGalleryComposition.create({
      createdAt: now,
      expiresAt,
      id: compositionId,
      layout: selection.layout,
      mosaicVariant: selection.mosaicVariant,
      publishedAt: now,
      seed,
      slots: selection.slots.map((slot) => ({
        ...slot,
        id: this.ids.newHomeGalleryCompositionSlotId({
          compositionId,
          position: slot.position,
        }),
      })),
      trigger: command.trigger,
    });

    await this.gallery.save(composition);

    return {
      compositionId,
      expiresAt: expiresAt.toISOString(),
      outcome: "ROTATED",
      publishedAt: now.toISOString(),
      trigger: command.trigger,
    };
  }
}

function seedForRotation(
  trigger: HomeGalleryRotationTrigger,
  now: Date,
  compositionId: string,
) {
  if (trigger === "AUTOMATIC") {
    return `automatic:${truncateToHour(now).toISOString()}`;
  }

  return `manual:${now.toISOString()}:${compositionId}`;
}

function truncateToHour(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      0,
      0,
      0,
    ),
  );
}

function normalizeRotationMinutes(value: number | undefined) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return defaultRotationMinutes;
  }

  return value;
}
