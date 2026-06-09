import { NextResponse } from "next/server";

import { parsePublicLocale } from "@/i18n/locales";
import { getPublicBookingAvailability } from "@/interface/next/presenters/publicBookingPresenter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = parsePublicLocale(url.searchParams.get("locale") ?? "");
  const experienceId = url.searchParams.get("experienceId")?.trim();

  if (!locale || !experienceId) {
    return NextResponse.json(
      {
        error: "Missing or invalid booking availability query.",
      },
      {
        status: 400,
      },
    );
  }

  const availability = await getPublicBookingAvailability({
    experienceId,
    locale,
  });

  if (!availability) {
    return NextResponse.json(
      {
        error: "Availability was not found for this experience.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({ availability });
}
