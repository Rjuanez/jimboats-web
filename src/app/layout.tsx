import type { Metadata } from "next";
import { Caveat_Brush, Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_DOMAIN ? `https://${process.env.APP_DOMAIN}` : "http://localhost:3000",
  ),
  title: {
    default: "JimBoats",
    template: "%s | JimBoats",
  },
  description: "Private boat experiences in Barcelona with JimBoats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveatBrush.variable}`}>
        {children}
      </body>
    </html>
  );
}
