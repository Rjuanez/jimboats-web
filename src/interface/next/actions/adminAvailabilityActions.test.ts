import { beforeEach, expect, it, vi } from "vitest";
const updateAvailability = vi.hoisted(() => vi.fn());
vi.mock("@/container", () => ({
  getContainer: () => ({ adminExperiences: { updateAvailability } }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../cache/publicBookingCatalogCache", () => ({
  revalidatePublicBookingCatalogCache: vi.fn(),
}));
import { saveAdminAvailability } from "./adminAvailabilityActions";
const input = {
  experienceId: "daytrip",
  bufferMinutes: 15,
  minimumAdvanceMinutes: 60,
  maximumAdvanceMonths: 6,
  allowsManualScheduling: true,
  mode: "ANY_AVAILABLE",
  startTime: "10:00",
  endTime: "20:00",
  granularityMinutes: 30,
  slots: [],
};
beforeEach(() => vi.clearAllMocks());
it("saves only availability and ignores editorial values", async () => {
  updateAvailability.mockResolvedValue({});
  expect(
    await saveAdminAvailability({
      ...input,
      internalName: "Changed",
      basePrice: 0,
    }),
  ).toEqual({ ok: true });
  expect(updateAvailability).toHaveBeenCalledOnce();
  expect(updateAvailability.mock.calls[0][0]).not.toHaveProperty(
    "internalName",
  );
  expect(updateAvailability.mock.calls[0][0]).not.toHaveProperty("basePrice");
});
it("does not persist invalid input", async () => {
  expect(
    (await saveAdminAvailability({ ...input, bufferMinutes: -1 })).ok,
  ).toBe(false);
  expect(updateAvailability).not.toHaveBeenCalled();
});
