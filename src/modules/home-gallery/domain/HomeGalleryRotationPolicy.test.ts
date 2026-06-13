import { describe, expect, it } from "vitest";

import {
  orientationForDimensions,
  selectHomeGalleryRotation,
} from "./HomeGalleryRotationPolicy";

describe("HomeGalleryRotationPolicy", () => {
  it("selects five deterministic slots from ready candidates", () => {
    const first = selectHomeGalleryRotation({
      candidates: candidates(),
      seed: "automatic:2026-06-13T09:00:00.000Z",
    });
    const second = selectHomeGalleryRotation({
      candidates: candidates(),
      seed: "automatic:2026-06-13T09:00:00.000Z",
    });

    expect(first).toEqual(second);
    expect(first.slots).toHaveLength(5);
    expect(first.mosaicVariant).toEqual(second.mosaicVariant);
    expect(new Set(first.slots.map((slot) => slot.mediaAssetId)).size).toBe(5);
  });

  it("prefers fresh assets when the pool is large enough", () => {
    const selection = selectHomeGalleryRotation({
      candidates: candidates(),
      recentMediaAssetIds: [
        "asset-1",
        "asset-2",
        "asset-3",
        "asset-4",
        "asset-5",
      ],
      seed: "automatic:2026-06-13T10:00:00.000Z",
    });

    expect(selection.slots.map((slot) => slot.mediaAssetId)).not.toContain(
      "asset-1",
    );
  });

  it("classifies image orientation from dimensions", () => {
    expect(orientationForDimensions({ height: 700, width: 1200 })).toBe(
      "LANDSCAPE",
    );
    expect(orientationForDimensions({ height: 1200, width: 700 })).toBe(
      "PORTRAIT",
    );
    expect(orientationForDimensions({ height: 1000, width: 1000 })).toBe(
      "SQUARE",
    );
  });

  it("uses a landscape mosaic family when the selected images are mostly horizontal", () => {
    const selection = selectHomeGalleryRotation({
      candidates: [
        candidate("landscape-1", 1400, 900),
        candidate("landscape-2", 1600, 900),
        candidate("landscape-3", 1500, 900),
        candidate("landscape-4", 1300, 900),
        candidate("landscape-5", 1200, 800),
      ],
      seed: "automatic:2026-06-13T11:00:00.000Z",
    });

    expect(selection.layout).toBe("LANDSCAPE_LED");
    expect(selection.mosaicVariant).toMatch(/^LANDSCAPE_/);
  });

  it("uses a portrait mosaic family when the selected images are mostly vertical", () => {
    const selection = selectHomeGalleryRotation({
      candidates: [
        candidate("portrait-1", 900, 1400),
        candidate("portrait-2", 900, 1600),
        candidate("portrait-3", 900, 1500),
        candidate("portrait-4", 800, 1200),
        candidate("portrait-5", 900, 1300),
      ],
      seed: "automatic:2026-06-13T12:00:00.000Z",
    });

    expect(selection.layout).toBe("PORTRAIT_LED");
    expect(selection.mosaicVariant).toMatch(/^PORTRAIT_/);
  });

  it("uses a balanced mosaic family when selected images are mixed evenly", () => {
    const selection = selectHomeGalleryRotation({
      candidates: [
        candidate("landscape-1", 1400, 900),
        candidate("landscape-2", 1600, 900),
        candidate("portrait-1", 900, 1400),
        candidate("portrait-2", 900, 1600),
        candidate("square-1", 1000, 1000),
      ],
      seed: "automatic:2026-06-13T13:00:00.000Z",
    });

    expect(selection.layout).toBe("BALANCED");
    expect(selection.mosaicVariant).toMatch(/^BALANCED_/);
  });

  it("places selected images into slots that prefer matching orientations", () => {
    const selection = selectHomeGalleryRotation({
      candidates: [
        candidate("portrait-1", 900, 1400),
        candidate("portrait-2", 900, 1600),
        candidate("portrait-3", 900, 1500),
        candidate("landscape-1", 1400, 900),
        candidate("landscape-2", 1600, 900),
      ],
      seed: "automatic:2026-06-13T14:00:00.000Z",
    });

    expect(selection.layout).toBe("PORTRAIT_LED");
    expect(
      selection.slots.filter((slot) => slot.orientation === "PORTRAIT"),
    ).toHaveLength(3);
    expect(
      selection.slots.filter((slot) => slot.orientation === "LANDSCAPE"),
    ).toHaveLength(2);
  });
});

function candidates() {
  return [
    candidate("asset-1", 1400, 900),
    candidate("asset-2", 900, 1400),
    candidate("asset-3", 1000, 1000),
    candidate("asset-4", 1600, 900),
    candidate("asset-5", 900, 1300),
    candidate("asset-6", 1500, 900),
    candidate("asset-7", 1000, 1000),
    candidate("asset-8", 1300, 900),
    candidate("asset-9", 900, 1400),
    candidate("asset-10", 1200, 900),
  ];
}

function candidate(id: string, width: number, height: number) {
  return {
    dimensions: {
      height,
      width,
    },
    id,
  };
}
