"use client";

import { useBookingWhatsAppMeasurement } from "./BookingPrivacyPreferences";
import { WhatsAppIcon } from "../seo/WhatsAppIcon";
import type { PublicBookingContent } from "./PublicBookingTypes";

export function BookingWhatsAppHelp({
  link,
}: {
  link: PublicBookingContent["support"]["whatsapp"];
}) {
  const recordClick = useBookingWhatsAppMeasurement();
  if (!link) return null;
  return (
    <a
      href={link.href}
      onClick={recordClick}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-700/40 bg-white px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
    >
      <WhatsAppIcon className="size-4" />
      {link.label}
    </a>
  );
}
