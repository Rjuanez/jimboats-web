import { adminEs } from "@/i18n/admin/es";
import { LocalBookingNotice } from "@/components/sections/seo/LocalBookingNotice";
import { getHourlyBookingConfig } from "@/interface/next/config/hourlyBookingConfig";
import { RootDocument } from "@/components/layout/RootDocument";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: adminEs["Admin"],
  robots: {
    follow: false,
    index: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <RootDocument locale="es">
      {getHourlyBookingConfig().simulation && <LocalBookingNotice />}
      {children}
    </RootDocument>
  );
}
