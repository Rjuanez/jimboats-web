import { describe, expect, it, vi } from "vitest";

import {
  loadPublicBookingCatalog,
  PUBLIC_BOOKING_CATALOG_CACHE_TAG,
  revalidatePublicBookingCatalogCache,
} from "./publicBookingCatalogCache";
import { getPublicBookingPage } from "../presenters/publicBookingPresenter";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((loader) => loader),
  updateTag: vi.fn(),
}));

vi.mock("../presenters/publicBookingPresenter", () => ({
  getPublicBookingPage: vi.fn(),
}));

describe("publicBookingCatalogCache", () => {
  it("loads the public booking catalog without availability", async () => {
    vi.mocked(getPublicBookingPage).mockResolvedValue({
      experiences: [],
    } as never);

    await loadPublicBookingCatalog("en");

    expect(getPublicBookingPage).toHaveBeenCalledWith("en", {
      includeAvailability: false,
    });
  });

  it("invalidates the tagged catalog and localized landing paths", async () => {
    const { revalidatePath, updateTag } = await import("next/cache");

    revalidatePublicBookingCatalogCache();

    expect(updateTag).toHaveBeenCalledWith(PUBLIC_BOOKING_CATALOG_CACHE_TAG);
    expect(revalidatePath).toHaveBeenCalledWith("/en");
    expect(revalidatePath).toHaveBeenCalledWith("/es");
    expect(revalidatePath).toHaveBeenCalledWith("/ca");
  });
});
