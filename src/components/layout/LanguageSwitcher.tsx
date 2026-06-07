"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/design/variants";
import {
  createLocalizedEquivalentPath,
  defaultLocale,
  parsePublicLocale,
  supportedLocales,
  type PublicLocale,
} from "@/i18n/locales";

type LanguageSwitcherProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: "glass" | "solid";
};

const localeLabels = {
  ca: "CA",
  en: "EN",
  es: "ES",
} satisfies Record<PublicLocale, string>;

export function LanguageSwitcher({
  className,
  onNavigate,
  variant = "solid",
}: LanguageSwitcherProps) {
  const pathname = usePathname() || `/${defaultLocale}`;
  const searchParams = useSearchParams();
  const activeLocale = parsePublicLocale(pathname.split("/")[1] ?? "") ?? defaultLocale;
  const search = searchParams?.toString() ?? "";

  return (
    <nav aria-label="Language" className={cn("shrink-0", className)}>
      <ul
        className={cn(
          "flex items-center rounded-full border p-0.5 text-[11px] font-semibold uppercase tracking-widest",
          variant === "glass"
            ? "border-white/25 bg-white/10 text-white backdrop-blur-md"
            : "border-sand/45 bg-white text-text shadow-sm",
        )}
      >
        {supportedLocales.map((locale) => {
          const localizedPath = createLocalizedEquivalentPath(locale, pathname);
          const href = search ? `${localizedPath}?${search}` : localizedPath;
          const active = locale === activeLocale;

          return (
            <li key={locale}>
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-8 min-w-9 items-center justify-center rounded-full px-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  variant === "glass"
                    ? "focus-visible:outline-white"
                    : "focus-visible:outline-text",
                  active
                    ? variant === "glass"
                      ? "bg-white text-text"
                      : "bg-text text-white"
                    : variant === "glass"
                      ? "text-white/85 hover:bg-white/15 hover:text-white"
                      : "text-text-muted hover:bg-sand/25 hover:text-text",
                )}
                href={href}
                onClick={onNavigate}
              >
                {localeLabels[locale]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
