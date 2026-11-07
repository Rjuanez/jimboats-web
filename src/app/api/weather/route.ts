import { NextResponse } from "next/server";
import { marketingLocales } from "@/content/marketing/routes";
import {
  getPortWeather,
  getPortSunTimes,
} from "@/interface/next/presenters/weatherPresenter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestedLocale = new URL(request.url).searchParams.get("locale");
  const locale = marketingLocales.find((value) => value === requestedLocale);
  if (!locale) return NextResponse.json({ weather: null }, { status: 400 });
  if (new URL(request.url).searchParams.get("view") === "sun") {
    const sun = await getPortSunTimes(locale);
    return NextResponse.json(
      { sun },
      { status: sun ? 200 : 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const weather = await getPortWeather(locale);
  return NextResponse.json(
    { weather },
    {
      status: weather ? 200 : 503,
      headers: {
        "Cache-Control": weather ? "public, max-age=300" : "public, max-age=60",
      },
    },
  );
}
