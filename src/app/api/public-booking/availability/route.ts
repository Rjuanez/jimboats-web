import { NextResponse } from "next/server";
import { ApplicationError } from "@/shared/application/ApplicationError";

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
    const month = url.searchParams.get("month") ?? "current";
    if (month !== "current" && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    if (!Number.isInteger(duration) || duration < 1 || duration > 6)
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    try {
      const availability = await getHourlyPublicBookingAvailability(
        rawLocale,
        id,
        duration,
        month,
      );
      return NextResponse.json(
        { availability },
        { status: availability ? 200 : 404, headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      if (error instanceof ApplicationError && error.code === "CALENDAR_DATE_RANGE_INVALID")
        return NextResponse.json({ error: "Invalid month" }, { status: 400 });
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
