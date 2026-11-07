"use server";
import { revalidatePath } from "next/cache";
import { getContainer } from "@/container";
import type { AvailabilitySaveResult } from "@/components/sections/admin-availability/AdminAvailabilityTypes";
import { parseAdminAvailability } from "../validators/adminAvailabilityValidators";
import { presentAdminError } from "../presenters/adminErrorPresenter";
import { revalidatePublicBookingCatalogCache } from "../cache/publicBookingCatalogCache";
export async function saveAdminAvailability(
  input: unknown,
): Promise<AvailabilitySaveResult> {
  try {
    const command = parseAdminAvailability(input);
    await getContainer().adminExperiences.updateAvailability(command);
    revalidatePublicBookingCatalogCache();
    revalidatePath("/admin/availability");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: presentAdminError(error) };
  }
}
