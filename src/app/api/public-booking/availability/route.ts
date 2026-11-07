import { NextResponse } from "next/server";

import { isMarketingLocale } from "@/content/marketing/routes";
import { getHourlyPublicBookingAvailability } from "@/interface/next/presenters/hourlyPublicBookingPresenter";
import { parsePublicLocale } from "@/i18n/locales";
import { getPublicBookingAvailability } from "@/interface/next/presenters/publicBookingPresenter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLocale = url.searchParams.get("locale") ?? "";
  const locale = parsePublicLocale(rawLocale);
  const hours = url.searchParams.get("hours");
  if (hours !== null && isMarketingLocale(rawLocale)) {
    const duration = Number(hours);
    const id = url.searchParams.get("experienceId") ?? "";
    if (!Number.isInteger(duration) || duration < 1 || duration > 6)
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    try {
      const availability = await getHourlyPublicBookingAvailability(
        rawLocale,
        id,
        duration,
      );
      return NextResponse.json(
        { availability },
        { status: availability ? 200 : 404 },
      );
    } catch {
      return NextResponse.json(
        { error: "Availability unavailable" },
        { status: 503 },
      );
    }
  }
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
