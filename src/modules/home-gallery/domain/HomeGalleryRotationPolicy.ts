import { domainError } from "@/shared/domain/DomainError";

import {
  homeGallerySlotCount,
  homeGallerySlotKeys,
  type HomeGalleryLayout,
  type HomeGalleryMosaicVariant,
  type HomeGallerySlotOrientation,
} from "./HomeGalleryComposition";

export type HomeGalleryRotationCandidate = {
  dimensions: {
    height: number;
    width: number;
  };
  id: string;
};

export type HomeGalleryRotationSlot = {
  mediaAssetId: string;
  orientation: HomeGallerySlotOrientation;
  position: number;
  slotKey: (typeof homeGallerySlotKeys)[number];
};

export type HomeGalleryRotationSelection = {
  layout: HomeGalleryLayout;
  mosaicVariant: HomeGalleryMosaicVariant;
  slots: HomeGalleryRotationSlot[];
};

type OrientedCandidate = HomeGalleryRotationCandidate & {
  orientation: HomeGallerySlotOrientation;
  score: number;
};

export function selectHomeGalleryRotation(input: {
  candidates: HomeGalleryRotationCandidate[];
  recentMediaAssetIds?: string[];
  seed: string;
}): HomeGalleryRotationSelection {
  const seed = input.seed.trim();

  if (!seed) {
    throw domainError(
      "HOME_GALLERY_SEED_MISSING",
      "Home gallery rotation seed is required.",
    );
  }

  if (input.candidates.length < homeGallerySlotCount) {
    throw domainError(
      "HOME_GALLERY_COMPOSITION_SLOTS_INVALID",
      "Home gallery rotation requires at least five candidates.",
    );
  }

  const rankedCandidates = input.candidates
    .map((candidate) => ({
      ...candidate,
      orientation: orientationForDimensions(candidate.dimensions),
      score: deterministicScore(seed, candidate.id),
    }))
    .sort(compareRankedCandidates);
  const recentAssetIds = new Set(input.recentMediaAssetIds ?? []);
  const freshCandidates = rankedCandidates.filter(
    (candidate) => !recentAssetIds.has(candidate.id),
  );
  const pool =
    freshCandidates.length >= homeGallerySlotCount
      ? freshCandidates
      : rankedCandidates;
  const selected = pool.slice(0, homeGallerySlotCount);

  if (selected.length !== homeGallerySlotCount) {
    throw domainError(
      "HOME_GALLERY_COMPOSITION_SLOTS_INVALID",
      "Home gallery rotation could not fill every slot.",
    );
  }

  const layout = chooseLayout(selected);
  const mosaicVariant = chooseMosaicVariant(layout, seed, selected);
  const arranged = arrangeCandidatesForVariant(selected, mosaicVariant);

  return {
    layout,
    mosaicVariant,
    slots: arranged.map((candidate, index) => ({
      mediaAssetId: candidate.id,
      orientation: candidate.orientation,
      position: index + 1,
      slotKey: homeGallerySlotKeys[index] ?? "feature",
    })),
  };
}

export function orientationForDimensions(input: {
  height: number;
  width: number;
}): HomeGallerySlotOrientation {
  if (input.width <= 0 || input.height <= 0) {
    throw domainError(
      "HOME_GALLERY_SLOT_INVALID",
      "Home gallery image dimensions are invalid.",
    );
  }

  const ratio = input.width / input.height;

  if (ratio >= 1.15) {
    return "LANDSCAPE";
  }

  if (ratio <= 0.86) {
    return "PORTRAIT";
  }

  return "SQUARE";
}

function chooseLayout(
  candidates: readonly OrientedCandidate[],
): HomeGalleryLayout {
  const landscapeCount = candidates.filter(
    (candidate) => candidate.orientation === "LANDSCAPE",
  ).length;
  const portraitCount = candidates.filter(
    (candidate) => candidate.orientation === "PORTRAIT",
  ).length;

  if (portraitCount > landscapeCount) {
    return "PORTRAIT_LED";
  }

  if (landscapeCount > portraitCount) {
    return "LANDSCAPE_LED";
  }

  return "BALANCED";
}

function chooseMosaicVariant(
  layout: HomeGalleryLayout,
  seed: string,
  selected: readonly OrientedCandidate[],
): HomeGalleryMosaicVariant {
  const variants = mosaicVariantsByLayout[layout];
  const signature = selected
    .map((candidate) => `${candidate.id}:${candidate.orientation}`)
    .join("|");
  const index =
    deterministicScore(`${seed}:${layout}`, signature) % variants.length;

  return variants[index] ?? variants[0];
}

const mosaicVariantsByLayout = {
  BALANCED: ["BALANCED_CLASSIC", "BALANCED_RHYTHM", "BALANCED_STACK"],
  LANDSCAPE_LED: [
    "LANDSCAPE_HERO_LEFT",
    "LANDSCAPE_PANORAMA_TOP",
    "LANDSCAPE_WIDE_DUO",
  ],
  PORTRAIT_LED: [
    "PORTRAIT_COLUMNS",
    "PORTRAIT_EDITORIAL",
    "PORTRAIT_FEATURE_PAIR",
  ],
} satisfies Record<HomeGalleryLayout, readonly HomeGalleryMosaicVariant[]>;

const mosaicVariantTargets = {
  BALANCED_CLASSIC: [
    "LANDSCAPE",
    "PORTRAIT",
    "SQUARE",
    "LANDSCAPE",
    "PORTRAIT",
  ],
  BALANCED_RHYTHM: ["LANDSCAPE", "SQUARE", "PORTRAIT", "PORTRAIT", "LANDSCAPE"],
  BALANCED_STACK: ["PORTRAIT", "LANDSCAPE", "LANDSCAPE", "PORTRAIT", "SQUARE"],
  LANDSCAPE_HERO_LEFT: [
    "LANDSCAPE",
    "PORTRAIT",
    "PORTRAIT",
    "LANDSCAPE",
    "LANDSCAPE",
  ],
  LANDSCAPE_PANORAMA_TOP: [
    "LANDSCAPE",
    "LANDSCAPE",
    "PORTRAIT",
    "PORTRAIT",
    "LANDSCAPE",
  ],
  LANDSCAPE_WIDE_DUO: [
    "LANDSCAPE",
    "LANDSCAPE",
    "PORTRAIT",
    "LANDSCAPE",
    "PORTRAIT",
  ],
  PORTRAIT_COLUMNS: [
    "PORTRAIT",
    "PORTRAIT",
    "LANDSCAPE",
    "PORTRAIT",
    "LANDSCAPE",
  ],
  PORTRAIT_EDITORIAL: [
    "LANDSCAPE",
    "PORTRAIT",
    "PORTRAIT",
    "PORTRAIT",
    "LANDSCAPE",
  ],
  PORTRAIT_FEATURE_PAIR: [
    "PORTRAIT",
    "LANDSCAPE",
    "PORTRAIT",
    "LANDSCAPE",
    "PORTRAIT",
  ],
} satisfies Record<
  HomeGalleryMosaicVariant,
  readonly HomeGallerySlotOrientation[]
>;

function arrangeCandidatesForVariant(
  candidates: readonly OrientedCandidate[],
  mosaicVariant: HomeGalleryMosaicVariant,
): OrientedCandidate[] {
  const targets = mosaicVariantTargets[mosaicVariant];
  const arranged: OrientedCandidate[] = [];

  for (const target of targets) {
    arranged.push(takeCandidate(candidates, arranged, target));
  }

  return arranged;
}

function takeCandidate(
  pool: readonly OrientedCandidate[],
  selected: readonly OrientedCandidate[],
  target: HomeGallerySlotOrientation,
) {
  const selectedIds = new Set(selected.map((candidate) => candidate.id));
  const available = pool.filter((candidate) => !selectedIds.has(candidate.id));
  const candidate = [...available].sort(
    (left, right) =>
      orientationDistance(left.orientation, target) -
        orientationDistance(right.orientation, target) ||
      left.score - right.score ||
      left.id.localeCompare(right.id),
  )[0];

  if (!candidate) {
    throw domainError(
      "HOME_GALLERY_COMPOSITION_SLOTS_INVALID",
      "Home gallery rotation could not fill every slot.",
    );
  }

  return candidate;
}

function orientationDistance(
  candidate: HomeGallerySlotOrientation,
  target: HomeGallerySlotOrientation,
) {
  if (candidate === target) {
    return 0;
  }

  if (candidate === "SQUARE" || target === "SQUARE") {
    return 1;
  }

  return 2;
}

function compareRankedCandidates(
  left: OrientedCandidate,
  right: OrientedCandidate,
) {
  if (left.score !== right.score) {
    return left.score - right.score;
  }

  return left.id.localeCompare(right.id);
}

function deterministicScore(seed: string, id: string) {
  const value = `${seed}:${id}`;
  let hash = 2_166_136_261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}
