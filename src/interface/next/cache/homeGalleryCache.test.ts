import { describe, expect, it, vi } from "vitest";

import { getContainer } from "@/container";

import {
  HOME_GALLERY_CACHE_TAG,
  loadPublishedHomeGallery,
  revalidateHomeGalleryCache,
} from "./homeGalleryCache";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((loader) => loader),
  updateTag: vi.fn(),
}));

vi.mock("@/container", () => ({
  getContainer: vi.fn(),
}));

describe("homeGalleryCache", () => {
  it("loads the published home gallery through the container", async () => {
    const getPublished = vi.fn().mockResolvedValue(null);

    vi.mocked(getContainer).mockReturnValue({
      publicHomeGallery: {
        getPublished,
      },
    } as never);

    await loadPublishedHomeGallery("en");

    expect(getPublished).toHaveBeenCalledWith();
  });

  it("invalidates the tagged gallery and localized landing paths", async () => {
    const { revalidatePath, updateTag } = await import("next/cache");

    revalidateHomeGalleryCache();

    expect(updateTag).toHaveBeenCalledWith(HOME_GALLERY_CACHE_TAG);
    expect(revalidatePath).toHaveBeenCalledWith("/en");
    expect(revalidatePath).toHaveBeenCalledWith("/es");
    expect(revalidatePath).toHaveBeenCalledWith("/ca");
  });
});
