import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { resolvePreferredMarketingLocale } from "@/content/marketing/routes";

export default async function HomePage() {
  const requestHeaders = await headers();
  const locale = resolvePreferredMarketingLocale(requestHeaders.get("accept-language"));

  redirect(`/${locale}`);
}
