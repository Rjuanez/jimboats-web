import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { resolvePreferredLocale } from "@/i18n/locales";

export default async function HomePage() {
  const requestHeaders = await headers();
  const locale = resolvePreferredLocale(requestHeaders.get("accept-language"));

  redirect(`/${locale}`);
}
